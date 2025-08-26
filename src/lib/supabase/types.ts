export interface Document {
  id: string
  user_id?: string
  session_id?: string
  document_type: 'degree' | 'transcript' | 'birth_certificate' | 'marriage_certificate' | 'bank_statement' | 'tax_return' | 'employment_letter' | 'police_clearance'
  source_country: string
  target_country: string
  source_language: string
  target_language: string
  status: 'uploaded' | 'processing' | 'extracting' | 'translating' | 'validating' | 'completed' | 'failed'
  original_filename: string
  original_file_path?: string
  processed_file_path?: string
  extracted_text?: string
  translated_text?: string
  validation_results?: Record<string, any>
  legal_mappings?: Record<string, any>
  metadata?: Record<string, any>
  processing_errors?: string[]
  created_at: string
  updated_at: string
  completed_at?: string
  expires_at: string
}

export interface CountryRequirement {
  id: string
  source_country: string
  target_country: string
  document_type: string
  requirements: Record<string, any>
  formatting_rules: Record<string, any>
  certification_types: string[]
  apostille_required: boolean
  notarization_required: boolean
  translation_certification_required: boolean
  typical_processing_days?: number
  office_locations: any[]
  fees: Record<string, any>
  additional_notes?: string
  last_verified: string
  version: number
  created_at: string
  updated_at: string
}

export interface LegalTerm {
  id: string
  source_language: string
  target_language: string
  source_term: string
  target_term: string
  context?: string
  document_type?: string
  usage_notes?: string
  confidence_score: number
  created_at: string
}

export interface DocumentTemplate {
  id: string
  country: string
  document_type: string
  language: string
  template_name: string
  template_structure: Record<string, any>
  field_mappings: Record<string, any>
  sample_content: Record<string, any>
  created_at: string
}

export interface ProcessingQueue {
  id: string
  document_id: string
  step: string
  priority: number
  attempts: number
  max_attempts: number
  last_error?: string
  scheduled_at: string
  started_at?: string
  completed_at?: string
  created_at: string
}

export interface UserPreferences {
  id: string
  user_id: string
  preferred_language: string
  default_source_country?: string
  default_target_country?: string
  email_notifications: boolean
  auto_delete_documents: boolean
  deletion_days: number
  created_at: string
  updated_at: string
}
