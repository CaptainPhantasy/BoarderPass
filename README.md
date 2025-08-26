# Boarderpass

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Project Vision

Build a completely free, open-source web application that democratizes international document translation and validation, removing all barriers to global mobility. This will be a gift to humanity - no paywalls, no premium tiers, everyone gets everything.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Linting and Code Quality

This project uses ESLint for code linting and TypeScript for type checking. Here are the available commands:

```bash
# Run ESLint to check for linting errors
npm run lint

# Run ESLint with automatic fix for fixable errors
npm run lint:fix

# Run TypeScript compiler to check for type errors
npx tsc --noEmit
```

The linting configuration includes:
- Next.js recommended rules
- TypeScript ESLint rules
- Unused imports detection
- Unused variables detection

All code should pass linting and type checking before being committed to the repository.

## Data Population & Testing Progress

### Requirements Database Population ✅

Created comprehensive requirements for 10 priority corridors:
- India → USA
- Mexico → USA
- China → Canada
- Philippines → UAE
- Brazil → Portugal
- Nigeria → UK
- Pakistan → UK
- Ukraine → Poland
- Venezuela → Spain
- Bangladesh → Saudi Arabia

Data files created:
- `data/requirements/country-requirements.json` - Complete JSON data for all corridors
- `data/requirements/country-requirements.sql` - SQL INSERT statements for Supabase database

### Legal Terms Dictionary ✅

Created comprehensive legal term mappings for 10 language pairs:
- English ↔ Spanish
- Hindi ↔ English
- Chinese ↔ English
- Portuguese ↔ English
- Arabic ↔ English
- French ↔ English
- Bengali ↔ English
- Russian ↔ English
- Japanese ↔ English

Data file created:
- `data/translations/legal-dictionary.ts` - TypeScript file with all legal term mappings

### Test Documents & Fixtures ✅

Created comprehensive test data:
- `__tests__/fixtures/sample-documents.ts` - 5 sample documents from different countries
- `__tests__/fixtures/validation-cases.ts` - 15 validation test cases covering various scenarios

### Comprehensive Test Suite ✅

Created end-to-end tests:
- `__tests__/e2e/document-flow.spec.ts` - Playwright tests for document processing flow, translation interface, and compliance guide

### Sample Document Library ✅

Created directory structure in `public/samples/` for sample documents with documentation:
- Degrees, certificates, and financial documents samples
- `public/samples/README.md` with usage instructions

### Office Directory Database ✅

Created comprehensive office location database:
- `data/offices/apostille-offices.json` - Detailed information for apostille offices in all 10 countries
- Multiple office locations per country where applicable
- Contact information, hours, fees, and processing times

### Verification Tools ✅

Created verification script:
- `scripts/verify-data.js` - Script to validate all data files
- Added `verify-data` script to package.json for easy validation

Run verification with:
```bash
npm run verify-data
```
