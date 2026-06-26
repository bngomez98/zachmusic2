import fs from "fs/promises";
import path from "path";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("Missing DATABASE_URL. Set it before running migrations.");
  process.exit(1);
}

async function run() {
  const pool = new Pool({ connectionString: DATABASE_URL });
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id BIGSERIAL PRIMARY KEY,
        filename TEXT NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    const migrationsDir = path.join(process.cwd(), "db", "migrations");
    const files = await fs.readdir(migrationsDir);
    const sqlFiles = files.filter((f) => f.endsWith(".sql")).sort();

    for (const f of sqlFiles) {
      const applied = await pool.query(
        "SELECT 1 FROM schema_migrations WHERE filename = $1",
        [f]
      );
      if (applied.rowCount > 0) {
        console.log("Skipping migration:", f);
        continue;
      }

      const client = await pool.connect();
      try {
        const migrationPath = path.join(migrationsDir, f);
        const sql = await fs.readFile(migrationPath, "utf8");
        console.log("Applying migration:", f);
        await client.query("BEGIN");
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [f]);
        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }
    }

    console.log("Migrations applied.");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

run();
