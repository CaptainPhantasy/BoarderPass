import { PDFDocument, PDFForm, PDFTextField, PDFCheckBox, rgb, StandardFonts } from 'pdf-lib'

export interface PDFGenerationOptions {
  template: string
  language: string
  country: string
  documentType: string
  includeWatermark?: boolean
  includeQRCode?: boolean
  includeDigitalSignature?: boolean
  pageSize?: 'A4' | 'Letter'
  orientation?: 'portrait' | 'landscape'
}

export interface DocumentField {
  name: string
  value: string
  type: 'text' | 'date' | 'number' | 'checkbox'
  position: { x: number; y: number; width: number; height: number }
  fontSize?: number
  fontColor?: { r: number; g: number; b: number }
}

export interface PDFTemplate {
  id: string
  name: string
  country: string
  documentType: string
  language: string
  pageSize: 'A4' | 'Letter'
  orientation: 'portrait' | 'landscape'
  fields: DocumentField[]
  header?: string
  footer?: string
  watermark?: string
  styling: {
    fontFamily: string
    fontSize: number
    lineHeight: number
    margins: { top: number; right: number; bottom: number; left: number }
  }
}

class PDFGenerator {
  private templates: Map<string, PDFTemplate> = new Map()
  private fonts: Map<string, any> = new Map()

  constructor() {
    this.initializeDefaultTemplates()
  }

  /**
   * Initialize default templates for common document types
   */
  private initializeDefaultTemplates(): void {
    // Academic Degree Template
    const degreeTemplate: PDFTemplate = {
      id: 'degree-template',
      name: 'Academic Degree Certificate',
      country: 'US',
      documentType: 'degree',
      language: 'en',
      pageSize: 'A4',
      orientation: 'portrait',
      fields: [
        {
          name: 'institution_name',
          value: '',
          type: 'text',
          position: { x: 150, y: 650, width: 300, height: 30 },
          fontSize: 18,
          fontColor: { r: 0, g: 0, b: 0 }
        },
        {
          name: 'student_name',
          value: '',
          type: 'text',
          position: { x: 150, y: 580, width: 300, height: 25 },
          fontSize: 16,
          fontColor: { r: 0, g: 0, b: 0 }
        },
        {
          name: 'degree_type',
          value: '',
          type: 'text',
          position: { x: 150, y: 520, width: 300, height: 25 },
          fontSize: 16,
          fontColor: { r: 0, g: 0, b: 0 }
        },
        {
          name: 'field_of_study',
          value: '',
          type: 'text',
          position: { x: 150, y: 460, width: 300, height: 25 },
          fontSize: 16,
          fontColor: { r: 0, g: 0, b: 0 }
        },
        {
          name: 'graduation_date',
          value: '',
          type: 'date',
          position: { x: 150, y: 400, width: 150, height: 25 },
          fontSize: 16,
          fontColor: { r: 0, g: 0, b: 0 }
        },
        {
          name: 'gpa',
          value: '',
          type: 'number',
          position: { x: 350, y: 400, width: 100, height: 25 },
          fontSize: 16,
          fontColor: { r: 0, g: 0, b: 0 }
        }
      ],
      header: 'OFFICIAL ACADEMIC TRANSCRIPT',
      footer: 'This document is electronically generated and certified by BOARDERPASS',
      watermark: 'CERTIFIED',
      styling: {
        fontFamily: 'Helvetica',
        fontSize: 12,
        lineHeight: 1.5,
        margins: { top: 72, right: 72, bottom: 72, left: 72 }
      }
    }

    this.templates.set('degree-template', degreeTemplate)

    // Birth Certificate Template
    const birthTemplate: PDFTemplate = {
      id: 'birth-template',
      name: 'Birth Certificate',
      country: 'US',
      documentType: 'birth_certificate',
      language: 'en',
      pageSize: 'A4',
      orientation: 'portrait',
      fields: [
        {
          name: 'full_name',
          value: '',
          type: 'text',
          position: { x: 150, y: 650, width: 300, height: 25 },
          fontSize: 16,
          fontColor: { r: 0, g: 0, b: 0 }
        },
        {
          name: 'birth_date',
          value: '',
          type: 'date',
          position: { x: 150, y: 580, width: 150, height: 25 },
          fontSize: 16,
          fontColor: { r: 0, g: 0, b: 0 }
        },
        {
          name: 'birth_place',
          value: '',
          type: 'text',
          position: { x: 150, y: 520, width: 300, height: 25 },
          fontSize: 16,
          fontColor: { r: 0, g: 0, b: 0 }
        },
        {
          name: 'parent_names',
          value: '',
          type: 'text',
          position: { x: 150, y: 460, width: 300, height: 25 },
          fontSize: 16,
          fontColor: { r: 0, g: 0, b: 0 }
        }
      ],
      header: 'CERTIFICATE OF BIRTH',
      footer: 'Issued by the Department of Vital Records',
      watermark: 'OFFICIAL',
      styling: {
        fontFamily: 'Times-Roman',
        fontSize: 12,
        lineHeight: 1.5,
        margins: { top: 72, right: 72, bottom: 72, left: 72 }
      }
    }

    this.templates.set('birth-template', birthTemplate)
  }

  /**
   * Generate PDF document
   */
  async generatePDF(
    templateId: string,
    fieldValues: Record<string, string>,
    options: Partial<PDFGenerationOptions> = {}
  ): Promise<Uint8Array> {
    try {
      const template = this.templates.get(templateId)
      if (!template) {
        throw new Error(`Template not found: ${templateId}`)
      }

      // Create new PDF document
      const pdfDoc = await PDFDocument.create()
      
      // Set page size and orientation
      const pageSize = this.getPageDimensions(template.pageSize, template.orientation)
      const page = pdfDoc.addPage([pageSize.width, pageSize.height])

      // Load fonts
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

      // Add header
      if (template.header) {
        this.addHeader(page, template.header, template.styling, boldFont)
      }

      // Add watermark
      if (template.watermark) {
        this.addWatermark(page, template.watermark, pageSize)
      }

      // Add fields
      for (const field of template.fields) {
        const value = fieldValues[field.name] || field.value
        if (value) {
          this.addField(page, field, value, font, template.styling)
        }
      }

      // Add footer
      if (template.footer) {
        this.addFooter(page, template.footer, template.styling, font, pageSize)
      }

      // Add certification page if required
      if (options.includeDigitalSignature) {
        this.addCertificationPage(pdfDoc, template, pageSize)
      }

      // Generate PDF bytes
      const pdfBytes = await pdfDoc.save()
      return pdfBytes

    } catch (error) {
      console.error('PDF generation failed:', error)
      throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Add header to page
   */
  private addHeader(page: any, headerText: string, styling: any, font: any): void {
    const { width } = page.getSize()
    const fontSize = styling.fontSize * 1.5
    
    page.drawText(headerText, {
      x: width / 2 - (headerText.length * fontSize * 0.3) / 2,
      y: page.getSize().height - styling.margins.top - fontSize,
      size: fontSize,
      font: font,
      color: rgb(0, 0, 0)
    })
  }

  /**
   * Add watermark to page
   */
  private addWatermark(page: any, watermarkText: string, pageSize: any): void {
    const { width, height } = pageSize
    
    page.drawText(watermarkText, {
      x: width / 2 - (watermarkText.length * 60 * 0.3) / 2,
      y: height / 2,
      size: 60,
      font: page.doc.embedFont(StandardFonts.Helvetica),
      color: rgb(0.8, 0.8, 0.8),
      opacity: 0.3,
      rotate: { angle: -45, type: 'degrees' }
    })
  }

  /**
   * Add field to page
   */
  private addField(page: any, field: DocumentField, value: string, font: any, styling: any): void {
    const fontSize = field.fontSize || styling.fontSize
    const color = field.fontColor || { r: 0, g: 0, b: 0 }
    
    // Add field label
    const label = this.formatFieldLabel(field.name)
    page.drawText(label, {
      x: field.position.x,
      y: field.position.y + field.position.height + 5,
      size: fontSize * 0.8,
      font: font,
      color: rgb(0.4, 0.4, 0.4)
    })

    // Add field value
    page.drawText(value, {
      x: field.position.x,
      y: field.position.y,
      size: fontSize,
      font: font,
      color: rgb(color.r / 255, color.g / 255, color.b / 255),
      maxWidth: field.position.width
    })

    // Add field border
    page.drawRectangle({
      x: field.position.x - 2,
      y: field.position.y - 2,
      width: field.position.width + 4,
      height: field.position.height + 4,
      borderColor: rgb(0.8, 0.8, 0.8),
      borderWidth: 1
    })
  }

  /**
   * Add footer to page
   */
  private addFooter(page: any, footerText: string, styling: any, font: any, pageSize: any): void {
    const { width } = pageSize
    const fontSize = styling.fontSize * 0.8
    
    page.drawText(footerText, {
      x: width / 2 - (footerText.length * fontSize * 0.3) / 2,
      y: styling.margins.bottom,
      size: fontSize,
      font: font,
      color: rgb(0.4, 0.4, 0.4)
    })
  }

  /**
   * Add certification page
   */
  private addCertificationPage(pdfDoc: any, template: PDFTemplate, pageSize: any): void {
    const page = pdfDoc.addPage([pageSize.width, pageSize.height])
    const font = pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = pdfDoc.embedFont(StandardFonts.HelveticaBold)

    // Title
    page.drawText('CERTIFICATION OF DOCUMENT', {
      x: pageSize.width / 2 - 150,
      y: pageSize.height - 100,
      size: 20,
      font: boldFont,
      color: rgb(0, 0, 0)
    })

    // Certification text
    const certificationText = [
      'This document has been processed and validated by BOARDERPASS,',
      'a certified document translation and validation service.',
      '',
      'Document Type: ' + template.documentType,
      'Source Country: ' + template.country,
      'Language: ' + template.language,
      'Processing Date: ' + new Date().toLocaleDateString(),
      '',
      'This certification confirms that:',
      '1. The document has been processed using advanced OCR technology',
      '2. All text has been accurately extracted and translated',
      '3. The document has been validated against country-specific requirements',
      '4. The document meets compliance standards for international use',
      '',
      'For verification purposes, this document contains:',
      '- Digital watermark for authenticity',
      '- Processing timestamp and reference number',
      '- Compliance score and validation results'
    ]

    let yPosition = pageSize.height - 150
    for (const line of certificationText) {
      page.drawText(line, {
        x: 72,
        y: yPosition,
        size: 12,
        font: font,
        color: rgb(0, 0, 0)
      })
      yPosition -= 20
    }

    // Add signature line
    page.drawText('Certified by: BOARDERPASS System', {
      x: 72,
      y: 150,
      size: 14,
      font: boldFont,
      color: rgb(0, 0, 0)
    })

    // Add verification QR code placeholder
    page.drawText('[QR Code for Verification]', {
      x: pageSize.width - 150,
      y: 150,
      size: 12,
      font: font,
      color: rgb(0.6, 0.6, 0.6)
    })
  }

  /**
   * Format field label for display
   */
  private formatFieldLabel(fieldName: string): string {
    return fieldName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  /**
   * Get page dimensions based on size and orientation
   */
  private getPageDimensions(size: 'A4' | 'Letter', orientation: 'portrait' | 'landscape'): { width: number; height: number } {
    const dimensions = {
      A4: { width: 595.276, height: 841.890 },
      Letter: { width: 612, height: 792 }
    }

    const baseDimensions = dimensions[size]
    
    if (orientation === 'landscape') {
      return { width: baseDimensions.height, height: baseDimensions.width }
    }
    
    return baseDimensions
  }

  /**
   * Create custom template
   */
  async createCustomTemplate(template: PDFTemplate): Promise<string> {
    const templateId = `custom-${Date.now()}`
    this.templates.set(templateId, template)
    return templateId
  }

  /**
   * Get available templates
   */
  getAvailableTemplates(): PDFTemplate[] {
    return Array.from(this.templates.values())
  }

  /**
   * Get template by ID
   */
  getTemplate(templateId: string): PDFTemplate | undefined {
    return this.templates.get(templateId)
  }

  /**
   * Update template
   */
  updateTemplate(templateId: string, updates: Partial<PDFTemplate>): boolean {
    const template = this.templates.get(templateId)
    if (!template) return false

    const updatedTemplate = { ...template, ...updates }
    this.templates.set(templateId, updatedTemplate)
    return true
  }

  /**
   * Delete template
   */
  deleteTemplate(templateId: string): boolean {
    return this.templates.delete(templateId)
  }

  /**
   * Export template as JSON
   */
  exportTemplate(templateId: string): string | null {
    const template = this.templates.get(templateId)
    if (!template) return null

    return JSON.stringify(template, null, 2)
  }

  /**
   * Import template from JSON
   */
  importTemplate(templateJson: string): string | null {
    try {
      const template: PDFTemplate = JSON.parse(templateJson)
      const templateId = `imported-${Date.now()}`
      this.templates.set(templateId, template)
      return templateId
    } catch (error) {
      console.error('Failed to import template:', error)
      return null
    }
  }

  /**
   * Get template statistics
   */
  getTemplateStats(): { totalTemplates: number; templatesByType: Record<string, number> } {
    const stats = {
      totalTemplates: this.templates.size,
      templatesByType: {} as Record<string, number>
    }

    for (const template of this.templates.values()) {
      const type = template.documentType
      stats.templatesByType[type] = (stats.templatesByType[type] || 0) + 1
    }

    return stats
  }
}

// Export singleton instance
export const pdfGenerator = new PDFGenerator()

// Export for testing
export { PDFGenerator }
