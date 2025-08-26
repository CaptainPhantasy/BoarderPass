export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  requirements: RequirementCheck[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'critical' | 'high' | 'medium';
}

export interface ValidationWarning {
  field: string;
  message: string;
}

export interface RequirementCheck {
  requirement: string;
  status: 'passed' | 'failed' | 'warning' | 'not_applicable';
  details?: string;
}

export interface DocumentMetadata {
  type: string;
  issueCountry: string;
  targetCountry: string;
  issueDate?: Date;
  expiryDate?: Date;
}

export interface CountryRequirement {
  country: string;
  documentTypes: string[];
  apostilleRequired: boolean;
  translationRequired: boolean;
  additionalRequirements?: string[];
  processingTime?: string;
  validityPeriod?: string;
}

export class ComplianceService {
  private requirements: Map<string, CountryRequirement> = new Map();

  constructor(requirements?: CountryRequirement[]) {
    if (requirements) {
      this.loadRequirements(requirements);
    }
  }

  loadRequirements(requirements: CountryRequirement[]): void {
    requirements.forEach(req => {
      this.requirements.set(req.country.toLowerCase(), req);
    });
  }

  validateDocument(
    documentText: string,
    metadata: DocumentMetadata
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const requirementChecks: RequirementCheck[] = [];

    // Get country requirements
    const countryReq = this.requirements.get(metadata.targetCountry.toLowerCase());
    
    if (!countryReq) {
      warnings.push({
        field: 'targetCountry',
        message: `No specific requirements found for ${metadata.targetCountry}. Using general validation.`,
      });
    }

    // Check document type
    if (countryReq) {
      const isValidType = countryReq.documentTypes.includes(metadata.type);
      requirementChecks.push({
        requirement: 'Document Type',
        status: isValidType ? 'passed' : 'failed',
        details: isValidType 
          ? `${metadata.type} is accepted`
          : `${metadata.type} is not accepted. Accepted types: ${countryReq.documentTypes.join(', ')}`,
      });

      if (!isValidType) {
        errors.push({
          field: 'documentType',
          message: `Document type ${metadata.type} is not accepted for ${metadata.targetCountry}`,
          severity: 'critical',
        });
      }
    }

    // Check apostille requirement
    if (countryReq?.apostilleRequired) {
      const hasApostille = this.checkForApostille(documentText);
      requirementChecks.push({
        requirement: 'Apostille',
        status: hasApostille ? 'passed' : 'failed',
        details: hasApostille 
          ? 'Apostille detected in document'
          : 'Apostille required but not found',
      });

      if (!hasApostille) {
        errors.push({
          field: 'apostille',
          message: 'Document requires apostille certification',
          severity: 'high',
        });
      }
    }

    // Check translation requirement
    if (countryReq?.translationRequired) {
      requirementChecks.push({
        requirement: 'Translation',
        status: 'warning',
        details: 'Document requires certified translation',
      });

      warnings.push({
        field: 'translation',
        message: 'Document must be translated by a certified translator',
      });
    }

    // Check document dates
    if (metadata.expiryDate) {
      const isExpired = new Date() > metadata.expiryDate;
      requirementChecks.push({
        requirement: 'Document Validity',
        status: isExpired ? 'failed' : 'passed',
        details: isExpired 
          ? 'Document has expired'
          : `Document valid until ${metadata.expiryDate.toLocaleDateString()}`,
      });

      if (isExpired) {
        errors.push({
          field: 'expiryDate',
          message: 'Document has expired',
          severity: 'critical',
        });
      }
    }

    // Check validity period requirement
    if (countryReq?.validityPeriod && metadata.issueDate) {
      const validityMonths = this.parseValidityPeriod(countryReq.validityPeriod);
      const maxDate = new Date(metadata.issueDate);
      maxDate.setMonth(maxDate.getMonth() + validityMonths);
      
      const isWithinValidity = new Date() <= maxDate;
      requirementChecks.push({
        requirement: 'Validity Period',
        status: isWithinValidity ? 'passed' : 'failed',
        details: isWithinValidity
          ? `Document is within ${countryReq.validityPeriod} validity period`
          : `Document exceeds ${countryReq.validityPeriod} validity period`,
      });

      if (!isWithinValidity) {
        errors.push({
          field: 'validityPeriod',
          message: `Document exceeds ${countryReq.validityPeriod} validity period`,
          severity: 'high',
        });
      }
    }

    // Check additional requirements
    if (countryReq?.additionalRequirements) {
      countryReq.additionalRequirements.forEach(req => {
        requirementChecks.push({
          requirement: req,
          status: 'warning',
          details: 'Manual verification required',
        });

        warnings.push({
          field: 'additionalRequirement',
          message: req,
        });
      });
    }

    // Check for common issues
    this.checkCommonIssues(documentText, errors, warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      requirements: requirementChecks,
    };
  }

  private checkForApostille(text: string): boolean {
    const apostilleKeywords = [
      'apostille',
      'hague convention',
      'convention de la haye',
      'apostilla',
      'apostila',
    ];

    const lowerText = text.toLowerCase();
    return apostilleKeywords.some(keyword => lowerText.includes(keyword));
  }

  private checkCommonIssues(
    text: string,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    // Check for poor scan quality indicators
    const illegibleRatio = this.calculateIllegibleRatio(text);
    if (illegibleRatio > 0.2) {
      warnings.push({
        field: 'quality',
        message: 'Document may have poor scan quality. Consider re-scanning.',
      });
    }

    // Check for missing critical information
    if (!this.containsDate(text)) {
      warnings.push({
        field: 'date',
        message: 'No date found in document',
      });
    }

    if (!this.containsSignature(text)) {
      warnings.push({
        field: 'signature',
        message: 'No signature detected in document',
      });
    }

    // Check for watermarks or stamps
    if (!this.containsOfficialMarks(text)) {
      warnings.push({
        field: 'authentication',
        message: 'No official stamps or seals detected',
      });
    }
  }

  private calculateIllegibleRatio(text: string): number {
    // Count special characters and unusual patterns that might indicate OCR errors
    const specialChars = (text.match(/[^\w\s.,;:!?'"()-]/g) || []).length;
    const totalChars = text.length;
    return totalChars > 0 ? specialChars / totalChars : 0;
  }

  private containsDate(text: string): boolean {
    const datePatterns = [
      /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/,
      /\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}/,
      /(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}/i,
      /\d{1,2}\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}/i,
    ];

    return datePatterns.some(pattern => pattern.test(text));
  }

  private containsSignature(text: string): boolean {
    const signatureKeywords = [
      'signature',
      'signed',
      'firma',
      'assinatura',
      'unterschrift',
      'подпись',
    ];

    const lowerText = text.toLowerCase();
    return signatureKeywords.some(keyword => lowerText.includes(keyword));
  }

  private containsOfficialMarks(text: string): boolean {
    const officialKeywords = [
      'seal',
      'stamp',
      'notary',
      'certified',
      'official',
      'embassy',
      'consulate',
      'ministry',
      'department',
    ];

    const lowerText = text.toLowerCase();
    return officialKeywords.some(keyword => lowerText.includes(keyword));
  }

  private parseValidityPeriod(period: string): number {
    const match = period.match(/(\d+)\s*(month|year)/i);
    if (!match) return 6; // Default to 6 months

    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();

    return unit === 'year' ? value * 12 : value;
  }

  getCountryRequirements(country: string): CountryRequirement | undefined {
    return this.requirements.get(country.toLowerCase());
  }

  getAllCountries(): string[] {
    return Array.from(this.requirements.keys());
  }
}

// Singleton instance
let complianceService: ComplianceService | null = null;

export function getComplianceService(requirements?: CountryRequirement[]): ComplianceService {
  if (!complianceService) {
    complianceService = new ComplianceService(requirements);
  } else if (requirements) {
    complianceService.loadRequirements(requirements);
  }
  return complianceService;
}