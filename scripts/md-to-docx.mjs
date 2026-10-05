import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { crc32 } from 'node:zlib';

const inputDir = process.argv[2];
const outputDir = process.argv[3] ?? inputDir;

function xmlEscape(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function wt(text) {
  const value = xmlEscape(text);
  if (value === '') return '<w:t></w:t>';
  return `<w:t xml:space="preserve">${value}</w:t>`;
}

function paragraph(text, style) {
  const pStyle = style ? `<w:pPr><w:pStyle w:val="${style}"/></w:pPr>` : '';
  return `<w:p>${pStyle}<w:r>${wt(text)}</w:r></w:p>`;
}

function codeParagraph(text) {
  return `<w:p><w:pPr><w:pStyle w:val="Code"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/><w:sz w:val="18"/></w:rPr>${wt(text)}</w:r></w:p>`;
}

function listItem(text) {
  return `<w:p><w:pPr><w:pStyle w:val="ListBullet"/></w:pPr><w:r>${wt(text)}</w:r></w:p>`;
}

function table(rows) {
  const width = 9000;
  const colWidth = Math.floor(width / Math.max(rows[0]?.length ?? 1, 1));
  const grid = `<w:tblGrid>${(rows[0] ?? []).map(() => `<w:gridCol w:w="${colWidth}"/>`).join('')}</w:tblGrid>`;
  const body = rows
    .map(
      (row, rowIndex) =>
        `<w:tr>${row
          .map((cell) => {
            const fill = rowIndex === 0 ? '<w:shd w:val="clear" w:fill="F2F2F2"/>' : '';
            return `<w:tc><w:tcPr><w:tcW w:w="${colWidth}" w:type="dxa"/>${fill}</w:tcPr><w:p><w:r>${wt(cell)}</w:r></w:p></w:tc>`;
          })
          .join('')}</w:tr>`,
    )
    .join('');
  return `<w:tbl><w:tblPr><w:tblW w:w="${width}" w:type="dxa"/><w:tblBorders><w:top w:val="single" w:sz="4" w:color="999999"/><w:left w:val="single" w:sz="4" w:color="999999"/><w:bottom w:val="single" w:sz="4" w:color="999999"/><w:right w:val="single" w:sz="4" w:color="999999"/><w:insideH w:val="single" w:sz="4" w:color="999999"/><w:insideV w:val="single" w:sz="4" w:color="999999"/></w:tblBorders></w:tblPr>${grid}${body}</w:tbl>`;
}

function markdownToDocumentXml(markdown) {
  const lines = markdown.replaceAll('\r\n', '\n').split('\n');
  const parts = [];
  let inCode = false;
  let tableRows = [];

  const flushTable = () => {
    if (tableRows.length > 0) {
      parts.push(table(tableRows));
      tableRows = [];
    }
  };

  for (const raw of lines) {
    const line = raw;
    if (line.startsWith('```')) {
      flushTable();
      inCode = !inCode;
      continue;
    }
    if (inCode) {
      parts.push(codeParagraph(line));
      continue;
    }
    if (line.startsWith('|') && line.includes('|', 1)) {
      const cells = line
        .split('|')
        .slice(1, -1)
        .map((cell) => cell.trim());
      if (cells.every((cell) => /^:?-+:?$/.test(cell))) continue;
      tableRows.push(cells);
      continue;
    }
    flushTable();
    if (line.startsWith('# ')) {
      parts.push(paragraph(line.slice(2), 'Heading1'));
      continue;
    }
    if (line.startsWith('## ')) {
      parts.push(paragraph(line.slice(3), 'Heading2'));
      continue;
    }
    if (line.startsWith('### ')) {
      parts.push(paragraph(line.slice(4), 'Heading3'));
      continue;
    }
    if (line.startsWith('#### ')) {
      parts.push(paragraph(line.slice(5), 'Heading4'));
      continue;
    }
    if (line === '---') {
      parts.push('<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="CCCCCC"/></w:pBdr></w:pPr></w:p>');
      continue;
    }
    if (line.startsWith('- ')) {
      parts.push(listItem(line.slice(2).replaceAll('**', '')));
      continue;
    }
    if (line.trim() === '') {
      parts.push('<w:p/>');
      continue;
    }
    parts.push(paragraph(line.replaceAll('**', '').replaceAll('`', '')));
  }
  flushTable();

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${parts.join('\n')}
    <w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/></w:sectPr>
  </w:body>
</w:document>`;
}

const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`;

const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

const docRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="240" w:after="120"/></w:pPr><w:rPr><w:b/><w:sz w:val="36"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="200" w:after="80"/></w:pPr><w:rPr><w:b/><w:sz w:val="28"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="heading 3"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="160" w:after="80"/></w:pPr><w:rPr><w:b/><w:sz w:val="24"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading4"><w:name w:val="heading 4"/><w:basedOn w:val="Normal"/><w:rPr><w:b/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="ListBullet"><w:name w:val="List Bullet"/><w:basedOn w:val="Normal"/><w:pPr><w:ind w:left="420"/><w:spacing w:after="40"/></w:pPr></w:style>
  <w:style w:type="paragraph" w:styleId="Code"><w:name w:val="Code"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:after="0"/></w:pPr></w:style>
</w:styles>`;

function dosDateTime(date = new Date()) {
  const dosTime =
    (date.getSeconds() >> 1) | (date.getMinutes() << 5) | (date.getHours() << 11);
  const dosDate =
    date.getDate() | ((date.getMonth() + 1) << 5) | ((date.getFullYear() - 1980) << 9);
  return { dosTime, dosDate };
}

function writeZip(filePath, files) {
  const { dosTime, dosDate } = dosDateTime();
  const chunks = [];
  const centrals = [];
  let offset = 0;

  const u16 = (n) => {
    const b = Buffer.alloc(2);
    b.writeUInt16LE(n);
    return b;
  };
  const u32 = (n) => {
    const b = Buffer.alloc(4);
    b.writeUInt32LE(n);
    return b;
  };

  for (const [name, content] of Object.entries(files)) {
    const data = Buffer.from(content, 'utf8');
    const nameBuf = Buffer.from(name, 'utf8');
    const crc = crc32(data) >>> 0;
    const local = Buffer.concat([
      Buffer.from([0x50, 0x4b, 0x03, 0x04]),
      u16(20),
      u16(0),
      u16(0),
      u16(dosTime),
      u16(dosDate),
      u32(crc),
      u32(data.length),
      u32(data.length),
      u16(nameBuf.length),
      u16(0),
      nameBuf,
      data,
    ]);
    chunks.push(local);
    const central = Buffer.concat([
      Buffer.from([0x50, 0x4b, 0x01, 0x02]),
      u16(20),
      u16(20),
      u16(0),
      u16(0),
      u16(dosTime),
      u16(dosDate),
      u32(crc),
      u32(data.length),
      u32(data.length),
      u16(nameBuf.length),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(0),
      u32(offset),
      nameBuf,
    ]);
    centrals.push(central);
    offset += local.length;
  }

  const centralDir = Buffer.concat(centrals);
  const eocd = Buffer.concat([
    Buffer.from([0x50, 0x4b, 0x05, 0x06]),
    u16(0),
    u16(0),
    u16(centrals.length),
    u16(centrals.length),
    u32(centralDir.length),
    u32(offset),
    u16(0),
  ]);
  writeFileSync(filePath, Buffer.concat([...chunks, centralDir, eocd]));
}

mkdirSync(outputDir, { recursive: true });

for (const file of readdirSync(inputDir)) {
  if (!file.endsWith('.md') || file === 'README.md') continue;
  const markdown = readFileSync(join(inputDir, file), 'utf8');
  const document = markdownToDocumentXml(markdown);
  const out = join(outputDir, `${basename(file, '.md')}.docx`);
  writeZip(out, {
    '[Content_Types].xml': contentTypes,
    '_rels/.rels': rels,
    'word/document.xml': document,
    'word/_rels/document.xml.rels': docRels,
    'word/styles.xml': styles,
  });
  console.log(basename(out));
}
