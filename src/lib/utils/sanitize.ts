import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target'],
  });
}

/**
 * Sanitize plain text by removing potentially dangerous characters
 */
export function sanitizeText(text: string): string {
  if (typeof text !== 'string') return '';
  
  return text
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validate and sanitize email addresses
 */
export function sanitizeEmail(email: string): string | null {
  if (typeof email !== 'string') return null;
  
  const sanitized = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(sanitized)) return null;
  
  // Additional security checks
  if (sanitized.length > 254) return null; // RFC 5321 limit
  if (sanitized.includes('..')) return null; // No consecutive dots
  
  return sanitized;
}

/**
 * Validate and sanitize file names
 */
export function sanitizeFileName(fileName: string): string {
  if (typeof fileName !== 'string') return 'file';
  
  return fileName
    .replace(/[<>:"/\\|?*]/g, '_') // Remove invalid characters
    .replace(/\.{2,}/g, '.') // Remove consecutive dots
    .replace(/^\.+|\.+$/g, '') // Remove leading/trailing dots
    .substring(0, 255) // Limit length
    .trim() || 'file';
}

/**
 * Validate and sanitize URLs
 */
export function sanitizeURL(url: string): string | null {
  if (typeof url !== 'string') return null;
  
  const sanitized = url.trim();
  
  try {
    const parsed = new URL(sanitized);
    
    // Only allow HTTPS and HTTP protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    
    // Additional security checks
    if (parsed.hostname.includes('..')) return null; // No consecutive dots
    if (parsed.hostname.length > 253) return null; // RFC 1034 limit
    
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Validate and sanitize country codes
 */
export function sanitizeCountryCode(code: string): string | null {
  if (typeof code !== 'string') return null;
  
  const sanitized = code.trim().toUpperCase();
  
  // ISO 3166-1 alpha-2 country codes are 2 letters
  if (!/^[A-Z]{2}$/.test(sanitized)) return null;
  
  return sanitized;
}

/**
 * Validate and sanitize language codes
 */
export function sanitizeLanguageCode(code: string): string | null {
  if (typeof code !== 'string') return null;
  
  const sanitized = code.trim().toLowerCase();
  
  // ISO 639-1 language codes are 2 letters
  if (!/^[a-z]{2}$/.test(sanitized)) return null;
  
  return sanitized;
}

/**
 * Validate and sanitize document types
 */
export function sanitizeDocumentType(type: string): string | null {
  if (typeof type !== 'string') return null;
  
  const sanitized = type.trim().toLowerCase();
  
  // Allowed document types
  const allowedTypes = [
    'passport', 'birth_certificate', 'marriage_certificate', 'death_certificate',
    'degree', 'transcript', 'diploma', 'certificate', 'affidavit',
    'power_of_attorney', 'criminal_record', 'medical_certificate'
  ];
  
  if (!allowedTypes.includes(sanitized)) return null;
  
  return sanitized;
}

/**
 * Validate and sanitize file size (in bytes)
 */
export function validateFileSize(size: number, maxSize: number = 10 * 1024 * 1024): boolean {
  if (typeof size !== 'number' || size < 0) return false;
  return size <= maxSize;
}

/**
 * Validate and sanitize file type
 */
export function validateFileType(file: File, allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']): boolean {
  if (!file || !file.type) return false;
  return allowedTypes.includes(file.type);
}

/**
 * Sanitize JSON data recursively
 */
export function sanitizeJSON<T>(data: T): T {
  if (typeof data === 'string') {
    return sanitizeText(data) as T;
  }
  
  if (typeof data === 'object' && data !== null) {
    if (Array.isArray(data)) {
      return data.map(sanitizeJSON) as T;
    }
    
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      const sanitizedKey = sanitizeText(key);
      if (sanitizedKey) {
        sanitized[sanitizedKey] = sanitizeJSON(value);
      }
    }
    return sanitized as T;
  }
  
  return data;
}

/**
 * Create a validation result object
 */
export interface ValidationResult<T> {
  isValid: boolean;
  data?: T;
  errors: string[];
}

/**
 * Validate and sanitize form data
 */
export function validateFormData<T extends Record<string, any>>(
  data: T,
  validators: Record<keyof T, (value: any) => any | null>
): ValidationResult<T> {
  const errors: string[] = [];
  const sanitized: any = {};
  
  for (const [key, validator] of Object.entries(validators)) {
    const value = data[key];
    const sanitizedValue = validator(value);
    
    if (sanitizedValue === null) {
      errors.push(`Invalid value for ${key}`);
    } else {
      sanitized[key] = sanitizedValue;
    }
  }
  
  return {
    isValid: errors.length === 0,
    data: errors.length === 0 ? sanitized : undefined,
    errors,
  };
}
