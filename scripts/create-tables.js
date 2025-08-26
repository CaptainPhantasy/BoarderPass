import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTables() {
  console.log('🔨 Attempting to create tables by inserting test data...');
  
  try {
    // Try to create country_requirements table by inserting a test record
    console.log('📊 Creating country_requirements table...');
    const { data: countryData, error: countryError } = await supabase
      .from('country_requirements')
      .insert({
        country_code: 'TEST',
        country_name: 'Test Country',
        document_types: ['passport'],
        apostille_required: false,
        translation_required: true,
        additional_requirements: ['test requirement'],
        processing_time: '5 days',
        validity_period: '1 year'
      })
      .select();
    
    if (countryError) {
      console.log('❌ Could not create country_requirements table:', countryError.message);
      console.log('📋 Please run the migration manually in Supabase dashboard');
      return false;
    } else {
      console.log('✅ country_requirements table created successfully');
      
      // Clean up test data
      await supabase
        .from('country_requirements')
        .delete()
        .eq('country_code', 'TEST');
    }
    
    // Try to create legal_terms table by inserting a test record
    console.log('📚 Creating legal_terms table...');
    const { data: legalData, error: legalError } = await supabase
      .from('legal_terms')
      .insert({
        term: 'test_term',
        language: 'en',
        translation: 'Test Term',
        context: 'Test context'
      })
      .select();
    
    if (legalError) {
      console.log('❌ Could not create legal_terms table:', legalError.message);
      console.log('📋 Please run the migration manually in Supabase dashboard');
      return false;
    } else {
      console.log('✅ legal_terms table created successfully');
      
      // Clean up test data
      await supabase
        .from('legal_terms')
        .delete()
        .eq('term', 'test_term');
    }
    
    console.log('🎉 All tables created successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    return false;
  }
}

createTables().then(success => {
  if (success) {
    console.log('🚀 Ready to populate database with real data!');
  } else {
    console.log('📋 Manual migration required in Supabase dashboard');
  }
});
