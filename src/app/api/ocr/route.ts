import { NextRequest, NextResponse } from 'next/server';
import { getTesseractService } from '@/lib/ocr/tesseract-service';
import { supabase, getCurrentUser, createDocument, updateDocument } from '@/lib/supabase/client';

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
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const language = formData.get('language') as string || 'eng';
    const documentType = formData.get('documentType') as string;
    const issueCountry = formData.get('issueCountry') as string;
    const targetCountry = formData.get('targetCountry') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size
    const maxSize = parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB || '10') * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size exceeds ${process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB || '10'}MB limit` },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload file to Supabase storage
    const fileName = `${user.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, buffer, {
        contentType: file.type,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);

    // Create document record
    const document = await createDocument({
      user_id: user.id,
      file_name: file.name,
      file_url: urlData.publicUrl,
      document_type: documentType || 'unknown',
      issue_country: issueCountry,
      target_country: targetCountry,
      status: 'processing',
    });

    // Perform OCR
    const tesseractService = getTesseractService();
    
    try {
      // Initialize service
      await tesseractService.initialize(language);
      
      // Process image
      const ocrResult = await tesseractService.processImage(buffer, {
        language,
      });

      // Extract structured data
      const structuredData = tesseractService.extractStructuredData(ocrResult.text);

      // Update document with OCR results
      await updateDocument(document.id, {
        original_text: ocrResult.text,
        source_language: language,
        status: 'completed',
      });

      // Return response
      return NextResponse.json({
        success: true,
        documentId: document.id,
        text: ocrResult.text,
        confidence: ocrResult.confidence,
        language: ocrResult.language,
        processingTime: ocrResult.processingTime,
        structuredData,
      });

    } catch (ocrError) {
      console.error('OCR error:', ocrError);
      
      // Update document status
      await updateDocument(document.id, {
        status: 'failed',
      });

      return NextResponse.json(
        { error: 'OCR processing failed' },
        { status: 500 }
      );
    } finally {
      // Clean up
      await tesseractService.terminate();
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

    // Get document ID from query params
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID required' },
        { status: 400 }
      );
    }

    // Get document from database
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

    return NextResponse.json({
      success: true,
      document,
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}