import { ComplianceService } from '../compliance-service';

describe('ComplianceService', () => {
  let complianceService: ComplianceService;
  let mockRequirements: any[];

  beforeEach(() => {
    mockRequirements = [
      {
        country_code: 'US',
        country_name: 'United States',
        document_types: ['degree', 'transcript'],
        apostille_required: true,
        translation_required: true,
        additional_requirements: ['notarization'],
        processing_time: '15 days',
        validity_period: 'No expiry for educational documents',
      },
      {
        country_code: 'CA',
        country_name: 'Canada',
        document_types: ['degree'],
        apostille_required: true,
        translation_required: true,
        additional_requirements: ['certified_copy'],
        processing_time: '14 days',
        validity_period: 'No expiry for educational documents',
      },
    ];

    complianceService = new ComplianceService(mockRequirements);
  });

  describe('validateDocument', () => {
    it('should validate a valid document successfully', () => {
      const documentText = 'Bachelor of Science in Computer Science';
      const metadata = {
        type: 'degree',
        issueCountry: 'US',
        targetCountry: 'CA',
        issueDate: new Date('2020-05-15'),
        expiryDate: undefined,
      };

      const result = complianceService.validateDocument(documentText, metadata);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
      expect(result.requirements).toHaveLength(2);
    });

    it('should detect invalid document type', () => {
      const documentText = 'Birth Certificate';
      const metadata = {
        type: 'birth_certificate',
        issueCountry: 'US',
        targetCountry: 'CA',
        issueDate: new Date('2020-05-15'),
        expiryDate: undefined,
      };

      const result = complianceService.validateDocument(documentText, metadata);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('documentType');
      expect(result.errors[0].message).toContain('not accepted');
    });

    it('should check apostille requirements', () => {
      const documentText = 'Master Degree Certificate';
      const metadata = {
        type: 'degree',
        issueCountry: 'US',
        targetCountry: 'CA',
        issueDate: new Date('2020-05-15'),
        expiryDate: undefined,
      };

      const result = complianceService.validateDocument(documentText, metadata);

      const apostilleCheck = result.requirements.find(
        req => req.requirement.includes('apostille')
      );
      expect(apostilleCheck).toBeDefined();
      expect(apostilleCheck?.status).toBe('passed');
    });

    it('should check translation requirements', () => {
      const documentText = 'PhD Certificate';
      const metadata = {
        type: 'degree',
        issueCountry: 'US',
        targetCountry: 'CA',
        issueDate: new Date('2020-05-15'),
        expiryDate: undefined,
      };

      const result = complianceService.validateDocument(documentText, metadata);

      const translationCheck = result.requirements.find(
        req => req.requirement.includes('translation')
      );
      expect(translationCheck).toBeDefined();
      expect(translationCheck?.status).toBe('passed');
    });

    it('should handle missing country requirements gracefully', () => {
      const documentText = 'Certificate';
      const metadata = {
        type: 'degree',
        issueCountry: 'XX',
        targetCountry: 'YY',
        issueDate: new Date('2020-05-15'),
        expiryDate: undefined,
      };

      const result = complianceService.validateDocument(documentText, metadata);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].message).toContain('requirements not found');
    });

    it('should validate document expiry dates', () => {
      const documentText = 'Expired Certificate';
      const metadata = {
        type: 'degree',
        issueCountry: 'US',
        targetCountry: 'CA',
        issueDate: new Date('2010-05-15'),
        expiryDate: new Date('2015-05-15'),
      };

      const result = complianceService.validateDocument(documentText, metadata);

      const expiryCheck = result.requirements.find(
        req => req.requirement.includes('expiry')
      );
      expect(expiryCheck).toBeDefined();
      expect(expiryCheck?.status).toBe('failed');
    });
  });

  describe('checkForApostille', () => {
    it('should return true when apostille is required', () => {
      const result = complianceService.checkForApostille('US', 'CA');
      expect(result).toBe(true);
    });

    it('should return false when apostille is not required', () => {
      // Add a country without apostille requirement
      mockRequirements.push({
        country_code: 'UK',
        country_name: 'United Kingdom',
        document_types: ['degree'],
        apostille_required: false,
        translation_required: false,
        additional_requirements: [],
        processing_time: '10 days',
        validity_period: '1 year',
      });

      const newService = new ComplianceService(mockRequirements);
      const result = newService.checkForApostille('US', 'UK');
      expect(result).toBe(false);
    });
  });

  describe('checkTranslation', () => {
    it('should return true when translation is required', () => {
      const result = complianceService.checkTranslation('US', 'CA');
      expect(result).toBe(true);
    });

    it('should return false when translation is not required', () => {
      // Add a country without translation requirement
      mockRequirements.push({
        country_code: 'AU',
        country_name: 'Australia',
        document_types: ['degree'],
        apostille_required: true,
        translation_required: false,
        additional_requirements: [],
        processing_time: '12 days',
        validity_period: '2 years',
      });

      const newService = new ComplianceService(mockRequirements);
      const result = newService.checkTranslation('US', 'AU');
      expect(result).toBe(false);
    });
  });

  describe('checkValidity', () => {
    it('should return true for valid document dates', () => {
      const issueDate = new Date('2020-05-15');
      const expiryDate = new Date('2030-05-15');
      const result = complianceService.checkValidity(issueDate, expiryDate);
      expect(result).toBe(true);
    });

    it('should return false for expired documents', () => {
      const issueDate = new Date('2010-05-15');
      const expiryDate = new Date('2015-05-15');
      const result = complianceService.checkValidity(issueDate, expiryDate);
      expect(result).toBe(false);
    });

    it('should return true for documents without expiry', () => {
      const issueDate = new Date('2020-05-15');
      const result = complianceService.checkValidity(issueDate, undefined);
      expect(result).toBe(true);
    });
  });

  describe('getCountryRequirements', () => {
    it('should return requirements for a specific country', () => {
      const requirements = complianceService.getCountryRequirements('US');
      expect(requirements).toBeDefined();
      expect(requirements?.country_code).toBe('US');
      expect(requirements?.country_name).toBe('United States');
    });

    it('should return undefined for unknown country', () => {
      const requirements = complianceService.getCountryRequirements('XX');
      expect(requirements).toBeUndefined();
    });
  });

  describe('getDocumentTypes', () => {
    it('should return document types for a country', () => {
      const documentTypes = complianceService.getDocumentTypes('US');
      expect(documentTypes).toEqual(['degree', 'transcript']);
    });

    it('should return empty array for unknown country', () => {
      const documentTypes = complianceService.getDocumentTypes('XX');
      expect(documentTypes).toEqual([]);
    });
  });
});
