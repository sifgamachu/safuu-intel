import { readFile, readdir } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto';
import { fuzzystrmatch } from '@electric-sql/pglite/contrib/fuzzystrmatch';
import { pg_trgm } from '@electric-sql/pglite/contrib/pg_trgm';

export async function testDatabase() {
  const db = new PGlite({ extensions: { pgcrypto, fuzzystrmatch, pg_trgm } });
  await prepareDatabase(db);
  return db;
}
export async function prepareDatabase(db) {
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
    CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY);
    CREATE SCHEMA storage; CREATE TABLE storage.buckets(id text PRIMARY KEY,name text,public boolean,
      file_size_limit bigint,allowed_mime_types text[]);
    -- Managed Storage reads metadata through its own provider connection.
    GRANT USAGE ON SCHEMA storage TO service_role;
    GRANT SELECT ON storage.buckets TO service_role;`);
  await db.exec(await readFile(new URL('../supabase/001_schema.sql', import.meta.url), 'utf8'));
  const migrations = new URL('../supabase/migrations/', import.meta.url);
  for (const file of (await readdir(migrations)).filter((name) => name.endsWith('.sql')).sort())
    await db.exec(await readFile(new URL(file, migrations), 'utf8'));
}
export async function call(db, name, args = {}) {
  if (!/^sf_[a-z_]+$/.test(name) || Object.keys(args).some((k) => !/^p_[a-z_]+$/.test(k)))
    throw new Error('Invalid RPC');
  const keys = Object.keys(args);
  if (name === 'sf_claim_jobs') {
    return (
      await db.query(
        `SELECT * FROM public.${name}(${keys.map((k, i) => `${k} => $${i + 1}`).join(',')})`,
        Object.values(args),
      )
    ).rows;
  }
  const result = await db.query(
    `SELECT public.${name}(${keys.map((k, i) => `${k} => $${i + 1}`).join(',')}) AS value`,
    Object.values(args),
  );
  return result.rows[0]?.value;
}
