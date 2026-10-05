import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

const inputDir = process.argv[2];
const outputDir = process.argv[3];

if (!inputDir || !outputDir) {
  console.error('Usage: node md-to-html.mjs <inputDir> <outputDir>');
  process.exit(1);
}

mkdirSync(outputDir, { recursive: true });

function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function inline(text) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

function convert(markdown) {
  const lines = markdown.replaceAll('\r\n', '\n').split('\n');
  const html = [];
  let inCode = false;
  let inList = false;
  let inTable = false;

  const closeList = () => {
    if (inList) {
      html.push('</ul>');
      inList = false;
    }
  };
  const closeTable = () => {
    if (inTable) {
      html.push('</table>');
      inTable = false;
    }
  };

  for (const line of lines) {
    if (line.startsWith('```')) {
      closeList();
      closeTable();
      if (inCode) {
        html.push('</pre>');
        inCode = false;
      } else {
        html.push('<pre>');
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      html.push(`${escapeHtml(line)}\n`);
      continue;
    }
    if (line.startsWith('|') && line.includes('|', 1)) {
      closeList();
      const cells = line
        .split('|')
        .slice(1, -1)
        .map((cell) => cell.trim());
      if (cells.every((cell) => /^:?-+:?$/.test(cell))) {
        continue;
      }
      if (!inTable) {
        html.push('<table>');
        html.push(
          `<tr>${cells.map((cell) => `<th>${inline(cell)}</th>`).join('')}</tr>`,
        );
        inTable = true;
      } else {
        html.push(
          `<tr>${cells.map((cell) => `<td>${inline(cell)}</td>`).join('')}</tr>`,
        );
      }
      continue;
    }
    closeTable();
    if (line.startsWith('# ')) {
      closeList();
      html.push(`<h1>${inline(line.slice(2))}</h1>`);
      continue;
    }
    if (line.startsWith('## ')) {
      closeList();
      html.push(`<h2>${inline(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith('### ')) {
      closeList();
      html.push(`<h3>${inline(line.slice(4))}</h3>`);
      continue;
    }
    if (line.startsWith('#### ')) {
      closeList();
      html.push(`<h4>${inline(line.slice(5))}</h4>`);
      continue;
    }
    if (line === '---') {
      closeList();
      html.push('<hr />');
      continue;
    }
    if (line.startsWith('- ')) {
      if (!inList) {
        html.push('<ul>');
        inList = true;
      }
      html.push(`<li>${inline(line.slice(2))}</li>`);
      continue;
    }
    if (/^\d+\.\s/.test(line)) {
      closeList();
      html.push(`<p>${inline(line)}</p>`);
      continue;
    }
    if (line.trim() === '') {
      closeList();
      continue;
    }
    closeList();
    html.push(`<p>${inline(line)}</p>`);
  }
  closeList();
  closeTable();
  if (inCode) html.push('</pre>');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Supercore Commerce OS</title>
<style>
  body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.4; color: #111; }
  h1 { font-size: 20pt; }
  h2 { font-size: 16pt; margin-top: 18pt; }
  h3 { font-size: 13pt; }
  table { border-collapse: collapse; width: 100%; margin: 12pt 0; }
  th, td { border: 1px solid #999; padding: 4pt 6pt; vertical-align: top; }
  th { background: #f2f2f2; text-align: left; }
  pre { background: #f6f6f6; padding: 8pt; font-family: Consolas, monospace; font-size: 9pt; white-space: pre-wrap; }
  code { font-family: Consolas, monospace; font-size: 9pt; }
</style>
</head>
<body>
${html.join('\n')}
</body>
</html>`;
}

for (const file of readdirSync(inputDir)) {
  if (!file.endsWith('.md') || file === 'README.md') continue;
  const markdown = readFileSync(join(inputDir, file), 'utf8');
  const htmlName = basename(file, '.md') + '.html';
  writeFileSync(join(outputDir, htmlName), convert(markdown), 'utf8');
  console.log(htmlName);
}
