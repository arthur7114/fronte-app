import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(url, key);

async function checkTable() {
  console.log("Checking for 'automation_jobs' table...");
  const { data, error } = await supabase
    .from("automation_jobs")
    .select("id")
    .limit(1);

  if (error) {
    if (error.code === "42P01") {
      console.error("ERROR: Table 'automation_jobs' does NOT exist.");
    } else {
      console.error("ERROR:", error.message, "(Code:", error.code, ")");
    }
  } else {
    console.log("SUCCESS: Table 'automation_jobs' exists.");
  }
}

checkTable();
