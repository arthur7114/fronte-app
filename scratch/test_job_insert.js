import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function testRealInsert() {
  console.log("Fetching a valid tenant_id...");
  const { data: tenantData } = await supabase.from('tenants').select('id').limit(1).single();
  
  if (!tenantData) {
    console.error("No tenants found in DB.");
    return;
  }
  
  const tenantId = tenantData.id;
  console.log(`Using Tenant ID: ${tenantId}`);

  const jobType = "generate_keyword_strategy";
  console.log(`Trying to insert job type: ${jobType}`);

  const { data, error } = await supabase.from('automation_jobs').insert({
    tenant_id: tenantId,
    type: jobType,
    status: 'pending',
    max_attempts: 3,
    priority: 5,
    payload_json: { test: true }
  }).select('id');

  if (error) {
    console.error("FAILED with error:", error.message, "(Code:", error.code, ")");
    if (error.message.includes("violates check constraint")) {
        console.log("Confirmed: Check constraint violation on 'type' or another column.");
    }
  } else {
    console.log("SUCCESS! The insert worked for type:", jobType);
    // Cleanup
    await supabase.from('automation_jobs').delete().eq('id', data[0].id);
  }
}

testRealInsert();
