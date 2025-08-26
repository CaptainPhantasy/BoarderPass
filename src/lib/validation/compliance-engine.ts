import { CountryRequirement } from '@/lib/supabase/types'

export interface ValidationResult {
  isCompliant: boolean
  complianceScore: number
  issues: ValidationIssue[]
  warnings: ValidationWarning[]
  recommendations: string[]
  requiredFields: string[]
  missingFields: string[]
  certificationRequirements: CertificationRequirement[]
  processingTime: number
}

export interface ValidationIssue {
  field: string
  type: 'error' | 'warning' | 'info'
  message: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  suggestion?: string
}

export interface ValidationWarning {
  field: string
  message: string
  impact: string
  recommendation: string
}

export interface CertificationRequirement {
  type: string
  required: boolean
  description: string
  officeLocation?: string
  processingTime?: number
  fees?: number
}

export interface DocumentField {
  name: string
  value: string
  type: 'text' | 'date' | 'number' | 'email' | 'phone' | 'address'
  required: boolean
  validationRules?: ValidationRule[]
}

export interface ValidationRule {
  type: 'regex' | 'length' | 'range' | 'format' | 'custom'
  pattern?: string
  minLength?: number
  maxLength?: number
  minValue?: number
  maxValue?: number
  format?: string
  customValidator?: (value: string) => boolean
  errorMessage: string
}

class ComplianceEngine {
  private requirementsCache: Map<string, CountryRequirement> = new Map()
  private validationRules: Map<string, ValidationRule[]> = new Map()

  constructor() {
    this.initializeValidationRules()
  }

  /**
   * Initialize validation rules for different document types
   */
  private initializeValidationRules(): void {
    // Academic documents validation rules
    this.validationRules.set('degree', [
      {
        type: 'regex',
        pattern: '^(Bachelor|Master|PhD|Doctorate|Associate|Diploma)',
        errorMessage: 'Degree type must be one of: Bachelor, Master, PhD, Doctorate, Associate, Diploma'
      },
      {
        type: 'regex',
        pattern: '^[A-Za-z\\s&]+$',
        errorMessage: 'Institution name must contain only letters, spaces, and ampersands'
      },
      {
        type: 'regex',
        pattern: '^(19|20)\\d{2}$',
        errorMessage: 'Graduation year must be a valid year between 1900 and current year'
      }
    ])

    this.validationRules.set('transcript', [
      {
        type: 'regex',
        pattern: '^[A-Za-z\\s&]+$',
        errorMessage: 'Institution name must contain only letters, spaces, and ampersands'
      },
      {
        type: 'regex',
        pattern: '^\\d{1,2}[\\/\\-]\\d{1,2}[\\/\\-]\\d{2,4}$',
        errorMessage: 'Date must be in MM/DD/YYYY or MM-DD-YYYY format'
      }
    ])

    this.validationRules.set('birth_certificate', [
      {
        type: 'regex',
        pattern: '^[A-Za-z\\s]+$',
        errorMessage: 'Full name must contain only letters and spaces'
      },
      {
        type: 'regex',
        pattern: '^(19|20)\\d{2}-\\d{2}-\\d{2}$',
        errorMessage: 'Birth date must be in YYYY-MM-DD format'
      },
      {
        type: 'regex',
        pattern: '^[A-Za-z\\s,]+$',
        errorMessage: 'Birth place must contain only letters, spaces, and commas'
      }
    ])

    this.validationRules.set('bank_statement', [
      {
        type: 'regex',
        pattern: '^[A-Z0-9\\-]+$',
        errorMessage: 'Account number must contain only uppercase letters, numbers, and hyphens'
      },
      {
        type: 'regex',
        pattern: '^\\$?[\\d,]+\\.?\\d*$',
        errorMessage: 'Balance must be a valid currency amount'
      }
    ])

    this.validationRules.set('employment_letter', [
      {
        type: 'regex',
        pattern: '^[A-Za-z\\s&]+$',
        errorMessage: 'Company name must contain only letters, spaces, and ampersands'
      },
      {
        type: 'regex',
        pattern: '^[A-Za-z\\s]+$',
        errorMessage: 'Position title must contain only letters and spaces'
      },
      {
        type: 'regex',
        pattern: '^\\$?[\\d,]+\\.?\\d*$',
        errorMessage: 'Salary must be a valid currency amount'
      }
    ])
  }

  /**
   * Validate document against country requirements
   */
  async validateDocument(
    documentType: string,
    sourceCountry: string,
    targetCountry: string,
    extractedFields: DocumentField[],
    requirements?: CountryRequirement
  ): Promise<ValidationResult> {
    const startTime = Date.now()
    
    try {
      // Load requirements if not provided
      if (!requirements) {
        requirements = await this.loadRequirements(documentType, sourceCountry, targetCountry)
      }

      if (!requirements) {
        throw new Error(`No requirements found for ${documentType} from ${sourceCountry} to ${targetCountry}`)
      }

      const issues: ValidationIssue[] = []
      const warnings: ValidationWarning[] = []
      const missingFields: string[] = []
      const requiredFields = requirements.requirements.required_fields || []

      // Check required fields
      for (const requiredField of requiredFields) {
        const field = extractedFields.find(f => f.name.toLowerCase() === requiredField.toLowerCase())
        if (!field || !field.value.trim()) {
          missingFields.push(requiredField)
          issues.push({
            field: requiredField,
            type: 'error',
            message: `Required field '${requiredField}' is missing`,
            severity: 'critical'
          })
        }
      }

      // Validate field values
      for (const field of extractedFields) {
        const fieldIssues = this.validateField(field, documentType)
        issues.push(...fieldIssues)
      }

      // Check certification requirements
      const certificationRequirements = this.getCertificationRequirements(requirements)
      
      // Check formatting rules
      const formattingIssues = this.validateFormatting(extractedFields, requirements.formatting_rules)
      issues.push(...formattingIssues)

      // Calculate compliance score
      const complianceScore = this.calculateComplianceScore(issues, missingFields, requiredFields.length)

      // Generate recommendations
      const recommendations = this.generateRecommendations(issues, warnings, requirements)

      return {
        isCompliant: complianceScore >= 80 && missingFields.length === 0,
        complianceScore,
        issues,
        warnings,
        recommendations,
        requiredFields,
        missingFields,
        certificationRequirements,
        processingTime: Date.now() - startTime
      }

    } catch (error) {
      console.error('Document validation failed:', error)
      throw new Error(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Load requirements from database
   */
  private async loadRequirements(
    documentType: string,
    sourceCountry: string,
    targetCountry: string
  ): Promise<CountryRequirement | null> {
    try {
      // TODO: Implement actual database query to Supabase
      // This is a placeholder for the real implementation
      const cacheKey = `${sourceCountry}:${targetCountry}:${documentType}`
      
      if (this.requirementsCache.has(cacheKey)) {
        return this.requirementsCache.get(cacheKey)!
      }

      // For now, return mock requirements
      const mockRequirements: CountryRequirement = {
        id: 'mock-id',
        source_country: sourceCountry,
        target_country: targetCountry,
        document_type: documentType,
        requirements: {
          required_fields: this.getDefaultRequiredFields(documentType),
          field_formats: this.getDefaultFieldFormats(documentType)
        },
        formatting_rules: this.getDefaultFormattingRules(documentType),
        certification_types: ['apostille', 'notarization'],
        apostille_required: true,
        notarization_required: false,
        translation_certification_required: true,
        typical_processing_days: 5,
        office_locations: [],
        fees: { processing: 50, certification: 25 },
        additional_notes: 'Standard processing requirements',
        last_verified: new Date().toISOString(),
        version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      this.requirementsCache.set(cacheKey, mockRequirements)
      return mockRequirements

    } catch (error) {
      console.error('Failed to load requirements:', error)
      return null
    }
  }

  /**
   * Get default required fields for document type
   */
  private getDefaultRequiredFields(documentType: string): string[] {
    switch (documentType) {
      case 'degree': {
        return ['degree_type', 'institution', 'graduation_date', 'field_of_study']
      }
      case 'transcript': {
        return ['institution', 'student_name', 'academic_period', 'gpa']
      }
      case 'birth_certificate': {
        return ['full_name', 'birth_date', 'birth_place', 'parent_names']
      }
      case 'bank_statement': {
        return ['account_holder', 'account_number', 'statement_period', 'balance']
      }
      case 'employment_letter': {
        return ['company_name', 'position', 'employment_date', 'salary']
      }
      default: {
        return ['document_type', 'issue_date', 'issuing_authority']
      }
    }
  }

  /**
   * Get default field formats for document type
   */
  private getDefaultFieldFormats(documentType: string): Record<string, string> {
    switch (documentType) {
      case 'degree': {
        return {
          graduation_date: 'YYYY-MM-DD',
          gpa: 'X.XX'
        }
      }
      case 'birth_certificate': {
        return {
          birth_date: 'YYYY-MM-DD'
        }
      }
      case 'bank_statement': {
        return {
          balance: 'currency',
          statement_period: 'MM/YYYY'
        }
      }
      default: {
        return {}
      }
    }
  }

  /**
   * Get default formatting rules for document type
   */
  private getDefaultFormattingRules(documentType: string): Record<string, any> {
    return {
      font_family: 'Arial, sans-serif',
      font_size: '12pt',
      line_spacing: '1.5',
      margins: { top: '1in', right: '1in', bottom: '1in', left: '1in' }
    }
  }

  /**
   * Validate individual field
   */
  private validateField(field: DocumentField, documentType: string): ValidationIssue[] {
    const issues: ValidationIssue[] = []
    const rules = this.validationRules.get(documentType) || []

    for (const rule of rules) {
      if (!this.validateFieldRule(field.value, rule)) {
        issues.push({
          field: field.name,
          type: 'error',
          message: rule.errorMessage,
          severity: 'high',
          suggestion: this.getFieldSuggestion(field.name, rule)
        })
      }
    }

    // Additional custom validations
    if (field.type === 'date') {
      if (!this.isValidDate(field.value)) {
        issues.push({
          field: field.name,
          type: 'error',
          message: `Invalid date format for field '${field.name}'`,
          severity: 'medium',
          suggestion: 'Use YYYY-MM-DD format'
        })
      }
    }

    if (field.type === 'email') {
      if (!this.isValidEmail(field.value)) {
        issues.push({
          field: field.name,
          type: 'error',
          message: `Invalid email format for field '${field.name}'`,
          severity: 'medium',
          suggestion: 'Use a valid email address format'
        })
      }
    }

    return issues
  }

  /**
   * Validate field against a specific rule
   */
  private validateFieldRule(value: string, rule: ValidationRule): boolean {
    switch (rule.type) {
      case 'regex': {
        if (!rule.pattern) return true
        return new RegExp(rule.pattern).test(value)
      }
      
      case 'length': {
        if (rule.minLength && value.length < rule.minLength) return false
        if (rule.maxLength && value.length > rule.maxLength) return false
        return true
      }
      
      case 'range': {
        const numValue = parseFloat(value)
        if (isNaN(numValue)) return false
        if (rule.minValue && numValue < rule.minValue) return false
        if (rule.maxValue && numValue > rule.maxValue) return false
        return true
      }
      
      case 'format': {
        if (!rule.format) return true
        // Implement format validation logic
        return true
      }
      
      case 'custom': {
        if (!rule.customValidator) return true
        return rule.customValidator(value)
      }
      
      default: {
        return true
      }
    }
  }

  /**
   * Validate formatting rules
   */
  private validateFormatting(fields: DocumentField[], formattingRules: Record<string, any>): ValidationIssue[] {
    const issues: ValidationIssue[] = []
    
    // Check if document meets formatting requirements
    // This is a simplified implementation
    if (formattingRules.min_length && fields.length < formattingRules.min_length) {
      issues.push({
        field: 'document',
        type: 'warning',
        message: `Document may be too short. Minimum recommended length: ${formattingRules.min_length} fields`,
        severity: 'low'
      })
    }

    return issues
  }

  /**
   * Get certification requirements
   */
  private getCertificationRequirements(requirements: CountryRequirement): CertificationRequirement[] {
    const certifications: CertificationRequirement[] = []

    if (requirements.apostille_required) {
      certifications.push({
        type: 'Apostille',
        required: true,
        description: 'Document must be apostilled by competent authority',
        officeLocation: 'Secretary of State office',
        processingTime: 3,
        fees: 20
      })
    }

    if (requirements.notarization_required) {
      certifications.push({
        type: 'Notarization',
        required: true,
        description: 'Document must be notarized by a licensed notary',
        officeLocation: 'Local notary public',
        processingTime: 1,
        fees: 10
      })
    }

    if (requirements.translation_certification_required) {
      certifications.push({
        type: 'Translation Certification',
        required: true,
        description: 'Translation must be certified by a qualified translator',
        officeLocation: 'Certified translation service',
        processingTime: 2,
        fees: 50
      })
    }

    return certifications
  }

  /**
   * Calculate compliance score
   */
  private calculateComplianceScore(
    issues: ValidationIssue[],
    missingFields: string[],
    totalRequiredFields: number
  ): number {
    const criticalIssues = issues.filter(i => i.severity === 'critical').length
    const highIssues = issues.filter(i => i.severity === 'high').length
    const mediumIssues = issues.filter(i => i.severity === 'medium').length
    const lowIssues = issues.filter(i => i.severity === 'low').length

    let score = 100

    // Deduct points for issues
    score -= criticalIssues * 20
    score -= highIssues * 15
    score -= mediumIssues * 10
    score -= lowIssues * 5

    // Deduct points for missing required fields
    const missingFieldPenalty = (missingFields.length / totalRequiredFields) * 30
    score -= missingFieldPenalty

    return Math.max(0, Math.min(100, Math.round(score)))
  }

  /**
   * Generate recommendations based on validation results
   */
  private generateRecommendations(
    issues: ValidationIssue[],
    warnings: ValidationWarning[],
    requirements: CountryRequirement
  ): string[] {
    const recommendations: string[] = []

    if (issues.some(i => i.severity === 'critical')) {
      recommendations.push('Fix all critical issues before proceeding with document submission')
    }

    if (requirements.apostille_required) {
      recommendations.push('Obtain apostille certification from the Secretary of State office')
    }

    if (requirements.notarization_required) {
      recommendations.push('Have the document notarized by a licensed notary public')
    }

    if (requirements.translation_certification_required) {
      recommendations.push('Ensure translation is certified by a qualified translator')
    }

    if (requirements.typical_processing_days) {
      recommendations.push(`Allow ${requirements.typical_processing_days} business days for processing`)
    }

    return recommendations
  }

  /**
   * Get field-specific suggestions
   */
  private getFieldSuggestion(fieldName: string, rule: ValidationRule): string {
    // This could be expanded with more specific suggestions
    return `Review the format requirements for ${fieldName}`
  }

  /**
   * Utility functions
   */
  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString)
    return date instanceof Date && !isNaN(date.getTime())
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Clear requirements cache
   */
  clearCache(): void {
    this.requirementsCache.clear()
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { requirementsCacheSize: number } {
    return {
      requirementsCacheSize: this.requirementsCache.size
    }
  }
}

// Export singleton instance
export const complianceEngine = new ComplianceEngine()

// Export for testing
export { ComplianceEngine }
