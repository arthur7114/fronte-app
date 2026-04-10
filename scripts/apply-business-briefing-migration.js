const fs = require("node:fs");
const path = require("node:path");

async function main() {
  const postgres = require("postgres");
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required.");
  }

  const migrationPath = path.join(
    process.cwd(),
    "supabase",
    "migrations",
    "20260410_create_business_briefings.sql",
  );
  const sqlText = fs.readFileSync(migrationPath, "utf8");
  const db = postgres(databaseUrl, { ssl: "require" });

  try {
    await db.unsafe(sqlText);
    console.log("migration_applied");
  } finally {
    await db.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
