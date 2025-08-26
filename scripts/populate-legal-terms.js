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

async function populateLegalTerms() {
  console.log('📚 Populating legal terms table...');
  
  try {
    // Read the legal dictionary file
    const dictionaryPath = path.join(__dirname, '../data/translations/legal-dictionary.ts');
    const dictionaryContent = fs.readFileSync(dictionaryPath, 'utf8');
    
    // Extract the legalTermMappings object
    const mappingsMatch = dictionaryContent.match(/export const legalTermMappings = ({[\s\S]*?});/);
    if (!mappingsMatch) {
      console.error('Could not parse legal dictionary structure');
      return;
    }
    
    // Parse the mappings (this is a simplified approach)
    const mappingsText = mappingsMatch[1];
    
    // Extract language pairs and terms
    const languagePairs = [];
    const languagePairRegex = /"([^"]+)-([^"]+)":\s*{([\s\S]*?)}/g;
    let match;
    
    while (true) {
      const match = languagePairRegex.exec(mappingsText);
      if (!match) break;
      
      const sourceLang = match[1];
      const targetLang = match[2];
      const termsSection = match[3];
      
      // Extract individual terms
      const termRegex = /"([^"]+)":\s*"([^"]+)"/g;
      let termMatch;
      
      while (true) {
        const termMatch = termRegex.exec(termsSection);
        if (!termMatch) break;
        
        const term = termMatch[1];
        const translation = termMatch[2];
        
        languagePairs.push({
          sourceLang,
          targetLang,
          term,
          translation
        });
      }
    }
    
    console.log(`📝 Found ${languagePairs.length} legal terms to insert`);
    
    // Insert terms into database
    let insertedCount = 0;
    for (const pair of languagePairs) {
      try {
        const { error } = await supabase
          .from('legal_terms')
          .insert({
            term: pair.term,
            language: pair.sourceLang,
            translation: pair.translation,
            context: `Legal term from ${pair.sourceLang} to ${pair.targetLang}`
          });
        
        if (error) {
          if (error.code === '23505') { // Unique constraint violation
            console.log(`⚠️  Term "${pair.term}" in ${pair.sourceLang} already exists, skipping`);
          } else {
            console.error(`❌ Error inserting term "${pair.term}":`, error.message);
          }
        } else {
          insertedCount++;
          if (insertedCount % 10 === 0) {
            console.log(`✅ Inserted ${insertedCount} terms...`);
          }
        }
      } catch (error) {
        console.error(`❌ Error processing term "${pair.term}":`, error.message);
      }
    }
    
    console.log(`🎉 Successfully inserted ${insertedCount} legal terms`);
    
  } catch (error) {
    console.error('❌ Error populating legal terms:', error);
  }
}

populateLegalTerms();
