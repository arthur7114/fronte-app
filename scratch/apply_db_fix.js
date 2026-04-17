import postgres from "postgres";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("Missing DATABASE_URL in .env");
  process.exit(1);
}

const sql = postgres(dbUrl);

async function applyFix() {
  console.log("Applying database fix via direct connection...");
  try {
    await sql`
      DO $$ 
      BEGIN 
          ALTER TABLE public.automation_jobs DROP CONSTRAINT IF EXISTS automation_jobs_type_check;
          ALTER TABLE public.automation_jobs ADD CONSTRAINT automation_jobs_type_check 
              CHECK (type IN (
                  'research_topics', 
                  'generate_keyword_strategy', 
                  'generate_brief', 
                  'generate_post', 
                  'review_post', 
                  'schedule_post', 
                  'publish_post', 
                  'refresh_content'
              ));
      END $$;
    `;
    console.log("SUCCESS: Database migration applied successfully.");
  } catch (error) {
    console.error("FAILED to apply migration:", error.message);
  } finally {
    await sql.end();
  }
}

applyFix();
