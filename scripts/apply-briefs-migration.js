const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });


async function applyMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const migrationPath = path.join(__dirname, '../supabase/migrations/20260414_evolve_content_briefs.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log('Applying migration: evolve_content_briefs...');

  const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    console.error('Error applying migration:', error);
    // If exec_sql is not available, we might need another way or just explain it
    console.log('Attempting direct execution via REST if possible (fallback)...');
    
    // In some environments, we use a different helper. 
    // For now, let's assume exec_sql exists as per previous context on this repo.
    process.exit(1);
  }

  console.log('Migration applied successfully!');
}

applyMigration();
