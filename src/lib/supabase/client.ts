import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Types for database tables
export interface User {
  id: string;
  email: string;
  full_name?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Document {
  id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  document_type: string;
  issue_country?: string;
  target_country?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  original_text?: string;
  translated_text?: string;
  source_language?: string;
  target_language?: string;
  validation_results?: any;
  created_at: Date;
  updated_at: Date;
}

export interface CountryRequirement {
  id: string;
  country_code: string;
  country_name: string;
  document_types: string[];
  apostille_required: boolean;
  translation_required: boolean;
  additional_requirements?: string[];
  processing_time?: string;
  validity_period?: string;
  created_at: Date;
  updated_at: Date;
}

export interface LegalTerm {
  id: string;
  term: string;
  language: string;
  translation: string;
  context?: string;
  created_at: Date;
}

// Helper functions
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      // Don't throw error for auth issues, return null instead
      if (error.message?.includes('JWT') || error.status === 401) {
        return null;
      }
      console.error('getCurrentUser error:', error);
      throw error;
    }
    
    return user;
  } catch (error) {
    console.error('getCurrentUser error:', error);
    return null; // Return null for any authentication errors
  }
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signUp(email: string, password: string, fullName?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
}

// Document operations
export async function createDocument(document: Omit<Document, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('documents')
    .insert(document)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateDocument(id: string, updates: Partial<Document>) {
  const { data, error } = await supabase
    .from('documents')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getDocument(id: string) {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function getUserDocuments(userId: string) {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching user documents:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    throw error;
  }
  return data;
}

export async function deleteDocument(id: string) {
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// Country requirements operations
export async function getCountryRequirements(countryCode?: string) {
  let query = supabase.from('country_requirements').select('*');
  
  if (countryCode) {
    query = query.eq('country_code', countryCode);
    const { data, error } = await query.single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await query.order('country_name');
    if (error) throw error;
    return data;
  }
}

// Legal terms operations
export async function getLegalTerms(language?: string) {
  let query = supabase.from('legal_terms').select('*');
  
  if (language) {
    query = query.eq('language', language);
  }
  
  const { data, error } = await query.order('term');
  if (error) throw error;
  return data;
}

export async function searchLegalTerm(term: string, language?: string) {
  let query = supabase
    .from('legal_terms')
    .select('*')
    .ilike('term', `%${term}%`);
  
  if (language) {
    query = query.eq('language', language);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// File upload operations
export async function uploadFile(file: File, path: string) {
  const { data, error } = await supabase.storage
    .from('documents')
    .upload(path, file);
  
  if (error) throw error;
  return data;
}

export async function getFileUrl(path: string) {
  const { data } = supabase.storage
    .from('documents')
    .getPublicUrl(path);
  
  return data.publicUrl;
}

export async function deleteFile(path: string) {
  const { error } = await supabase.storage
    .from('documents')
    .remove([path]);
  
  if (error) throw error;
}