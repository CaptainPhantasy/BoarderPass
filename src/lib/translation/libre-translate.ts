import axios from 'axios'

export interface TranslationResult {
  translatedText: string
  confidence: number
  legalMappings: LegalTermMapping[]
  processingTime: number
  sourceLanguage: string
  targetLanguage: string
}

export interface LegalTermMapping {
  sourceTerm: string
  targetTerm: string
  confidence: number
  context: string
  documentType?: string
}

export interface TranslationOptions {
  preserveFormatting?: boolean
  legalTermMapping?: boolean
  fallbackService?: boolean
  batchSize?: number
}

class TranslationService {
  private libreTranslateUrl: string
  private legalTermsCache: Map<string, LegalTermMapping[]> = new Map()
  private translationCache: Map<string, string> = new Map()
  private supportedLanguages = [
    'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko', 'ar', 'hi', 'bn', 'ur', 'uk'
  ]

  constructor() {
    this.libreTranslateUrl = process.env.LIBRETRANSLATE_URL || 'http://localhost:5000'
  }

  /**
   * Translate text using LibreTranslate
   */
  async translate(
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
    options: TranslationOptions = {}
  ): Promise<TranslationResult> {
    const startTime = Date.now()
    const opts = {
      preserveFormatting: true,
      legalTermMapping: true,
      fallbackService: true,
      batchSize: 1000,
      ...options
    }

    try {
      // Validate languages
      if (!this.supportedLanguages.includes(sourceLanguage) || !this.supportedLanguages.includes(targetLanguage)) {
        throw new Error(`Unsupported language pair: ${sourceLanguage} → ${targetLanguage}`)
      }

      // Check cache first
      const cacheKey = `${sourceLanguage}:${targetLanguage}:${text}`
      if (this.translationCache.has(cacheKey)) {
        return {
          translatedText: this.translationCache.get(cacheKey)!,
          confidence: 1.0,
          legalMappings: [],
          processingTime: 0,
          sourceLanguage,
          targetLanguage
        }
      }

      // Split text into manageable chunks
      const textChunks = this.splitTextIntoChunks(text, opts.batchSize)
      let translatedText = ''
      let totalConfidence = 0

      // Process each chunk
      for (const chunk of textChunks) {
        const chunkResult = await this.translateChunk(chunk, sourceLanguage, targetLanguage)
        translatedText += chunkResult.translatedText + ' '
        totalConfidence += chunkResult.confidence
      }

      // Apply legal term mapping if enabled
      let legalMappings: LegalTermMapping[] = []
      if (opts.legalTermMapping) {
        legalMappings = await this.applyLegalTermMappings(text, translatedText, sourceLanguage, targetLanguage)
      }

      // Preserve formatting if enabled
      if (opts.preserveFormatting) {
        translatedText = this.preserveFormatting(text, translatedText)
      }

      const result: TranslationResult = {
        translatedText: translatedText.trim(),
        confidence: totalConfidence / textChunks.length,
        legalMappings,
        processingTime: Date.now() - startTime,
        sourceLanguage,
        targetLanguage
      }

      // Cache the result
      this.translationCache.set(cacheKey, result.translatedText)

      return result

    } catch (error) {
      console.error('Translation failed:', error)
      
      // Try fallback service if enabled
      if (opts.fallbackService) {
        return await this.translateWithFallback(text, sourceLanguage, targetLanguage, options)
      }
      
      throw new Error(`Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Translate a single chunk of text
   */
  private async translateChunk(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<{ translatedText: string; confidence: number }> {
    try {
      const response = await axios.post(`${this.libreTranslateUrl}/translate`, {
        q: text,
        source: sourceLanguage,
        target: targetLanguage,
        format: 'text'
      }, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.data && response.data.translatedText) {
        return {
          translatedText: response.data.translatedText,
          confidence: response.data.confidence || 0.8
        }
      } else {
        throw new Error('Invalid response from LibreTranslate')
      }

    } catch (error) {
      console.error('LibreTranslate chunk translation failed:', error)
      throw error
    }
  }

  /**
   * Apply legal term mappings from database
   */
  private async applyLegalTermMappings(
    sourceText: string,
    translatedText: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<LegalTermMapping[]> {
    try {
      // TODO: Fetch legal terms from Supabase database
      // For now, return empty array
      const legalTerms = await this.fetchLegalTerms(sourceLanguage, targetLanguage)
      
      const mappings: LegalTermMapping[] = []
      
      for (const term of legalTerms) {
        if (sourceText.toLowerCase().includes(term.sourceTerm.toLowerCase())) {
          // Replace the term in translated text
          const regex = new RegExp(term.sourceTerm, 'gi')
          translatedText = translatedText.replace(regex, term.targetTerm)
          
          mappings.push({
            sourceTerm: term.sourceTerm,
            targetTerm: term.targetTerm,
            confidence: term.confidence,
            context: term.context || '',
            documentType: term.documentType
          })
        }
      }
      
      return mappings
      
    } catch (error) {
      console.error('Legal term mapping failed:', error)
      return []
    }
  }

  /**
   * Fetch legal terms from database
   */
  private async fetchLegalTerms(sourceLanguage: string, targetLanguage: string): Promise<any[]> {
    // TODO: Implement actual database query
    // This is a placeholder for the real implementation
    return []
  }

  /**
   * Preserve formatting between source and translated text
   */
  private preserveFormatting(sourceText: string, translatedText: string): string {
    // Preserve line breaks
    const sourceLines = sourceText.split('\n')
    const translatedLines = translatedText.split('\n')
    
    if (sourceLines.length === translatedLines.length) {
      return translatedLines.join('\n')
    }
    
    // Preserve paragraph structure
    const sourceParagraphs = sourceText.split(/\n\s*\n/)
    const translatedParagraphs = translatedText.split(/\n\s*\n/)
    
    if (sourceParagraphs.length === translatedParagraphs.length) {
      return translatedParagraphs.join('\n\n')
    }
    
    return translatedText
  }

  /**
   * Split text into manageable chunks for translation
   */
  private splitTextIntoChunks(text: string, maxChunkSize: number): string[] {
    const chunks: string[] = []
    const sentences = text.split(/(?<=[.!?])\s+/)
    let currentChunk = ''
    
    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > maxChunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim())
        currentChunk = sentence
      } else {
        currentChunk += (currentChunk ? ' ' : '') + sentence
      }
    }
    
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim())
    }
    
    return chunks
  }

  /**
   * Fallback translation service
   */
  private async translateWithFallback(
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
    options: TranslationOptions
  ): Promise<TranslationResult> {
    try {
      // Try Google Translate API as fallback
      // TODO: Implement Google Translate fallback
      console.log('Using fallback translation service')
      
      // For now, return a basic translation
      return {
        translatedText: `[FALLBACK] ${text}`,
        confidence: 0.5,
        legalMappings: [],
        processingTime: 0,
        sourceLanguage,
        targetLanguage
      }
      
    } catch (error) {
      console.error('Fallback translation also failed:', error)
      throw new Error('All translation services failed')
    }
  }

  /**
   * Batch translate multiple texts
   */
  async batchTranslate(
    texts: Array<{ text: string; sourceLanguage: string; targetLanguage: string }>,
    options: TranslationOptions = {}
  ): Promise<TranslationResult[]> {
    const results: TranslationResult[] = []
    const batchSize = options.batchSize || 5
    
    // Process in batches to avoid overwhelming the service
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize)
      const batchPromises = batch.map(({ text, sourceLanguage, targetLanguage }) =>
        this.translate(text, sourceLanguage, targetLanguage, options)
      )
      
      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)
      
      // Add small delay between batches
      if (i + batchSize < texts.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    return results
  }

  /**
   * Detect language of text
   */
  async detectLanguage(text: string): Promise<string> {
    try {
      const response = await axios.post(`${this.libreTranslateUrl}/detect`, {
        q: text
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.data && response.data.confidence && response.data.language) {
        return response.data.language
      } else {
        throw new Error('Invalid response from language detection')
      }

    } catch (error) {
      console.error('Language detection failed:', error)
      return 'en' // Default to English
    }
  }

  /**
   * Get supported languages
   */
  async getSupportedLanguages(): Promise<Array<{ code: string; name: string }>> {
    try {
      const response = await axios.get(`${this.libreTranslateUrl}/languages`, {
        timeout: 10000
      })

      if (response.data && Array.isArray(response.data)) {
        return response.data
      } else {
        throw new Error('Invalid response from languages endpoint')
      }

    } catch (error) {
      console.error('Failed to fetch supported languages:', error)
      // Return basic language list as fallback
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
        { code: 'ko', name: 'Korean' },
        { code: 'ar', name: 'Arabic' },
        { code: 'hi', name: 'Hindi' },
        { code: 'bn', name: 'Bengali' },
        { code: 'ur', name: 'Urdu' },
        { code: 'uk', name: 'Ukrainian' }
      ]
    }
  }

  /**
   * Clear translation cache
   */
  clearCache(): void {
    this.translationCache.clear()
    this.legalTermsCache.clear()
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { translationCacheSize: number; legalTermsCacheSize: number } {
    return {
      translationCacheSize: this.translationCache.size,
      legalTermsCacheSize: this.legalTermsCache.size
    }
  }
}

// Export singleton instance
export const translationService = new TranslationService()

// Export for testing
export { TranslationService }
