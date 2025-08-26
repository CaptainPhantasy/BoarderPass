import Tesseract from 'tesseract.js'

export interface OCRResult {
  text: string
  confidence: number
  blocks: OCRBlock[]
  language: string
  processingTime: number
}

export interface OCRBlock {
  text: string
  confidence: number
  bbox: {
    x0: number
    y0: number
    x1: number
    y1: number
  }
  type: 'text' | 'image' | 'table'
}

export interface OCRProcessingOptions {
  language: string
  imagePreprocessing?: boolean
  extractStructuredData?: boolean
  confidenceThreshold?: number
}

class OCRService {
  private workers: Map<string, Tesseract.Worker> = new Map()
  private supportedLanguages = [
    'eng', 'spa', 'chi_sim', 'ara', 'hin', 'por', 'fra', 'deu', 'jpn', 'kor'
  ]
  private defaultOptions: OCRProcessingOptions = {
    language: 'eng',
    imagePreprocessing: true,
    extractStructuredData: true,
    confidenceThreshold: 60
  }

  /**
   * Initialize OCR worker for a specific language
   */
  async initializeWorker(language: string): Promise<Tesseract.Worker> {
    if (this.workers.has(language)) {
      return this.workers.get(language)!
    }

    try {
      const worker = await Tesseract.createWorker({
        logger: m => console.log('OCR Worker:', m),
        errorHandler: err => console.error('OCR Error:', err)
      })

      await worker.loadLanguage(language)
      await worker.initialize(language)
      
      this.workers.set(language, worker)
      return worker
    } catch (error) {
      console.error(`Failed to initialize OCR worker for language: ${language}`, error)
      throw new Error(`OCR worker initialization failed for language: ${language}`)
    }
  }

  /**
   * Preprocess image for better OCR results
   */
  private async preprocessImage(imageData: ImageData | HTMLImageElement | HTMLCanvasElement): Promise<HTMLCanvasElement> {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    
    let width: number, height: number
    
    if (imageData instanceof ImageData) {
      width = imageData.width
      height = imageData.height
      canvas.width = width
      canvas.height = height
      ctx.putImageData(imageData, 0, 0)
    } else if (imageData instanceof HTMLImageElement) {
      width = imageData.naturalWidth
      height = imageData.naturalHeight
      canvas.width = width
      canvas.height = height
      ctx.drawImage(imageData, 0, 0)
    } else {
      width = imageData.width
      height = imageData.height
      canvas.width = width
      canvas.height = height
      ctx.drawImage(imageData, 0, 0)
    }

    // Apply image preprocessing for better OCR
    const imageDataProcessed = ctx.getImageData(0, 0, width, height)
    const data = imageDataProcessed.data

    // Enhance contrast and reduce noise
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      
      // Convert to grayscale
      const gray = 0.299 * r + 0.587 * g + 0.114 * b
      
      // Enhance contrast
      const enhanced = Math.min(255, Math.max(0, (gray - 128) * 1.5 + 128))
      
      data[i] = enhanced     // R
      data[i + 1] = enhanced // G
      data[i + 2] = enhanced // B
      // Alpha channel remains unchanged
    }

    ctx.putImageData(imageDataProcessed, 0, 0)
    return canvas
  }

  /**
   * Extract structured data from OCR text based on document type
   */
  private extractStructuredData(text: string, documentType: string): Record<string, any> {
    const structuredData: Record<string, any> = {}
    
    switch (documentType) {
      case 'degree':
      case 'transcript': {
        // Extract academic information
        const degreeMatch = text.match(/(?:Bachelor|Master|PhD|Doctorate|Associate|Diploma)/i)
        if (degreeMatch) structuredData.degree = degreeMatch[0]
        
        const gpaMatch = text.match(/GPA[:\s]*(\d+\.\d+)/i)
        if (gpaMatch) structuredData.gpa = parseFloat(gpaMatch[1])
        
        const dateMatch = text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/)
        if (dateMatch) structuredData.date = dateMatch[1]
        break
      }
        
      case 'birth_certificate': {
        // Extract birth information
        const nameMatch = text.match(/(?:Name|Full Name)[:\s]*([A-Za-z\s]+)/i)
        if (nameMatch) structuredData.fullName = nameMatch[1].trim()
        
        const birthDateMatch = text.match(/(?:Date of Birth|Birth Date)[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i)
        if (birthDateMatch) structuredData.birthDate = birthDateMatch[1]
        
        const placeMatch = text.match(/(?:Place of Birth|Birth Place)[:\s]*([A-Za-z\s,]+)/i)
        if (placeMatch) structuredData.birthPlace = placeMatch[1].trim()
        break
      }
        
      case 'bank_statement': {
        // Extract financial information
        const accountMatch = text.match(/(?:Account|Acct)[:\s]*([A-Z0-9\-]+)/i)
        if (accountMatch) structuredData.accountNumber = accountMatch[1]
        
        const balanceMatch = text.match(/(?:Balance|Bal)[:\s]*\$?([\d,]+\.?\d*)/i)
        if (balanceMatch) structuredData.balance = parseFloat(balanceMatch[1].replace(/,/g, ''))
        break
      }
        
      case 'employment_letter': {
        // Extract employment information
        const companyMatch = text.match(/(?:Company|Employer)[:\s]*([A-Za-z\s&]+)/i)
        if (companyMatch) structuredData.company = companyMatch[1].trim()
        
        const positionMatch = text.match(/(?:Position|Title|Role)[:\s]*([A-Za-z\s]+)/i)
        if (positionMatch) structuredData.position = positionMatch[1].trim()
        
        const salaryMatch = text.match(/(?:Salary|Compensation)[:\s]*\$?([\d,]+)/i)
        if (salaryMatch) structuredData.salary = parseInt(salaryMatch[1].replace(/,/g, ''))
        break
      }
    }
    
    return structuredData
  }

  /**
   * Process image with OCR
   */
  async processImage(
    imageData: ImageData | HTMLImageElement | HTMLCanvasElement | File,
    options: Partial<OCRProcessingOptions> = {},
    documentType?: string
  ): Promise<OCRResult> {
    const startTime = Date.now()
    const opts = { ...this.defaultOptions, ...options }
    
    try {
      // Validate language
      if (!this.supportedLanguages.includes(opts.language)) {
        throw new Error(`Unsupported language: ${opts.language}`)
      }

      // Initialize worker
      const worker = await this.initializeWorker(opts.language)
      
      let processedImage: HTMLCanvasElement | File
      
      // Preprocess image if enabled
      if (opts.imagePreprocessing && !(imageData instanceof File)) {
        processedImage = await this.preprocessImage(imageData)
      } else {
        processedImage = imageData
      }

      // Perform OCR
      const result = await worker.recognize(processedImage)
      
      const processingTime = Date.now() - startTime
      
      // Extract structured data if enabled
      let structuredData = {}
      if (opts.extractStructuredData && documentType) {
        structuredData = this.extractStructuredData(result.data.text, documentType)
      }

      // Filter results by confidence threshold
      const filteredBlocks = result.data.blocks.filter(block => 
        block.confidence >= (opts.confidenceThreshold || 60)
      )

      const ocrResult: OCRResult = {
        text: result.data.text,
        confidence: result.data.confidence,
        blocks: filteredBlocks.map(block => ({
          text: block.text,
          confidence: block.confidence,
          bbox: {
            x0: block.bbox.x0,
            y0: block.bbox.y0,
            x1: block.bbox.x1,
            y1: block.bbox.y1
          },
          type: 'text' as const
        })),
        language: opts.language,
        processingTime,
        ...(Object.keys(structuredData).length > 0 && { structuredData })
      }

      return ocrResult
      
    } catch (error) {
      console.error('OCR processing failed:', error)
      throw new Error(`OCR processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Process multiple images in parallel
   */
  async processMultipleImages(
    images: Array<{ data: ImageData | HTMLImageElement | HTMLCanvasElement | File, options?: Partial<OCRProcessingOptions>, documentType?: string }>,
    maxConcurrent: number = 3
  ): Promise<OCRResult[]> {
    const results: OCRResult[] = []
    const chunks = this.chunkArray(images, maxConcurrent)
    
    for (const chunk of chunks) {
      const chunkPromises = chunk.map(({ data, options, documentType }) =>
        this.processImage(data, options, documentType)
      )
      
      const chunkResults = await Promise.all(chunkPromises)
      results.push(...chunkResults)
    }
    
    return results
  }

  /**
   * Auto-detect document language
   */
  async detectLanguage(imageData: ImageData | HTMLImageElement | HTMLCanvasElement | File): Promise<string> {
    try {
      // Try with English first as it's most common
      const englishResult = await this.processImage(imageData, { language: 'eng' })
      
      // If confidence is high, assume English
      if (englishResult.confidence > 80) {
        return 'eng'
      }
      
      // Try other languages to find the best match
      let bestLanguage = 'eng'
      let bestConfidence = englishResult.confidence
      
      for (const lang of this.supportedLanguages) {
        if (lang === 'eng') continue
        
        try {
          const result = await this.processImage(imageData, { language: lang })
          if (result.confidence > bestConfidence) {
            bestConfidence = result.confidence
            bestLanguage = lang
          }
        } catch (error) {
          // Continue with next language if one fails
          continue
        }
      }
      
      return bestLanguage
    } catch (error) {
      console.error('Language detection failed:', error)
      return 'eng' // Fallback to English
    }
  }

  /**
   * Clean up workers
   */
  async cleanup(): Promise<void> {
    for (const [language, worker] of this.workers) {
      try {
        await worker.terminate()
      } catch (error) {
        console.error(`Failed to terminate worker for language: ${language}`, error)
      }
    }
    this.workers.clear()
  }

  /**
   * Utility function to chunk array for parallel processing
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }
}

// Export singleton instance
export const ocrService = new OCRService()

// Export for testing
export { OCRService }
