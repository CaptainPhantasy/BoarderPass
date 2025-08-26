import axios from 'axios';

export interface TranslationResult {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence?: number;
}

export interface TranslationOptions {
  source?: string;
  target: string;
  format?: 'text' | 'html';
  alternatives?: number;
}

export class TranslationService {
  private apiUrl: string;
  private cache: Map<string, TranslationResult> = new Map();

  constructor() {
    this.apiUrl = process.env.LIBRETRANSLATE_URL || 'https://translate.terraprint.co';
  }

  private getCacheKey(text: string, source: string, target: string): string {
    return `${source}-${target}-${text.substring(0, 50)}`;
  }

  async detectLanguage(text: string): Promise<string> {
    try {
      const response = await axios.post(`${this.apiUrl}/detect`, {
        q: text,
      });

      if (response.data && response.data.length > 0) {
        return response.data[0].language;
      }

      return 'en'; // Default to English
    } catch (error) {
      console.error('Language detection failed:', error);
      return 'en';
    }
  }

  async translate(
    text: string,
    options: TranslationOptions
  ): Promise<TranslationResult> {
    // Check cache first
    const source = options.source || 'auto';
    const cacheKey = this.getCacheKey(text, source, options.target);
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      // Detect source language if not provided
      let sourceLanguage = options.source;
      if (!sourceLanguage || sourceLanguage === 'auto') {
        sourceLanguage = await this.detectLanguage(text);
      }

      // Skip translation if source and target are the same
      if (sourceLanguage === options.target) {
        return {
          translatedText: text,
          sourceLanguage,
          targetLanguage: options.target,
          confidence: 100,
        };
      }

      // Perform translation
      const response = await axios.post(`${this.apiUrl}/translate`, {
        q: text,
        source: sourceLanguage,
        target: options.target,
        format: options.format || 'text',
        alternatives: options.alternatives,
      });

      const result: TranslationResult = {
        translatedText: response.data.translatedText,
        sourceLanguage,
        targetLanguage: options.target,
        confidence: response.data.confidence,
      };

      // Cache the result
      this.cache.set(cacheKey, result);

      return result;
    } catch (error) {
      console.error('Translation failed:', error);
      
      // Fallback: return original text if translation fails
      return {
        translatedText: text,
        sourceLanguage: options.source || 'unknown',
        targetLanguage: options.target,
        confidence: 0,
      };
    }
  }

  async translateBatch(
    texts: string[],
    options: TranslationOptions
  ): Promise<TranslationResult[]> {
    const results: TranslationResult[] = [];

    // Process in batches to avoid overwhelming the API
    const batchSize = 10;
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const batchPromises = batch.map(text => this.translate(text, options));
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return results;
  }

  async getSupportedLanguages(): Promise<Array<{ code: string; name: string }>> {
    try {
      const response = await axios.get(`${this.apiUrl}/languages`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch supported languages:', error);
      // Return common languages as fallback
      return [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'it', name: 'Italian' },
        { code: 'pt', name: 'Portuguese' },
        { code: 'ru', name: 'Russian' },
        { code: 'zh', name: 'Chinese' },
        { code: 'ja', name: 'Japanese' },
        { code: 'ar', name: 'Arabic' },
      ];
    }
  }

  // Translate legal terms using dictionary
  async translateLegalTerms(
    text: string,
    targetLanguage: string,
    legalDictionary?: Map<string, Map<string, string>>
  ): Promise<string> {
    let translatedText = text;

    // First, apply dictionary translations if available
    if (legalDictionary) {
      const terms = Array.from(legalDictionary.keys());
      
      for (const term of terms) {
        const translations = legalDictionary.get(term);
        if (translations?.has(targetLanguage)) {
          const translation = translations.get(targetLanguage)!;
          const regex = new RegExp(`\\b${term}\\b`, 'gi');
          translatedText = translatedText.replace(regex, translation);
        }
      }
    }

    // Then translate the full text
    const result = await this.translate(translatedText, {
      target: targetLanguage,
    });

    return result.translatedText;
  }

  clearCache(): void {
    this.cache.clear();
  }
}

// Singleton instance
let translationService: TranslationService | null = null;

export function getTranslationService(): TranslationService {
  if (!translationService) {
    translationService = new TranslationService();
  }
  return translationService;
}