import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyDatabase() {
  console.log('🔍 Verifying database contents...\n');
  
  const checks = {
    connection: false,
    hasCountryData: false,
    hasLegalTerms: false,
    countryCount: 0,
    termCount: 0,
    sampleCountries: [],
    sampleTerms: []
  };
  
  try {
    // Test connection
    const { data: testData, error: testError } = await supabase
      .from('country_requirements')
      .select('country_code')
      .limit(1);
    
    if (!testError) {
      checks.connection = true;
      console.log('✅ Database connection successful');
    } else {
      console.error('❌ Database connection failed:', testError);
      return checks;
    }
    
    // Check country_requirements table
    const { data: countries, error: countryError, count } = await supabase
      .from('country_requirements')
      .select('*', { count: 'exact' });
    
    if (!countryError && countries && countries.length > 0) {
      checks.hasCountryData = true;
      checks.countryCount = count || countries.length;
      checks.sampleCountries = countries.slice(0, 3).map(c => ({
        code: c.country_code,
        name: c.country_name,
        apostille: c.apostille_required,
        documents: c.document_types?.length || 0
      }));
      
      console.log(`\n✅ Country Requirements Table:`);
      console.log(`   Total countries: ${checks.countryCount}`);
      console.log(`   Sample entries:`);
      checks.sampleCountries.forEach(country => {
        console.log(`   - ${country.name} (${country.code}): ${country.documents} document types, apostille: ${country.apostille ? 'required' : 'not required'}`);
      });
    } else {
      console.log('\n❌ Country Requirements Table: EMPTY or ERROR');
      if (countryError) console.error('   Error:', countryError);
    }
    
    // Check legal_terms table
    const { data: terms, error: termError, count: termCount } = await supabase
      .from('legal_terms')
      .select('*', { count: 'exact' });
    
    if (!termError && terms && terms.length > 0) {
      checks.hasLegalTerms = true;
      checks.termCount = termCount || terms.length;
      
      // Get unique terms
      const uniqueTerms = [...new Set(terms.map(t => t.term))];
      checks.sampleTerms = uniqueTerms.slice(0, 5);
      
      console.log(`\n✅ Legal Terms Table:`);
      console.log(`   Total translations: ${checks.termCount}`);
      console.log(`   Unique terms: ${uniqueTerms.length}`);
      console.log(`   Sample terms: ${checks.sampleTerms.join(', ')}`);
      
      // Check language coverage
      const languages = [...new Set(terms.map(t => t.language))];
      console.log(`   Languages covered: ${languages.join(', ')}`);
    } else {
      console.log('\n❌ Legal Terms Table: EMPTY or ERROR');
      if (termError) console.error('   Error:', termError);
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 DATABASE HEALTH CHECK SUMMARY:');
    console.log('='.repeat(50));
    console.log(`Connection:          ${checks.connection ? '✅ Connected' : '❌ Failed'}`);
    console.log(`Country Requirements: ${checks.hasCountryData ? `✅ ${checks.countryCount} countries` : '❌ Empty'}`);
    console.log(`Legal Terms:         ${checks.hasLegalTerms ? `✅ ${checks.termCount} translations` : '❌ Empty'}`);
    
    // Overall status
    const isHealthy = checks.connection && checks.hasCountryData && checks.hasLegalTerms;
    console.log('\nOVERALL STATUS:', isHealthy ? '✅ DATABASE READY FOR PRODUCTION' : '❌ DATABASE NOT READY');
    
    if (!isHealthy) {
      console.log('\n⚠️  To populate the database, run:');
      console.log('   npm run db:populate');
    }
    
    return checks;
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
    return checks;
  }
}

// Run verification
verifyDatabase().then(results => {
  const isHealthy = results.connection && results.hasCountryData && results.hasLegalTerms;
  process.exit(isHealthy ? 0 : 1);
});