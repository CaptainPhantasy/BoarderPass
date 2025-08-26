import Tesseract from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
  language: string;
  processingTime: number;
}

export interface OCROptions {
  language?: string;
  pageSegMode?: number;
  oem?: number;
}

export class TesseractService {
  private worker: Tesseract.Worker | null = null;
  private isInitialized = false;

  async initialize(language = 'eng'): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.worker = await Tesseract.createWorker(language, 1, {
        workerPath: '/tesseract/worker.min.js',
        langPath: process.env.NEXT_PUBLIC_TESSERACT_LANG_PATH || 'https://tessdata.projectnaptha.com/4.0.0',
        corePath: '/tesseract/tesseract-core.wasm.js',
      });
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Tesseract worker:', error);
      throw new Error('OCR service initialization failed');
    }
  }

  async processImage(
    imageData: string | Buffer | File,
    options: OCROptions = {}
  ): Promise<OCRResult> {
    if (!this.isInitialized || !this.worker) {
      await this.initialize(options.language || 'eng');
    }

    const startTime = Date.now();

    try {
      if (!this.worker) {
        throw new Error('Worker not initialized');
      }

      // Set recognition parameters
      await this.worker.setParameters({
        tessedit_pageseg_mode: options.pageSegMode !== undefined ? options.pageSegMode : Tesseract.PSM.AUTO,
        tessedit_ocr_engine_mode: options.oem !== undefined ? options.oem : Tesseract.OEM.LSTM_ONLY,
      } as any);

      // Perform OCR
      const result = await this.worker.recognize(imageData);

      const processingTime = Date.now() - startTime;

      return {
        text: result.data.text,
        confidence: result.data.confidence,
        language: options.language || 'eng',
        processingTime,
      };
    } catch (error) {
      console.error('OCR processing failed:', error);
      throw new Error('Failed to process document');
    }
  }

  async processMultiplePages(
    images: Array<string | Buffer | File>,
    options: OCROptions = {}
  ): Promise<OCRResult[]> {
    const results: OCRResult[] = [];

    for (const image of images) {
      const result = await this.processImage(image, options);
      results.push(result);
    }

    return results;
  }

  async detectLanguage(imageData: string | Buffer | File): Promise<string> {
    if (!this.isInitialized || !this.worker) {
      await this.initialize('eng+fra+spa+deu+ita+por');
    }

    try {
      if (!this.worker) {
        throw new Error('Worker not initialized');
      }

      const result = await this.worker.detect(imageData);
      // Get the most likely language from detection results
      if (Array.isArray(result.data) && result.data.length > 0) {
        return result.data[0].script || 'eng';
      }
      return 'eng';
    } catch (error) {
      console.error('Language detection failed:', error);
      return 'eng'; // Default to English
    }
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
    }
  }

  // Extract structured data from documents
  extractStructuredData(text: string): {
    dates: string[];
    names: string[];
    numbers: string[];
    emails: string[];
    urls: string[];
  } {
    const dateRegex = /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g;
    const nameRegex = /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g;
    const numberRegex = /\b\d{6,}\b/g;
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;

    return {
      dates: text.match(dateRegex) || [],
      names: text.match(nameRegex) || [],
      numbers: text.match(numberRegex) || [],
      emails: text.match(emailRegex) || [],
      urls: text.match(urlRegex) || [],
    };
  }
}

// Singleton instance
let tesseractService: TesseractService | null = null;

export function getTesseractService(): TesseractService {
  if (!tesseractService) {
    tesseractService = new TesseractService();
  }
  return tesseractService;
}