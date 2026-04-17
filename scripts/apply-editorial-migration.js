require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");

async function main() {
  const postgres = require("postgres");
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl || databaseUrl.includes("[password]")) {
    throw new Error("DATABASE_URL is missing or contains '[password]' placeholder. Please update your .env file.");
  }

  const migrationFile = "20260414_evolve_topic_candidates.sql";
  const migrationPath = path.join(
    process.cwd(),
    "supabase",
    "migrations",
    migrationFile,
  );
  
  if (!fs.existsSync(migrationPath)) {
    throw new Error(`Migration file not found: ${migrationPath}`);
  }

  const sqlText = fs.readFileSync(migrationPath, "utf8");
  const db = postgres(databaseUrl, { ssl: "require" });

  console.log(`Applying migration: ${migrationFile}...`);
  
  try {
    await db.unsafe(sqlText);
    console.log("migration_applied_successfully");
  } catch (error) {
    console.error("Failed to apply migration:", error.message);
    process.exit(1);
  } finally {
    await db.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
