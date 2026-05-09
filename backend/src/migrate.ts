import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import bcrypt from "bcryptjs";
import { pool } from "./db.js";

const here = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(here, "..", "migrations");

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name       TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function appliedMigrations(): Promise<Set<string>> {
  const { rows } = await pool.query<{ name: string }>("SELECT name FROM _migrations");
  return new Set(rows.map(r => r.name));
}

async function listMigrations(): Promise<string[]> {
  const files = await readdir(migrationsDir);
  return files.filter(f => f.endsWith(".sql")).sort();
}

async function applyMigration(name: string) {
  const sql = await readFile(join(migrationsDir, name), "utf8");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(sql);
    await client.query("INSERT INTO _migrations (name) VALUES ($1)", [name]);
    await client.query("COMMIT");
    console.log(`✓ applied ${name}`);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function ensureDefaultUser() {
  const email = process.env.SEED_USER_EMAIL ?? "eve@frieswings.com";
  const password = process.env.SEED_USER_PASSWORD ?? "atrium";
  const name = process.env.SEED_USER_NAME ?? "Eve Holt";
  const exists = await pool.query("SELECT 1 FROM users WHERE email = $1", [email]);
  if (exists.rowCount && exists.rowCount > 0) return;
  const hash = await bcrypt.hash(password, 10);
  await pool.query(
    "INSERT INTO users (email, name, role, password_hash) VALUES ($1, $2, 'admin', $3)",
    [email, name, hash]
  );
  console.log(`✓ seeded default user ${email}`);
}

export async function runMigrations() {
  await ensureMigrationsTable();
  const applied = await appliedMigrations();
  for (const name of await listMigrations()) {
    if (!applied.has(name)) await applyMigration(name);
  }
  await ensureDefaultUser();
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirectRun) {
  runMigrations()
    .then(() => pool.end())
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}
