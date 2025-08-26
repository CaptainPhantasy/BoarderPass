# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BOARDERPASS is a humanitarian document translation and validation platform that helps people with international mobility. It processes academic degrees, birth certificates, financial documents, and other official papers through OCR, translation, compliance validation, and professional PDF generation.

The project is 85% complete with 11 known lint errors that need fixing before production deployment.

## Development Commands

### Main Application (Next.js)
Located in `borderpass/` directory:
```bash
cd borderpass
npm run dev          # Start development server with Turbopack
npm run build        # Build for production with Turbopack  
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix ESLint errors
npm run verify-data  # Validate data integrity
```

### Vite Application (Legacy)
Located in `boarderpass/` directory:
```bash
cd boarderpass
npm run dev     # Start Vite dev server
npm run build   # Build with TypeScript compilation
npm run lint    # Run ESLint
```

## Architecture Overview

### Core Technology Stack
- **Next.js 15** with App Router and TypeScript
- **Supabase** for database, auth, and real-time features
- **Tailwind CSS 4** with PostCSS for styling
- **Framer Motion** for animations
- **Tesseract.js** for OCR processing
- **LibreTranslate** for document translation
- **pdf-lib** for PDF generation

### Key Service Architecture
1. **Document Upload** → **OCR Processing** → **Translation** → **Validation** → **PDF Generation**
2. **Client-side OCR** using Tesseract web workers
3. **Real-time progress tracking** with Zustand state management
4. **Multi-language support** (10 languages including Chinese, Arabic, Hindi)
5. **Country-specific compliance validation** against requirements database

### Project Structure
```
borderpass/                    # Main Next.js application
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── (auth)/          # Authentication routes
│   │   ├── (dashboard)/     # Main app routes  
│   │   └── api/             # API endpoints (to be implemented)
│   ├── components/          # React components
│   │   ├── document/        # Document processing UI
│   │   ├── translation/     # Translation interface
│   │   └── compliance/      # Validation components
│   ├── lib/                 # Core services
│   │   ├── ocr/            # Tesseract OCR processing
│   │   ├── translation/    # LibreTranslate integration
│   │   ├── validation/     # Compliance engine
│   │   ├── pdf/            # PDF generation
│   │   └── supabase/       # Database client
│   └── types/              # TypeScript definitions
├── data/                   # Sample data and templates
├── supabase/              # Database migrations
└── public/                # Static assets

boarderpass/               # Legacy Vite application (for reference)
```

## Known Issues

### Critical Lint Errors (11 total)
- **File**: `src/lib/ocr/tesseract-worker.ts` (10 errors)
- **File**: `src/lib/validation/compliance-engine.ts` (1 error)
- **Issue**: Switch case variable declarations need block scoping
- **Fix**: Wrap case statements in curly braces `{}`
- **Priority**: High - blocks production deployment
- **Estimated Fix Time**: 30 minutes

Detailed error documentation available in `LINT_ERRORS.md`.

## Database Setup

### Supabase Configuration
1. Create new Supabase project
2. Run migration: `supabase/migrations/001_initial_schema.sql`
3. Set environment variables in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
   - `SUPABASE_SERVICE_ROLE_KEY`

## Important Development Notes

### Path Aliases
- Use `@/*` for importing from `src/` directory
- Configured in `tsconfig.json` paths mapping

### Environment Setup
- Copy `env.example` to `.env.local` 
- Required for Supabase integration
- Optional: LibreTranslate URL configuration

### Testing Strategy
- No mock data - use real test data from users
- Test with actual Supabase environment
- Focus on document processing pipeline integrity

### Code Conventions
- TypeScript strict mode enabled
- ESLint with Next.js and TypeScript rules
- Tailwind CSS for styling
- React Hook Form with Zod validation
- Framer Motion for animations

## Production Readiness

### Current Status
- ✅ Core functionality complete
- ✅ UI/UX implemented and responsive  
- ✅ Database schema and migrations ready
- ❌ 11 lint errors need fixing
- ❌ API routes need implementation
- ❌ Production testing required

### Next Steps for Production
1. Fix switch case scope lint errors
2. Implement API routes in `src/app/api/`
3. Populate country requirements database
4. Add comprehensive test suite
5. Deploy using Railway configuration (`railway.json`)