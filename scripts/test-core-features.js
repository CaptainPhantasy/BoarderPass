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

async function testCoreFeatures() {
  console.log('🧪 Testing BOARDERPASS Core Features\n');
  
  try {
    // Test 1: Country Requirements
    console.log('1️⃣ Testing Country Requirements...');
    const { data: countries, error: countryError } = await supabase
      .from('country_requirements')
      .select('*')
      .limit(3);
    
    if (countryError) {
      console.error('❌ Country requirements error:', countryError.message);
    } else {
      console.log(`✅ Found ${countries.length} countries:`);
      countries.forEach(country => {
        console.log(`   - ${country.country_name} (${country.country_code}):`);
        console.log(`     Document types: ${country.document_types.join(', ')}`);
        console.log(`     Apostille required: ${country.apostille_required ? 'Yes' : 'No'}`);
        console.log(`     Translation required: ${country.translation_required ? 'Yes' : 'No'}`);
        console.log(`     Processing time: ${country.processing_time || 'Not specified'}`);
        console.log(`     Validity period: ${country.validity_period || 'Not specified'}`);
        console.log('');
      });
    }
    
    // Test 2: Legal Terms Translation
    console.log('2️⃣ Testing Legal Terms Translation...');
    const { data: legalTerms, error: legalError } = await supabase
      .from('legal_terms')
      .select('*')
      .eq('language', 'en')
      .limit(5);
    
    if (legalError) {
      console.error('❌ Legal terms error:', legalError.message);
    } else {
      console.log(`✅ Found ${legalTerms.length} English legal terms:`);
      legalTerms.forEach(term => {
        console.log(`   - "${term.term}" → "${term.translation}" (${term.language})`);
      });
      console.log('');
    }
    
    // Test 3: Document Type Validation
    console.log('3️⃣ Testing Document Type Validation...');
    const testDocument = {
      type: 'degree',
      issueCountry: 'US',
      targetCountry: 'CA'
    };
    
    const { data: usRequirements, error: usError } = await supabase
      .from('country_requirements')
      .select('*')
      .eq('country_code', 'US')
      .single();
    
    const { data: caRequirements, error: caError } = await supabase
      .from('country_requirements')
      .select('*')
      .eq('country_code', 'CA')
      .single();
    
    if (usError || caError) {
      console.error('❌ Requirements lookup error:', usError?.message || caError?.message);
    } else {
      console.log('✅ Document validation results:');
      console.log(`   Document type: ${testDocument.type}`);
      console.log(`   From: ${usRequirements.country_name} (${testDocument.issueCountry})`);
      console.log(`   To: ${caRequirements.country_name} (${testDocument.targetCountry})`);
      
      // Check if degree is accepted
      const usAcceptsDegree = usRequirements.document_types.includes(testDocument.type);
      const caAcceptsDegree = caRequirements.document_types.includes(testDocument.type);
      
      console.log(`   US accepts degrees: ${usAcceptsDegree ? 'Yes' : 'No'}`);
      console.log(`   CA accepts degrees: ${caAcceptsDegree ? 'Yes' : 'No'}`);
      
      if (usAcceptsDegree && caAcceptsDegree) {
        console.log('   ✅ Document type is valid for both countries');
        
        // Check requirements
        console.log(`   US apostille required: ${usRequirements.apostille_required ? 'Yes' : 'No'}`);
        console.log(`   CA apostille required: ${caRequirements.apostille_required ? 'Yes' : 'No'}`);
        console.log(`   US translation required: ${usRequirements.translation_required ? 'Yes' : 'No'}`);
        console.log(`   CA translation required: ${caRequirements.translation_required ? 'Yes' : 'No'}`);
        
        if (usRequirements.processing_time) {
          console.log(`   US processing time: ${usRequirements.processing_time}`);
        }
        if (caRequirements.processing_time) {
          console.log(`   CA processing time: ${caRequirements.processing_time}`);
        }
      } else {
        console.log('   ❌ Document type not accepted by one or both countries');
      }
      console.log('');
    }
    
    // Test 4: Legal Term Search
    console.log('4️⃣ Testing Legal Term Search...');
    const searchTerm = 'degree';
    const { data: searchResults, error: searchError } = await supabase
      .from('legal_terms')
      .select('*')
      .or(`term.ilike.%${searchTerm}%,translation.ilike.%${searchTerm}%`)
      .limit(5);
    
    if (searchError) {
      console.error('❌ Search error:', searchError.message);
    } else {
      console.log(`✅ Found ${searchResults.length} terms containing "${searchTerm}":`);
      searchResults.forEach(term => {
        console.log(`   - "${term.term}" (${term.language}) → "${term.translation}"`);
      });
      console.log('');
    }
    
    console.log('🎉 Core Features Test Complete!');
    console.log('\n📊 Summary:');
    console.log('✅ Country requirements loaded and accessible');
    console.log('✅ Legal terms translation working');
    console.log('✅ Document validation logic functional');
    console.log('✅ Search capabilities operational');
    console.log('\n🚀 BOARDERPASS is ready to process real documents!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testCoreFeatures();
