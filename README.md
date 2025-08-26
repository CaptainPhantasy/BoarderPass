# BOARDERPASS 🌍

**Humanitarian document translation platform helping refugees, immigrants, and global citizens with international document requirements.**

## 🎯 Mission

BOARDERPASS is a completely free, open-source web application that democratizes international document translation and validation, removing all barriers to global mobility. This is a gift to humanity - no paywalls, no premium tiers, everyone gets everything.

## ✨ Features

### 🔍 Advanced OCR Processing
- Multi-language support (10+ languages including Chinese, Arabic, Hindi)
- Image preprocessing and automatic text extraction
- Confidence scoring for quality assessment

### 🌐 Professional Translation
- LibreTranslate integration with legal terminology
- 321+ legal term mappings across multiple languages
- Format preservation and batch processing

### ✅ Compliance Validation
- Country-specific requirements for 8 priority corridors
- Real-time validation against international standards
- Apostille and notarization requirement checking

### 📄 Certified PDF Generation
- Professional document templates
- Digital signatures and watermarking
- Multi-format support for various document types

## 🚀 Quick Start

### Prerequisites
- Node.js 20.16.0 or higher
- Supabase account
- LibreTranslate service (configured)

### Installation

```bash
# Clone the repository
git clone https://github.com/CaptainPhantasy/BoarderPass.git
cd BoarderPass

# Install dependencies
npm install

# Set up environment
cp env.example .env.local
# Update .env.local with your Supabase credentials

# Run database migration
# Execute the SQL in supabase/migrations/001_initial_schema.sql

# Start development server
npm run dev
```

### Available Commands

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:populate      # Populate database with sample data
npm run db:verify        # Verify database integrity

# Testing
npm run test:unit        # Run Jest unit tests
npm run test:e2e         # Run Playwright E2E tests
npm run test:all         # Run all tests

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting errors
```

## 🏗️ Architecture

### Technology Stack
- **Next.js 15**: App Router with TypeScript
- **Supabase**: Database, authentication, storage
- **Tailwind CSS**: Utility-first styling
- **Tesseract.js**: OCR processing
- **LibreTranslate**: Document translation
- **pdf-lib**: PDF generation

### Project Structure
```
src/
├── app/                    # Next.js App Router
├── components/             # React components
├── lib/                   # Core services
│   ├── ocr/              # OCR processing
│   ├── translation/      # Translation services
│   ├── validation/       # Compliance checking
│   └── pdf/             # PDF generation
└── types/                # TypeScript definitions
```

## 📊 Production Status

- **85.9% Complete** (55 of 64 items implemented)
- **All critical blockers resolved**
- **Ready for deployment**

### What's Working ✅
- Complete authentication system
- Document processing pipeline
- Database with 8 countries, 321+ legal terms
- PWA features with offline support
- Security headers and error handling

## 🌐 Supported Document Types

- Academic degrees and transcripts
- Birth and marriage certificates
- Bank statements and tax returns
- Employment letters
- Police clearance certificates

## 🤝 Contributing

We welcome contributions! This humanitarian platform helps real people every day.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - helping humanity should be free and open.

---

**Made with ❤️ for global mobility and human dignity.**
