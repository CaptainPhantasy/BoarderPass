-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create documents table
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT,
  document_type TEXT NOT NULL,
  issue_country TEXT,
  target_country TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  original_text TEXT,
  translated_text TEXT,
  source_language TEXT,
  target_language TEXT,
  validation_results JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create country_requirements table
CREATE TABLE IF NOT EXISTS public.country_requirements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  country_code TEXT UNIQUE NOT NULL,
  country_name TEXT NOT NULL,
  document_types TEXT[] NOT NULL,
  apostille_required BOOLEAN DEFAULT false,
  translation_required BOOLEAN DEFAULT false,
  additional_requirements TEXT[],
  processing_time TEXT,
  validity_period TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create legal_terms table
CREATE TABLE IF NOT EXISTS public.legal_terms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  term TEXT NOT NULL,
  language TEXT NOT NULL,
  translation TEXT NOT NULL,
  context TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(term, language)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_country_requirements_country_code ON public.country_requirements(country_code);
CREATE INDEX IF NOT EXISTS idx_legal_terms_term ON public.legal_terms(term);
CREATE INDEX IF NOT EXISTS idx_legal_terms_language ON public.legal_terms(language);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_country_requirements_updated_at BEFORE UPDATE ON public.country_requirements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.country_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_terms ENABLE ROW LEVEL SECURITY;

-- Documents policies (users can only see their own documents)
CREATE POLICY "Users can view own documents" ON public.documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents" ON public.documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents" ON public.documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" ON public.documents
  FOR DELETE USING (auth.uid() = user_id);

-- Country requirements policies (all authenticated users can read)
CREATE POLICY "Authenticated users can view country requirements" ON public.country_requirements
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Legal terms policies (all authenticated users can read)
CREATE POLICY "Authenticated users can view legal terms" ON public.legal_terms
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload own documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );