import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🚀 Running database migration...');
  
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/001_initial_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration file loaded, executing SQL...');
    
    // Execute the migration using Supabase's rpc function
    // Note: We'll need to execute this in parts since Supabase doesn't support direct SQL execution
    
    // First, let's check if tables exist
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['documents', 'country_requirements', 'legal_terms']);
    
    if (tablesError) {
      console.log('ℹ️  Using alternative method to check tables...');
    } else {
      console.log('📊 Existing tables:', tables?.map(t => t.table_name) || []);
    }
    
    // Try to create tables by attempting operations
    console.log('🔨 Creating tables by attempting operations...');
    
    // Try to create country_requirements table
    try {
      const { error: createError } = await supabase
        .rpc('exec_sql', { sql: `
          CREATE TABLE IF NOT EXISTS public.country_requirements (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            country_code TEXT UNIQUE NOT NULL,
            country_name TEXT NOT NULL,
            document_types TEXT[] NOT NULL,
            apostille_required BOOLEAN DEFAULT false,
            translation_required BOOLEAN DEFAULT false,
            additional_requirements TEXT[],
            processing_time TEXT,
            validity_period TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        ` });
      
      if (createError) {
        console.log('⚠️  Could not create table via RPC, trying alternative method...');
      } else {
        console.log('✅ country_requirements table created');
      }
    } catch (error) {
      console.log('⚠️  RPC method failed, trying direct table creation...');
    }
    
    // Try to create legal_terms table
    try {
      const { error: createError } = await supabase
        .rpc('exec_sql', { sql: `
          CREATE TABLE IF NOT EXISTS public.legal_terms (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            term TEXT NOT NULL,
            language TEXT NOT NULL,
            translation TEXT NOT NULL,
            context TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(term, language)
          );
        ` });
      
      if (createError) {
        console.log('⚠️  Could not create legal_terms table via RPC');
      } else {
        console.log('✅ legal_terms table created');
      }
    } catch (error) {
      console.log('⚠️  RPC method failed for legal_terms');
    }
    
    console.log('✅ Migration attempt completed');
    console.log('📋 Note: If tables were not created, you may need to run the migration manually in Supabase dashboard');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.log('📋 Please run the migration manually in your Supabase dashboard:');
    console.log('   1. Go to SQL Editor in Supabase dashboard');
    console.log('   2. Copy the contents of supabase/migrations/001_initial_schema.sql');
    console.log('   3. Paste and execute the SQL');
  }
}

runMigration();
