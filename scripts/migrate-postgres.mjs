import { readdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { getSql } from '../db/connection.mjs';
const sql = getSql();
try {
  const dir = new URL('../drizzle-postgres/', import.meta.url);
  const files = (await readdir(dir)).filter((f) => /^\d+.*\.sql$/.test(f)).sort();
  if (!files.length) throw new Error('No PostgreSQL migrations found.');
  // One transaction and an advisory lock protect concurrent deployment attempts.
  await sql.begin(async (tx) => {
    await tx`SELECT pg_advisory_xact_lock(742910837)`;
    await tx`CREATE TABLE IF NOT EXISTS bcs_migrations (name text PRIMARY KEY, hash text NOT NULL)`;
    for (const name of files) {
      const source = await readFile(new URL(name, dir), 'utf8');
      const hash = createHash('sha256').update(source).digest('hex');
      const [existing] = await tx`SELECT hash FROM bcs_migrations WHERE name = ${name}`;
      if (existing) {
        if (existing.hash !== hash) throw new Error('An applied migration has changed: ' + name);
        continue;
      }
      for (const statement of source.split('--> statement-breakpoint').filter((s) => s.trim()))
        await tx.unsafe(statement);
      await tx`INSERT INTO bcs_migrations (name, hash) VALUES (${name}, ${hash})`;
    }
  });
  console.log('PostgreSQL migrations are up to date.');
} finally {
  await sql.end();
}
