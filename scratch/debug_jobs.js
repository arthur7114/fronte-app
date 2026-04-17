import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function inspectTable() {
  console.log("Inspecting 'automation_jobs' structure...");
  
  // Get columns
  const { data: columns, error: colError } = await supabase
    .rpc('get_table_columns', { table_name: 'automation_jobs' }) 
    // Wait, I might not have this RPC. Let's use raw SQL if possible via execute_sql?
    // I will try a simple query to information_schema if enabled
    || await supabase.from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', 'automation_jobs');

  if (colError) {
    console.error("Col Error:", colError.message);
  } else {
    console.log("Columns:", columns.map(c => `${c.column_name} (${c.data_type})`).join(', '));
  }

  // Check for check constraints
  const { data: constraints, error: constError } = await supabase
    .from('information_schema.check_constraints')
    .select('*');
    // This might be too broad. 

  if (constError) {
    console.error("Const Error:", constError.message);
  } else {
    console.log("Checking if any constraint mentions keyword_strategy...");
  }
}

// Since information_schema might be protected, let's try to just INSERT a test job with a known type
async function testInsert() {
    console.log("Trying a test insert with 'research_topics' (known type)...");
    const { data, error } = await supabase.from('automation_jobs').insert({
        tenant_id: '00000000-0000-0000-0000-000000000000', // Dummy but might fail FK
        type: 'research_topics',
        status: 'pending'
    }).select('id');
    
    if (error) {
        console.error("Test Insert Error:", error.message, "(Code:", error.code, ")");
    } else {
        console.log("Test Insert Success!");
    }
}

inspectTable();
testInsert();
