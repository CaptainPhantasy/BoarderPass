# BOARDERPASS 
### Project Vision
Build a completely free, open-source web application that democratizes international document translation and validation, removing all barriers to global mobility. This will be a gift to humanity - no paywalls, no premium tiers, everyone gets everything.

# PHASE 1: Foundation & Architecture Setup (Day 1-2)
### Step 1.1: Initialize Next.js Project with TypeScript


bash
*# Create the project with all necessary configurations*
npx create-next-app@latest borderpass --typescript --tailwind --app --src-dir --import-alias "@/*"
cd borderpass

*# Install core dependencies*
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install tesseract.js pdf-lib sharp jimp
npm install libretranslate axios
npm install react-dropzone react-pdf pdfjs-dist
npm install zustand react-hook-form zod
npm install date-fns uuid crypto-js
npm install react-hot-toast framer-motion
npm install @radix-ui/react-dialog @radix-ui/react-tabs @radix-ui/react-select
npm install --save-dev @types/pdf-lib @types/uuid
### Step 1.2: Project Structure Setup


Create this exact folder structure:


borderpass/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/
│   │   │   ├── documents/
│   │   │   ├── history/
│   │   │   └── settings/
│   │   ├── api/
│   │   │   ├── ocr/
│   │   │   ├── translate/
│   │   │   ├── validate/
│   │   │   └── generate/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── document/
│   │   │   ├── DocumentUploader.tsx
│   │   │   ├── DocumentPreview.tsx
│   │   │   ├── DocumentProcessor.tsx
│   │   │   └── DocumentValidator.tsx
│   │   ├── translation/
│   │   │   ├── TranslationEngine.tsx
│   │   │   ├── LegalTermMapper.tsx
│   │   │   └── SideBySideView.tsx
│   │   ├── compliance/
│   │   │   ├── RequirementsChecker.tsx
│   │   │   ├── VisualGuide.tsx
│   │   │   └── CertificationPath.tsx
│   │   └── ui/
│   │       └── [Radix components]
│   ├── lib/
│   │   ├── ocr/
│   │   │   ├── tesseract-worker.ts
│   │   │   └── document-parser.ts
│   │   ├── translation/
│   │   │   ├── libre-translate.ts
│   │   │   ├── legal-dictionary.ts
│   │   │   └── format-mapper.ts
│   │   ├── validation/
│   │   │   ├── country-requirements.ts
│   │   │   └── compliance-engine.ts
│   │   ├── pdf/
│   │   │   ├── generator.ts
│   │   │   └── templates.ts
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── types.ts
│   │   └── utils/
│   ├── hooks/
│   ├── stores/
│   └── types/
├── public/
│   ├── samples/
│   ├── templates/
│   └── workers/
├── supabase/
│   ├── migrations/
│   └── functions/
└── data/
    ├── requirements/
    ├── translations/
    └── templates/
### Step 1.3: Supabase Configuration


sql
*-- Create this schema in Supabase SQL Editor*
*-- Run each block separately*

*-- Enable necessary extensions*
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

*-- Documents table*
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT,
    document_type TEXT NOT NULL CHECK (document_type IN (
        'degree', 'transcript', 'birth_certificate', 'marriage_certificate',
        'bank_statement', 'tax_return', 'employment_letter', 'police_clearance'
    )),
    source_country TEXT NOT NULL,
    target_country TEXT NOT NULL,
    source_language TEXT NOT NULL,
    target_language TEXT NOT NULL,
    status TEXT DEFAULT 'uploaded' CHECK (status IN (
        'uploaded', 'processing', 'extracting', 'translating', 
        'validating', 'completed', 'failed'
    )),
    original_filename TEXT NOT NULL,
    original_file_path TEXT,
    processed_file_path TEXT,
    extracted_text TEXT,
    translated_text TEXT,
    validation_results JSONB DEFAULT '{}',
    legal_mappings JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    processing_errors JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

*-- Requirements database*
CREATE TABLE country_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_country TEXT NOT NULL,
    target_country TEXT NOT NULL,
    document_type TEXT NOT NULL,
    requirements JSONB NOT NULL,
    formatting_rules JSONB DEFAULT '{}',
    certification_types TEXT[] DEFAULT '{}',
    apostille_required BOOLEAN DEFAULT false,
    notarization_required BOOLEAN DEFAULT false,
    translation_certification_required BOOLEAN DEFAULT false,
    typical_processing_days INTEGER,
    office_locations JSONB DEFAULT '[]',
    fees JSONB DEFAULT '{}',
    additional_notes TEXT,
    last_verified DATE DEFAULT CURRENT_DATE,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_country, target_country, document_type)
);

*-- Legal terms dictionary*
CREATE TABLE legal_terms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_language TEXT NOT NULL,
    target_language TEXT NOT NULL,
    source_term TEXT NOT NULL,
    target_term TEXT NOT NULL,
    context TEXT,
    document_type TEXT,
    usage_notes TEXT,
    confidence_score DECIMAL(3,2) DEFAULT 1.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_language, target_language, source_term, context)
);

*-- Document templates*
CREATE TABLE document_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country TEXT NOT NULL,
    document_type TEXT NOT NULL,
    language TEXT NOT NULL,
    template_name TEXT NOT NULL,
    template_structure JSONB NOT NULL,
    field_mappings JSONB NOT NULL,
    sample_content JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(country, document_type, language)
);

*-- Processing queue*
CREATE TABLE processing_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    step TEXT NOT NULL,
    priority INTEGER DEFAULT 5,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    last_error TEXT,
    scheduled_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

*-- User preferences*
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    preferred_language TEXT DEFAULT 'en',
    default_source_country TEXT,
    default_target_country TEXT,
    email_notifications BOOLEAN DEFAULT true,
    auto_delete_documents BOOLEAN DEFAULT true,
    deletion_days INTEGER DEFAULT 30,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

*-- Enable Row Level Security*
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

*-- RLS Policies*
CREATE POLICY "Users can view own documents" ON documents
    FOR ALL USING (
        auth.uid() = user_id OR 
        session_id = current_setting('app.session_id', true)
    );

CREATE POLICY "Users can manage own preferences" ON user_preferences
    FOR ALL USING (auth.uid() = user_id);

*-- Indexes for performance*
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_session_id ON documents(session_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX idx_requirements_countries ON country_requirements(source_country, target_country);
CREATE INDEX idx_legal_terms_languages ON legal_terms(source_language, target_language);
CREATE INDEX idx_queue_status ON processing_queue(document_id, completed_at);

*-- Functions*
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

*-- Triggers*
CREATE TRIGGER documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER requirements_updated_at BEFORE UPDATE ON country_requirements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

# PHASE 2: Core Services Implementation (Day 3-5)
### Step 2.1: OCR Service with Tesseract.js


typescript
*// src/lib/ocr/tesseract-worker.ts*
*/***
* IMPLEMENT THIS:
* Create a robust OCR service using Tesseract.js that:
* 1. Initializes worker pool for parallel processing
* 2. Supports multiple languages (eng, spa, chi_sim, ara, hin, por, fra, deu, jpn, kor)
* 3. Preprocesses images for better OCR (contrast, denoise, deskew)
* 4. Extracts structured data based on document type
* 5. Confidence scoring for each extracted field
* 6. Handles multi-page PDFs by splitting and processing
* 7. Caches trained data for faster subsequent processing
 **/*

*// Key implementation points:*
*// - Use Web Workers for non-blocking OCR*
*// - Implement progressive extraction (show results as they process)*
*// - Auto-detect document language*
*// - Extract key fields: names, dates, reference numbers, addresses*
*// - Return structured JSON with confidence scores*
### Step 2.2: Translation Service with LibreTranslate


typescript
*// src/lib/translation/libre-translate.ts*
*/***
* IMPLEMENT THIS:
* Build translation service that:
* 1. Self-hosts LibreTranslate instance or uses community server
* 2. Implements legal term mapping from database
* 3. Preserves formatting and structure
* 4. Handles batch translation for efficiency
* 5. Caches common translations
* 6. Falls back to alternative services if needed
* 
* Legal term mapping logic:
* - Check legal_terms table for exact matches
* - Apply context-aware substitutions
* - Preserve untranslatable terms (proper nouns, references)
* - Format numbers, dates, currency per target locale
 **/*

*// Setup local LibreTranslate:*
*// docker run -ti --rm -p 5000:5000 libretranslate/libretranslate*
### Step 2.3: Validation Engine


typescript
*// src/lib/validation/compliance-engine.ts
/**
* IMPLEMENT THIS:
* Create comprehensive validation system:
* 1. Load requirements from country_requirements table
* 2. Check document completeness
* 3. Validate required fields presence
* 4. Check format compliance (date formats, number formats)
* 5. Verify certification requirements
* 6. Generate compliance score (0-100)
* 7. Provide specific feedback on failures
* 
* Validation rules engine:
* - Required fields checker
* - Format validators (regex patterns)
* - Length constraints
* - Date validity (not expired, within range)
* - Cross-field validation (dates logical, amounts consistent)
 */*
### Step 2.4: PDF Generation Service


typescript
*// src/lib/pdf/generator.ts
/**
* IMPLEMENT THIS:
* PDF generation with pdf-lib:
* 1. Load country-specific templates
* 2. Map extracted fields to template positions
* 3. Apply formatting rules (fonts, sizes, spacing)
* 4. Add watermarks/headers as required
* 5. Generate certification pages
* 6. Embed metadata for verification
* 7. Create print-ready output
* 
* Features to implement:
* - Multi-language font support
* - Barcode/QR code generation for verification
* - Digital signature placeholders
* - Append certification instructions
* - A4/Letter size variants
 */*

# PHASE 3: Frontend Components (Day 6-8)
### Step 3.1: Document Upload Component


typescript
*// src/components/document/DocumentUploader.tsx
/**
* IMPLEMENT THIS:
* Advanced upload component with:
* 1. Drag-and-drop with visual feedback
* 2. Multiple file selection (up to 10)
* 3. File type validation (PDF, JPG, PNG, HEIC)
* 4. Image preprocessing (resize, compress)
* 5. Progress indication per file
* 6. Automatic document type detection
* 7. Country selection with search
* 8. Preview thumbnails
* 
* UX considerations:
* - Show sample documents on hover
* - Auto-detect source country from document
* - Remember user's common corridors
* - Bulk upload with same settings
 */*
### Step 3.2: Translation Interface


typescript
*// src/components/translation/SideBySideView.tsx
/**
* IMPLEMENT THIS:
* Split-screen translation viewer:
* 1. Synchronized scrolling
* 2. Highlight mapped terms on hover
* 3. Edit capability for corrections
* 4. Confidence indicators (color coding)
* 5. Alternative translations dropdown
* 6. Comment system for unclear sections
* 7. Zoom controls
* 8. Print preview mode
* 
* Features:
* - Click term to see legal mapping
* - Flag incorrect translations
* - Show/hide annotations
* - Export comparison PDF
 */*
### Step 3.3: Visual Compliance Guide


typescript
*// src/components/compliance/VisualGuide.tsx
/**
* IMPLEMENT THIS:
* Interactive compliance overlay:
* 1. Document image with overlay indicators
* 2. Red zones for missing elements
* 3. Green checkmarks for valid sections
* 4. Tooltips explaining requirements
* 5. Sample stamps/seals positioning
* 6. Interactive checklist sidebar
* 7. Severity levels (critical/warning/info)
* 
* Visual elements:
* - Animated arrows pointing to issues
* - Before/after comparison
* - Step-by-step fixing guide
* - Progress bar for compliance score
 */*

# PHASE 4: Data Population (Day 9-10)
### Step 4.1: Requirements Database


typescript
*// data/requirements/seed-requirements.ts
/**
* POPULATE THIS:
* Create comprehensive requirements for these corridors:
* 
* Priority corridors (implement all):
* 1. India → USA (H1B, F1, Green Card documents)
* 2. Mexico → USA (immigration, work permits)
* 3. China → Canada (immigration, study)
* 4. Philippines → UAE (work contracts)
* 5. Brazil → Portugal (ancestry, work)
* 6. Nigeria → UK (study, work)
* 7. Pakistan → UK (family, work)
* 8. Ukraine → Poland (refugee, work)
* 9. Venezuela → Spain (asylum, work)
* 10. Bangladesh → Saudi Arabia (work)
* 
* For each corridor, define:
* - Document-specific requirements
* - Apostille/attestation needs
* - Translation certification requirements
* - Format specifications
* - Office locations with coordinates
* - Current fees and processing times
* - Special notes and common mistakes
 */*
### Step 4.2: Legal Terms Dictionary


typescript
*// data/translations/legal-dictionary.ts
/**
* BUILD THIS:
* Comprehensive legal term mappings:
* 
* Categories to cover:
* 1. Educational terms (degree names, grades, institutions)
* 2. Legal entities (company types, court names)
* 3. Government positions (titles, departments)
* 4. Financial terms (tax types, account types)
* 5. Identity documents (ID types per country)
* 6. Marital status variants
* 7. Address formats
* 8. Date/time formats
* 
* Example mappings:
* - "Gesellschaft mit beschränkter Haftung (GmbH)" → "Limited Liability Company (LLC)"
* - "Cadastro de Pessoas Físicas (CPF)" → "Individual Taxpayer Registry"
* - "10+2" (Indian) → "High School Diploma" (US)
* - "Licenciatura" (Spanish) → "Bachelor's Degree" (English)
 */*

# PHASE 5: API Routes (Day 11-12)
### Step 5.1: OCR Processing Route


typescript
*// src/app/api/ocr/route.ts
/**
* IMPLEMENT THIS:
* POST endpoint for OCR processing:
* 1. Accept multipart/form-data with image
* 2. Queue processing job
* 3. Return job ID for status checking
* 4. WebSocket/SSE for progress updates
* 5. Handle timeouts and retries
* 6. Cache results for duplicate files
 */*
### Step 5.2: Translation Route


typescript
*// src/app/api/translate/route.ts
/**
* IMPLEMENT THIS:
* POST endpoint for translation:
* 1. Accept extracted text and language pair
* 2. Apply legal term mappings
* 3. Preserve structure and formatting
* 4. Return with confidence scores
* 5. Support partial retranslation
 */*
### Step 5.3: Validation Route


typescript
*// src/app/api/validate/route.ts
/**
* IMPLEMENT THIS:
* POST endpoint for validation:
* 1. Check against requirements database
* 2. Return detailed compliance report
* 3. Suggest fixes for issues
* 4. Generate certification checklist
 */*

# PHASE 6: Advanced Features (Day 13-15)
### Step 6.1: Intelligent Caching System


typescript
*/**
* IMPLEMENT:
* Multi-layer caching:
* 1. Browser cache for static requirements
* 2. IndexedDB for processed documents
* 3. Service Worker for offline capability
* 4. Redis for server-side caching (optional)
* 5. CDN for template files
 */*
### Step 6.2: Progressive Web App


typescript
*// next.config.js & manifest.json
/**
* CONFIGURE:
* PWA capabilities:
* 1. Offline document viewing
* 2. Install prompt
* 3. Push notifications for processing
* 4. Background sync for uploads
* 5. Share target for documents
 */*
### Step 6.3: Accessibility Features


typescript
*/**
* IMPLEMENT:
* Full accessibility:
* 1. Screen reader support
* 2. Keyboard navigation
* 3. High contrast mode
* 4. Text size controls
* 5. Language selection
* 6. Right-to-left support
 */*

# PHASE 7: Testing & Optimization (Day 16-18)
### Step 7.1: Test Suite


typescript
*// __tests__/
/**
* CREATE TESTS:
* 1. Unit tests for each service
* 2. Integration tests for workflows
* 3. E2E tests with Playwright
* 4. Load testing with k6
* 5. Accessibility testing with axe
* 6. Cross-browser testing
 */*
### Step 7.2: Performance Optimization


typescript
*/**
* OPTIMIZE:
* 1. Image lazy loading
* 2. Code splitting by route
* 3. Web Worker for heavy processing
* 4. Virtual scrolling for lists
* 5. Debounced API calls
* 6. Optimistic UI updates
* 7. WebAssembly for intensive operations
 */*

# PHASE 8: Deployment (Day 19-20)
### Step 8.1: Deployment Configuration


yaml
*# .github/workflows/deploy.yml*
/**
* SETUP:
* 1. GitHub Actions for CI/CD
* 2. Vercel for Next.js hosting (free tier)
* 3. Supabase for backend (free tier)
* 4. Cloudflare for CDN (free tier)
* 5. LibreTranslate on Railway (free tier)
* 6. Monitoring with Sentry (free tier)
 */
### Step 8.2: Environment Variables


env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
LIBRETRANSLATE_URL=http://localhost:5000
TESSERACT_WORKER_PATH=/workers/
NEXT_PUBLIC_APP_URL=http://localhost:3000

# CRITICAL IMPLEMENTATION NOTES
### Security Considerations


typescript
*/**
* MUST IMPLEMENT:
* 1. Client-side encryption for sensitive documents
* 2. Secure headers (CSP, HSTS, X-Frame-Options)
* 3. Rate limiting on all API routes
* 4. Input sanitization
* 5. File type verification (magic bytes)
* 6. Size limits enforcement
* 7. XSS prevention
* 8. SQL injection prevention (parameterized queries)
 */*
### User Experience Principles


typescript
*/**
* FOLLOW THESE:
* 1. Maximum 3 clicks to complete any task
* 2. Process visibility at all times
* 3. Graceful error handling with recovery options
* 4. Undo capabilities for all actions
* 5. Clear next steps always visible
* 6. Mobile-first responsive design
* 7. Loading states for all async operations
* 8. Helpful empty states with examples
 */*
### Performance Targets


typescript
*/**
* ACHIEVE THESE:
* 1. First Contentful Paint < 1.5s
* 2. Time to Interactive < 3s
* 3. OCR processing < 10s per page
* 4. Translation < 5s per page
* 5. PDF generation < 3s
* 6. 99.9% uptime
* 7. Support 1000 concurrent users
 */*

# LAUNCH CHECKLIST
### Pre-Launch Requirements
* All 10 corridors fully configured
* 1000+ legal terms mapped
* Sample documents for each type
* Video tutorials created
* Community forum setup
* GitHub repository public
* Documentation complete
* Security audit passed
* Load testing completed
* Accessibility audit passed

⠀Day 1 Launch Plan
1 Soft launch on HackerNews
2 Post on r/immigration, r/expats
3 Share in developer communities
4 Create ProductHunt launch
5 Reach out to immigration lawyers
6 Contact immigrant support organizations
7 Share in university international student groups

⠀Success Metrics
* Day 1: 100 documents processed
* Week 1: 1,000 users registered
* Month 1: 10,000 documents processed
* Month 3: 50,000 active users
* Month 6: 500,000 documents processed

⠀
# FINAL NOTES FOR CURSOR IDE


typescript
*/**
* TO THE AI ASSISTANT:
* 
* This is a humanitarian project. Every line of code you write
* could help reunite families, enable dreams, and change lives.
* 
* Code with these principles:
* 1. Simplicity over complexity
* 2. Accessibility for all users
* 3. Performance on low-end devices
* 4. Reliability over features
* 5. Privacy and security first
* 6. Open source everything
* 
* Remember: A refugee on a old phone with poor internet
* needs this to work just as well as anyone else.
* 
* Build this with love, build this with care.
* The world needs this to exist.
 */*

**START BUILDING:** Open this in Cursor, follow phases sequentially, test continuously, and create something beautiful that serves humanity. Every document processed is a door opened to opportunity.
