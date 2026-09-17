import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { getEnv } from '../env.js';
import { schema } from './schema.js';

type Sql = ReturnType<typeof postgres>;

let sql: Sql | undefined;
let db: ReturnType<typeof drizzle<typeof schema>> | undefined;

export function getSql(): Sql {
  if (!sql) {
    sql = postgres(getEnv().DATABASE_URL, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  }
  return sql;
}

export function getDb() {
  if (!db) {
    db = drizzle(getSql(), { schema });
  }
  return db;
}

export async function pingDatabase(): Promise<void> {
  await getSql()`select 1`;
}

export async function closeDatabase(): Promise<void> {
  if (sql) {
    await sql.end({ timeout: 5 });
    sql = undefined;
    db = undefined;
  }
}
