import { PDFDocument, StandardFonts, rgb, PDFFont } from 'pdf-lib';

export interface PDFGenerationOptions {
  includeOriginal?: boolean;
  includeTranslation?: boolean;
  includeValidation?: boolean;
  addWatermark?: boolean;
  addPageNumbers?: boolean;
}

export interface DocumentContent {
  originalText?: string;
  translatedText?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  validationResults?: any;
  metadata?: {
    processedDate: Date;
    documentType: string;
    issueCountry?: string;
    targetCountry?: string;
  };
}

export class PDFService {
  async generateTranslatedDocument(
    content: DocumentContent,
    options: PDFGenerationOptions = {}
  ): Promise<Uint8Array> {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Embed fonts
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Add cover page
    if (content.metadata) {
      await this.addCoverPage(pdfDoc, content.metadata, helveticaBold, helveticaFont);
    }

    // Add original text if requested
    if (options.includeOriginal && content.originalText) {
      await this.addTextPages(
        pdfDoc,
        content.originalText,
        'Original Document',
        content.sourceLanguage || 'Source',
        helveticaBold,
        helveticaFont
      );
    }

    // Add translated text if requested
    if (options.includeTranslation && content.translatedText) {
      await this.addTextPages(
        pdfDoc,
        content.translatedText,
        'Translated Document',
        content.targetLanguage || 'Target',
        helveticaBold,
        helveticaFont
      );
    }

    // Add validation results if requested
    if (options.includeValidation && content.validationResults) {
      await this.addValidationPage(
        pdfDoc,
        content.validationResults,
        helveticaBold,
        helveticaFont
      );
    }

    // Add watermark if requested
    if (options.addWatermark) {
      await this.addWatermarkToAllPages(pdfDoc, helveticaFont);
    }

    // Add page numbers if requested
    if (options.addPageNumbers) {
      await this.addPageNumbers(pdfDoc, helveticaFont);
    }

    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  }

  private async addCoverPage(
    pdfDoc: PDFDocument,
    metadata: any,
    boldFont: PDFFont,
    regularFont: PDFFont
  ): Promise<void> {
    const page = pdfDoc.addPage();
    const { height } = page.getSize();
    
    let yPosition = height - 100;

    // Title
    page.drawText('BOARDERPASS', {
      x: 50,
      y: yPosition,
      size: 32,
      font: boldFont,
      color: rgb(0.2, 0.4, 0.8),
    });

    yPosition -= 50;
    page.drawText('Document Translation & Validation Report', {
      x: 50,
      y: yPosition,
      size: 18,
      font: regularFont,
      color: rgb(0.3, 0.3, 0.3),
    });

    yPosition -= 80;

    // Metadata
    const details = [
      `Document Type: ${metadata.documentType}`,
      `Issue Country: ${metadata.issueCountry || 'N/A'}`,
      `Target Country: ${metadata.targetCountry || 'N/A'}`,
      `Processed Date: ${new Date(metadata.processedDate).toLocaleDateString()}`,
    ];

    for (const detail of details) {
      page.drawText(detail, {
        x: 50,
        y: yPosition,
        size: 12,
        font: regularFont,
        color: rgb(0.2, 0.2, 0.2),
      });
      yPosition -= 25;
    }

    // Footer
    page.drawText('This is a computer-generated translation for reference purposes only.', {
      x: 50,
      y: 50,
      size: 10,
      font: regularFont,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  private async addTextPages(
    pdfDoc: PDFDocument,
    text: string,
    title: string,
    language: string,
    boldFont: PDFFont,
    regularFont: PDFFont
  ): Promise<void> {
    // Split text into lines
    const lines = this.wrapText(text, 80);
    const linesPerPage = 40;
    const pageCount = Math.ceil(lines.length / linesPerPage);

    for (let i = 0; i < pageCount; i++) {
      const page = pdfDoc.addPage();
      const { height } = page.getSize();
      
      // Add title on first page
      let yPosition = height - 50;
      if (i === 0) {
        page.drawText(title, {
          x: 50,
          y: yPosition,
          size: 18,
          font: boldFont,
          color: rgb(0.2, 0.4, 0.8),
        });

        yPosition -= 30;
        page.drawText(`Language: ${language}`, {
          x: 50,
          y: yPosition,
          size: 12,
          font: regularFont,
          color: rgb(0.4, 0.4, 0.4),
        });

        yPosition -= 40;
      }

      // Add text lines
      const startLine = i * linesPerPage;
      const endLine = Math.min(startLine + linesPerPage, lines.length);
      
      for (let j = startLine; j < endLine; j++) {
        page.drawText(lines[j], {
          x: 50,
          y: yPosition,
          size: 11,
          font: regularFont,
          color: rgb(0.1, 0.1, 0.1),
        });
        yPosition -= 18;
      }
    }
  }

  private async addValidationPage(
    pdfDoc: PDFDocument,
    validationResults: any,
    boldFont: PDFFont,
    regularFont: PDFFont
  ): Promise<void> {
    const page = pdfDoc.addPage();
    const { height } = page.getSize();
    
    let yPosition = height - 50;

    // Title
    page.drawText('Validation Results', {
      x: 50,
      y: yPosition,
      size: 18,
      font: boldFont,
      color: rgb(0.2, 0.4, 0.8),
    });

    yPosition -= 40;

    // Overall status
    const statusColor = validationResults.isValid 
      ? rgb(0, 0.6, 0) 
      : rgb(0.8, 0, 0);
    
    page.drawText(`Status: ${validationResults.isValid ? 'VALID' : 'INVALID'}`, {
      x: 50,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: statusColor,
    });

    yPosition -= 30;

    // Requirements
    if (validationResults.requirements) {
      page.drawText('Requirements Check:', {
        x: 50,
        y: yPosition,
        size: 12,
        font: boldFont,
        color: rgb(0.3, 0.3, 0.3),
      });
      yPosition -= 20;

      for (const req of validationResults.requirements) {
        const statusSymbol = req.status === 'passed' ? '✓' : 
                           req.status === 'failed' ? '✗' : '⚠';
        
        page.drawText(`${statusSymbol} ${req.requirement}: ${req.details || req.status}`, {
          x: 70,
          y: yPosition,
          size: 10,
          font: regularFont,
          color: rgb(0.2, 0.2, 0.2),
        });
        yPosition -= 18;
      }
    }

    yPosition -= 20;

    // Errors
    if (validationResults.errors && validationResults.errors.length > 0) {
      page.drawText('Errors:', {
        x: 50,
        y: yPosition,
        size: 12,
        font: boldFont,
        color: rgb(0.8, 0, 0),
      });
      yPosition -= 20;

      for (const error of validationResults.errors) {
        page.drawText(`• ${error.message}`, {
          x: 70,
          y: yPosition,
          size: 10,
          font: regularFont,
          color: rgb(0.6, 0, 0),
        });
        yPosition -= 18;
      }
    }

    yPosition -= 20;

    // Warnings
    if (validationResults.warnings && validationResults.warnings.length > 0) {
      page.drawText('Warnings:', {
        x: 50,
        y: yPosition,
        size: 12,
        font: boldFont,
        color: rgb(0.8, 0.6, 0),
      });
      yPosition -= 20;

      for (const warning of validationResults.warnings) {
        page.drawText(`• ${warning.message}`, {
          x: 70,
          y: yPosition,
          size: 10,
          font: regularFont,
          color: rgb(0.6, 0.4, 0),
        });
        yPosition -= 18;
      }
    }
  }

  private async addWatermarkToAllPages(
    pdfDoc: PDFDocument,
    font: PDFFont
  ): Promise<void> {
    const pages = pdfDoc.getPages();
    
    for (const page of pages) {
      const { width, height } = page.getSize();
      
      // Draw rotated watermark
      page.drawText('BOARDERPASS - For Reference Only', {
        x: width / 2 - 120,
        y: height / 2,
        size: 40,
        font,
        color: rgb(0.8, 0.8, 0.8),
        opacity: 0.2,
      });
    }
  }

  private async addPageNumbers(
    pdfDoc: PDFDocument,
    font: PDFFont
  ): Promise<void> {
    const pages = pdfDoc.getPages();
    
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const { width } = page.getSize();
      
      page.drawText(`Page ${i + 1} of ${pages.length}`, {
        x: width / 2 - 40,
        y: 20,
        size: 10,
        font,
        color: rgb(0.5, 0.5, 0.5),
      });
    }
  }

  private wrapText(text: string, maxCharsPerLine: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      if (currentLine.length + word.length + 1 <= maxCharsPerLine) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }

    if (currentLine) lines.push(currentLine);
    return lines;
  }

  async mergePDFs(pdfBuffers: Uint8Array[]): Promise<Uint8Array> {
    const mergedPdf = await PDFDocument.create();

    for (const pdfBuffer of pdfBuffers) {
      const pdf = await PDFDocument.load(pdfBuffer);
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      
      for (const page of pages) {
        mergedPdf.addPage(page);
      }
    }

    return await mergedPdf.save();
  }

  async extractTextFromPDF(): Promise<string> {
    // Note: This is a placeholder. In production, you'd use pdf-parse or similar
    // For now, we'll return a message indicating this needs implementation
    return 'PDF text extraction requires additional library implementation';
  }
}

// Singleton instance
let pdfService: PDFService | null = null;

export function getPDFService(): PDFService {
  if (!pdfService) {
    pdfService = new PDFService();
  }
  return pdfService;
}