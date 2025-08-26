import { NextRequest, NextResponse } from 'next/server';
import { getPDFService } from '@/lib/pdf/pdf-service';
import { 
  supabase, 
  getCurrentUser,
  updateDocument 
} from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request
    const body = await request.json();
    const { 
      documentId,
      content,
      options = {
        includeOriginal: true,
        includeTranslation: true,
        includeValidation: true,
        addWatermark: true,
        addPageNumbers: true,
      }
    } = body;

    let documentContent = content;

    // If documentId provided, get content from document
    if (documentId) {
      const { data: document, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .eq('user_id', user.id)
        .single();

      if (error || !document) {
        return NextResponse.json(
          { error: 'Document not found' },
          { status: 404 }
        );
      }

      // Build content from document
      documentContent = {
        originalText: document.original_text,
        translatedText: document.translated_text,
        sourceLanguage: document.source_language,
        targetLanguage: document.target_language,
        validationResults: document.validation_results,
        metadata: {
          processedDate: new Date(),
          documentType: document.document_type,
          issueCountry: document.issue_country,
          targetCountry: document.target_country,
        },
      };
    }

    if (!documentContent) {
      return NextResponse.json(
        { error: 'Content is required for PDF generation' },
        { status: 400 }
      );
    }

    // Generate PDF
    const pdfService = getPDFService();
    
    try {
      const pdfBytes = await pdfService.generateTranslatedDocument(
        documentContent,
        options
      );

      // Convert Uint8Array to Buffer
      const pdfBuffer = Buffer.from(pdfBytes);

      // Generate filename
      const filename = `boarderpass-${documentId || 'document'}-${Date.now()}.pdf`;

      // Upload PDF to Supabase storage
      const pdfPath = `${user.id}/generated/${filename}`;
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(pdfPath, pdfBuffer, {
          contentType: 'application/pdf',
        });

      if (uploadError) {
        console.error('PDF upload error:', uploadError);
        return NextResponse.json(
          { error: 'Failed to save generated PDF' },
          { status: 500 }
        );
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(pdfPath);

      // Update document record if applicable
      if (documentId) {
        await updateDocument(documentId, {
          status: 'completed',
        });
      }

      // Return the PDF as a response with download URL
      return NextResponse.json({
        success: true,
        documentId: documentId || null,
        filename,
        downloadUrl: urlData.publicUrl,
        size: pdfBuffer.length,
      });

    } catch (pdfError) {
      console.error('PDF generation error:', pdfError);
      
      // Update document status if applicable
      if (documentId) {
        await updateDocument(documentId, {
          status: 'failed',
        });
      }

      return NextResponse.json(
        { error: 'PDF generation failed' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');
    const action = searchParams.get('action');

    // Download existing PDF
    if (action === 'download' && documentId) {
      const { data: document, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .eq('user_id', user.id)
        .single();

      if (error || !document) {
        return NextResponse.json(
          { error: 'Document not found' },
          { status: 404 }
        );
      }

      // Generate PDF on the fly
      const pdfService = getPDFService();
      
      const documentContent = {
        originalText: document.original_text,
        translatedText: document.translated_text,
        sourceLanguage: document.source_language,
        targetLanguage: document.target_language,
        validationResults: document.validation_results,
        metadata: {
          processedDate: new Date(document.created_at),
          documentType: document.document_type,
          issueCountry: document.issue_country,
          targetCountry: document.target_country,
        },
      };

      const pdfBytes = await pdfService.generateTranslatedDocument(
        documentContent,
        {
          includeOriginal: true,
          includeTranslation: true,
          includeValidation: true,
          addWatermark: true,
          addPageNumbers: true,
        }
      );

      // Return PDF as binary response
      return new NextResponse(Buffer.from(pdfBytes), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="boarderpass-${documentId}.pdf"`,
        },
      });
    }

    // Get generation status
    if (documentId) {
      const { data: document, error } = await supabase
        .from('documents')
        .select('id, status, created_at, updated_at')
        .eq('id', documentId)
        .eq('user_id', user.id)
        .single();

      if (error || !document) {
        return NextResponse.json(
          { error: 'Document not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        status: document.status,
        createdAt: document.created_at,
        updatedAt: document.updated_at,
      });
    }

    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}