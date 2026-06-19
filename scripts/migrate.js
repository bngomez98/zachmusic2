// ESM script to run migrations file(s)
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
    const migrationsDir = path.join(process.cwd(), "db", "migrations");
    const files = await fs.readdir(migrationsDir);
    const sqlFiles = files.filter((f) => f.endsWith(".sql")).sort();
    for (const f of sqlFiles) {
      const p = path.join(migrationsDir, f);
      console.log("Applying migration:", f);
      const sql = await fs.readFile(p, "utf8");
      await pool.query(sql);
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
