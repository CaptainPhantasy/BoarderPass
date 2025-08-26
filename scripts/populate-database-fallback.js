import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Load environment variables - use anon key for now
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

// Try with anon key first (won't work for inserts, but let's test connection)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing database connection with anon key...');
  
  try {
    // Try to select from tables to check structure
    const { data: reqData, error: reqError } = await supabase
      .from('country_requirements')
      .select('*')
      .limit(1);
    
    if (!reqError) {
      console.log('✅ Can read from country_requirements table');
      return true;
    } else {
      console.log('❌ Cannot read from country_requirements:', reqError.message);
      return false;
    }
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
}

async function createFallbackData() {
  console.log('\n📦 Creating fallback data for local development...\n');
  
  // Load the JSON data
  const requirementsPath = path.join(__dirname, '../data/requirements/country-requirements.json');
  const requirementsData = JSON.parse(fs.readFileSync(requirementsPath, 'utf8'));
  
  // Create fallback files
  const fallbackDir = path.join(__dirname, '../data/fallback');
  if (!fs.existsSync(fallbackDir)) {
    fs.mkdirSync(fallbackDir, { recursive: true });
  }
  
  // Process corridors into country requirements
  const countryRequirements = new Map();
  
  for (const corridor of requirementsData.corridors) {
    const targetCountry = corridor.target_country;
    
    if (!countryRequirements.has(targetCountry)) {
      // Extract document types from this corridor
      const documentTypes = corridor.documents.map(doc => doc.document_type);
      
      // Check if any document requires apostille
      const apostilleRequired = corridor.documents.some(doc => doc.apostille_required);
      
      // Extract typical processing time
      const processingDays = corridor.documents[0]?.typical_processing_days;
      const processingTime = processingDays ? `${processingDays} days` : null;
      
      // Extract additional requirements
      const additionalRequirements = [];
      corridor.documents.forEach(doc => {
        if (doc.requirements?.must_have) {
          additionalRequirements.push(...doc.requirements.must_have);
        }
      });
      
      countryRequirements.set(targetCountry, {
        country_code: targetCountry,
        country_name: getCountryName(targetCountry),
        document_types: documentTypes,
        apostille_required: apostilleRequired,
        translation_required: true,
        additional_requirements: [...new Set(additionalRequirements)].slice(0, 5),
        processing_time: processingTime,
        validity_period: corridor.documents[0]?.requirements?.validity || null,
      });
    }
  }
  
  // Save country requirements fallback
  const requirementsFallback = Array.from(countryRequirements.values());
  fs.writeFileSync(
    path.join(fallbackDir, 'country-requirements.json'),
    JSON.stringify(requirementsFallback, null, 2)
  );
  console.log(`✅ Created fallback for ${requirementsFallback.length} countries`);
  
  // Create legal terms fallback
  const legalTerms = [
    { term: 'apostille', language: 'es', translation: 'apostilla', context: 'legal' },
    { term: 'apostille', language: 'fr', translation: 'apostille', context: 'legal' },
    { term: 'apostille', language: 'de', translation: 'Apostille', context: 'legal' },
    { term: 'apostille', language: 'pt', translation: 'apostila', context: 'legal' },
    { term: 'apostille', language: 'it', translation: 'apostille', context: 'legal' },
    { term: 'notarization', language: 'es', translation: 'notarización', context: 'legal' },
    { term: 'notarization', language: 'fr', translation: 'notarisation', context: 'legal' },
    { term: 'notarization', language: 'de', translation: 'Beglaubigung', context: 'legal' },
    { term: 'notarization', language: 'pt', translation: 'notarização', context: 'legal' },
    { term: 'notarization', language: 'it', translation: 'notarizzazione', context: 'legal' },
    { term: 'certified copy', language: 'es', translation: 'copia certificada', context: 'legal' },
    { term: 'certified copy', language: 'fr', translation: 'copie certifiée', context: 'legal' },
    { term: 'certified copy', language: 'de', translation: 'beglaubigte Kopie', context: 'legal' },
    { term: 'certified copy', language: 'pt', translation: 'cópia autenticada', context: 'legal' },
    { term: 'certified copy', language: 'it', translation: 'copia certificata', context: 'legal' },
    { term: 'power of attorney', language: 'es', translation: 'poder notarial', context: 'legal' },
    { term: 'power of attorney', language: 'fr', translation: 'procuration', context: 'legal' },
    { term: 'power of attorney', language: 'de', translation: 'Vollmacht', context: 'legal' },
    { term: 'power of attorney', language: 'pt', translation: 'procuração', context: 'legal' },
    { term: 'power of attorney', language: 'it', translation: 'procura', context: 'legal' },
    { term: 'affidavit', language: 'es', translation: 'declaración jurada', context: 'legal' },
    { term: 'affidavit', language: 'fr', translation: 'affidavit', context: 'legal' },
    { term: 'affidavit', language: 'de', translation: 'eidesstattliche Erklärung', context: 'legal' },
    { term: 'affidavit', language: 'pt', translation: 'declaração juramentada', context: 'legal' },
    { term: 'affidavit', language: 'it', translation: 'dichiarazione giurata', context: 'legal' },
    { term: 'birth certificate', language: 'es', translation: 'certificado de nacimiento', context: 'legal' },
    { term: 'birth certificate', language: 'fr', translation: 'acte de naissance', context: 'legal' },
    { term: 'birth certificate', language: 'de', translation: 'Geburtsurkunde', context: 'legal' },
    { term: 'marriage certificate', language: 'es', translation: 'certificado de matrimonio', context: 'legal' },
    { term: 'marriage certificate', language: 'fr', translation: 'acte de mariage', context: 'legal' },
    { term: 'marriage certificate', language: 'de', translation: 'Heiratsurkunde', context: 'legal' },
    { term: 'death certificate', language: 'es', translation: 'certificado de defunción', context: 'legal' },
    { term: 'death certificate', language: 'fr', translation: 'acte de décès', context: 'legal' },
    { term: 'death certificate', language: 'de', translation: 'Sterbeurkunde', context: 'legal' },
    { term: 'diploma', language: 'es', translation: 'diploma', context: 'legal' },
    { term: 'diploma', language: 'fr', translation: 'diplôme', context: 'legal' },
    { term: 'diploma', language: 'de', translation: 'Diplom', context: 'legal' },
    { term: 'transcript', language: 'es', translation: 'expediente académico', context: 'legal' },
    { term: 'transcript', language: 'fr', translation: 'relevé de notes', context: 'legal' },
    { term: 'transcript', language: 'de', translation: 'Zeugnis', context: 'legal' },
  ];
  
  fs.writeFileSync(
    path.join(fallbackDir, 'legal-terms.json'),
    JSON.stringify(legalTerms, null, 2)
  );
  console.log(`✅ Created fallback for ${legalTerms.length} legal terms`);
  
  console.log('\n📄 Fallback data created in:', fallbackDir);
  console.log('\n⚠️  Note: The application will use this fallback data when the database is unavailable.');
  console.log('To use the actual database, you need a valid SUPABASE_SERVICE_ROLE_KEY.');
  
  return { requirementsFallback, legalTerms };
}

function getCountryName(code) {
  const countryNames = {
    'US': 'United States',
    'CA': 'Canada',
    'GB': 'United Kingdom',
    'AE': 'United Arab Emirates',
    'PT': 'Portugal',
    'PL': 'Poland',
    'ES': 'Spain',
    'SA': 'Saudi Arabia',
    'AU': 'Australia',
    'DE': 'Germany',
    'FR': 'France',
    'IT': 'Italy',
    'JP': 'Japan',
    'CN': 'China',
    'IN': 'India',
    'BR': 'Brazil',
    'MX': 'Mexico',
    'KR': 'South Korea',
    'NL': 'Netherlands',
    'SE': 'Sweden',
    'NO': 'Norway',
    'DK': 'Denmark',
    'FI': 'Finland',
    'CH': 'Switzerland',
  };
  
  return countryNames[code] || code;
}

async function main() {
  console.log('🚀 Database Fallback Setup\n');
  
  // Test connection
  const canConnect = await testConnection();
  
  if (!canConnect) {
    console.log('\n⚠️  Cannot connect to database with current credentials.');
    console.log('Creating local fallback data for development...\n');
  }
  
  // Create fallback data regardless
  const fallbackData = await createFallbackData();
  
  console.log('\n✅ Fallback setup complete!');
  console.log('\n📋 Next Steps:');
  console.log('1. Update your application to use the fallback data when DB is unavailable');
  console.log('2. Get a valid SUPABASE_SERVICE_ROLE_KEY from your Supabase dashboard');
  console.log('3. Update .env.local with the correct service role key');
  console.log('4. Run "npm run db:populate" to populate the actual database');
}

main().catch(console.error);