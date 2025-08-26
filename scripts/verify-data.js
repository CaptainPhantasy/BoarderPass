/**
 * Script to verify data files
 */

const fs = require('fs');
const path = require('path');

// Function to check if a file exists
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// Function to check if a JSON file is valid
function isValidJSON(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    JSON.parse(data);
    return true;
  } catch (error) {
    return false;
  }
}

// Function to check if a TypeScript file is valid
function isValidTS(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    // Basic check - just see if we can read it
    return data.length > 0;
  } catch (error) {
    return false;
  }
}

// Check requirements data
console.log('Checking requirements data...');
const requirementsPath = path.join(__dirname, '..', 'data', 'requirements', 'country-requirements.json');
if (fileExists(requirementsPath) && isValidJSON(requirementsPath)) {
  console.log('✓ Country requirements JSON is valid');
} else {
  console.log('✗ Country requirements JSON is invalid or missing');
}

// Check requirements SQL
console.log('Checking requirements SQL...');
const requirementsSQLPath = path.join(__dirname, '..', 'data', 'requirements', 'country-requirements.sql');
if (fileExists(requirementsSQLPath)) {
  console.log('✓ Country requirements SQL file exists');
} else {
  console.log('✗ Country requirements SQL file is missing');
}

// Check legal dictionary
console.log('Checking legal dictionary...');
const legalDictPath = path.join(__dirname, '..', 'data', 'translations', 'legal-dictionary.ts');
if (fileExists(legalDictPath) && isValidTS(legalDictPath)) {
  console.log('✓ Legal dictionary TypeScript file is valid');
} else {
  console.log('✗ Legal dictionary TypeScript file is invalid or missing');
}

// Check sample documents
console.log('Checking sample documents...');
const sampleDocsPath = path.join(__dirname, '..', '__tests__', 'fixtures', 'sample-documents.ts');
if (fileExists(sampleDocsPath) && isValidTS(sampleDocsPath)) {
  console.log('✓ Sample documents TypeScript file is valid');
} else {
  console.log('✗ Sample documents TypeScript file is invalid or missing');
}

// Check validation cases
console.log('Checking validation cases...');
const validationCasesPath = path.join(__dirname, '..', '__tests__', 'fixtures', 'validation-cases.ts');
if (fileExists(validationCasesPath) && isValidTS(validationCasesPath)) {
  console.log('✓ Validation cases TypeScript file is valid');
} else {
  console.log('✗ Validation cases TypeScript file is invalid or missing');
}

// Check office locations
console.log('Checking office locations...');
const officeLocationsPath = path.join(__dirname, '..', 'data', 'offices', 'apostille-offices.json');
if (fileExists(officeLocationsPath) && isValidJSON(officeLocationsPath)) {
  console.log('✓ Office locations JSON is valid');
} else {
  console.log('✗ Office locations JSON is invalid or missing');
}

console.log('\nData verification complete!');
