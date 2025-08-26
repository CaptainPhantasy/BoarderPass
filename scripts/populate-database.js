import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function populateCountryRequirements() {
  console.log('Loading country requirements...');
  
  // Load the JSON data
  const requirementsPath = path.join(__dirname, '../data/requirements/country-requirements.json');
  const requirementsData = JSON.parse(fs.readFileSync(requirementsPath, 'utf8'));
  
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
        translation_required: true, // Default to true for all
        additional_requirements: [...new Set(additionalRequirements)].slice(0, 5),
        processing_time: processingTime,
        validity_period: corridor.documents[0]?.requirements?.validity || null,
      });
    }
  }
  
  // Insert into database
  const requirements = Array.from(countryRequirements.values());
  
  for (const req of requirements) {
    const { error } = await supabase
      .from('country_requirements')
      .upsert(req, { onConflict: 'country_code' });
    
    if (error) {
      console.error(`Error inserting requirements for ${req.country_code}:`, error);
    } else {
      console.log(`✓ Inserted requirements for ${req.country_name}`);
    }
  }
  
  console.log(`\n✓ Populated ${requirements.length} country requirements`);
}

async function populateLegalTerms() {
  console.log('\nLoading legal dictionary...');
  
  // Load the legal dictionary
  const dictionaryPath = path.join(__dirname, '../data/translations/legal-dictionary.ts');
  const dictionaryContent = fs.readFileSync(dictionaryPath, 'utf8');
  
  // Parse the TypeScript file to extract terms
  // This is a simplified parser - in production you'd use a proper TS parser
  const termsMatch = dictionaryContent.match(/terms:\s*\[([\s\S]*?)\]/);
  if (!termsMatch) {
    console.error('Could not parse legal dictionary');
    return;
  }
  
  // Extract term objects
  const termRegex = /{\s*term:\s*['"]([^'"]+)['"],\s*translations:\s*{([^}]+)}/g;
  const terms = [];
  let match;
  
  while ((match = termRegex.exec(termsMatch[1])) !== null) {
    const term = match[1];
    const translationsStr = match[2];
    
    // Parse translations
    const langRegex = /(\w+):\s*['"]([^'"]+)['"]/g;
    let langMatch;
    
    while ((langMatch = langRegex.exec(translationsStr)) !== null) {
      terms.push({
        term: term,
        language: langMatch[1],
        translation: langMatch[2],
        context: 'legal',
      });
    }
  }
  
  // Insert sample legal terms if parsing fails
  if (terms.length === 0) {
    terms.push(
      { term: 'apostille', language: 'es', translation: 'apostilla', context: 'legal' },
      { term: 'apostille', language: 'fr', translation: 'apostille', context: 'legal' },
      { term: 'apostille', language: 'de', translation: 'Apostille', context: 'legal' },
      { term: 'notarization', language: 'es', translation: 'notarización', context: 'legal' },
      { term: 'notarization', language: 'fr', translation: 'notarisation', context: 'legal' },
      { term: 'notarization', language: 'de', translation: 'Beglaubigung', context: 'legal' },
      { term: 'certified copy', language: 'es', translation: 'copia certificada', context: 'legal' },
      { term: 'certified copy', language: 'fr', translation: 'copie certifiée', context: 'legal' },
      { term: 'certified copy', language: 'de', translation: 'beglaubigte Kopie', context: 'legal' },
      { term: 'power of attorney', language: 'es', translation: 'poder notarial', context: 'legal' },
      { term: 'power of attorney', language: 'fr', translation: 'procuration', context: 'legal' },
      { term: 'power of attorney', language: 'de', translation: 'Vollmacht', context: 'legal' },
      { term: 'affidavit', language: 'es', translation: 'declaración jurada', context: 'legal' },
      { term: 'affidavit', language: 'fr', translation: 'affidavit', context: 'legal' },
      { term: 'affidavit', language: 'de', translation: 'eidesstattliche Erklärung', context: 'legal' },
    );
  }
  
  // Insert into database
  for (const term of terms) {
    const { error } = await supabase
      .from('legal_terms')
      .upsert(term, { onConflict: 'term,language' });
    
    if (error) {
      console.error(`Error inserting term ${term.term} (${term.language}):`, error);
    }
  }
  
  console.log(`✓ Populated ${terms.length} legal terms`);
}

function getCountryName(code) {
  const countryNames = {
    'US': 'United States',
    'CA': 'Canada',
    'UK': 'United Kingdom',
    'AU': 'Australia',
    'DE': 'Germany',
    'FR': 'France',
    'ES': 'Spain',
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
  console.log('Starting database population...\n');
  
  try {
    await populateCountryRequirements();
    await populateLegalTerms();
    
    console.log('\n✅ Database population completed successfully!');
  } catch (error) {
    console.error('\n❌ Database population failed:', error);
    process.exit(1);
  }
}

main();