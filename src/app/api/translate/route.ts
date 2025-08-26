import { NextRequest, NextResponse } from 'next/server';
import { getTranslationService } from '@/lib/translation/translation-service';
import { supabase, getCurrentUser, updateDocument, getLegalTerms } from '@/lib/supabase/client';

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
      text, 
      targetLanguage, 
      sourceLanguage,
      useLegalDictionary = true 
    } = body;

    // Validate input
    if (!targetLanguage) {
      return NextResponse.json(
        { error: 'Target language is required' },
        { status: 400 }
      );
    }

    if (!documentId && !text) {
      return NextResponse.json(
        { error: 'Either documentId or text is required' },
        { status: 400 }
      );
    }

    let textToTranslate = text;
    let document = null;

    // If documentId provided, get text from document
    if (documentId) {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        return NextResponse.json(
          { error: 'Document not found' },
          { status: 404 }
        );
      }

      document = data;
      textToTranslate = document.original_text;

      if (!textToTranslate) {
        return NextResponse.json(
          { error: 'Document has no text to translate' },
          { status: 400 }
        );
      }
    }

    // Get translation service
    const translationService = getTranslationService();

    // Load legal dictionary if requested
    let legalDictionary: Map<string, Map<string, string>> | undefined;
    if (useLegalDictionary) {
      try {
        const legalTerms = await getLegalTerms();
        if (legalTerms && legalTerms.length > 0) {
          legalDictionary = new Map();
          
          for (const term of legalTerms) {
            if (!legalDictionary.has(term.term)) {
              legalDictionary.set(term.term, new Map());
            }
            legalDictionary.get(term.term)!.set(term.language, term.translation);
          }
        }
      } catch (error) {
        console.warn('Failed to load legal dictionary:', error);
      }
    }

    // Perform translation
    try {
      let translatedText: string;
      
      if (useLegalDictionary && legalDictionary) {
        // Use legal terms translation
        translatedText = await translationService.translateLegalTerms(
          textToTranslate,
          targetLanguage,
          legalDictionary
        );
      } else {
        // Regular translation
        const result = await translationService.translate(textToTranslate, {
          source: sourceLanguage,
          target: targetLanguage,
        });
        translatedText = result.translatedText;
      }

      // Update document if documentId was provided
      if (document) {
        await updateDocument(documentId, {
          translated_text: translatedText,
          target_language: targetLanguage,
          source_language: sourceLanguage || document.source_language,
        });
      }

      // Get supported languages for reference
      const supportedLanguages = await translationService.getSupportedLanguages();

      return NextResponse.json({
        success: true,
        documentId: documentId || null,
        translatedText,
        sourceLanguage: sourceLanguage || 'auto',
        targetLanguage,
        supportedLanguages,
      });

    } catch (translationError) {
      console.error('Translation error:', translationError);
      
      // Update document status if applicable
      if (document) {
        await updateDocument(documentId, {
          status: 'failed',
        });
      }

      return NextResponse.json(
        { error: 'Translation failed' },
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
    const action = searchParams.get('action');

    // Get supported languages
    if (action === 'languages') {
      const translationService = getTranslationService();
      const languages = await translationService.getSupportedLanguages();
      
      return NextResponse.json({
        success: true,
        languages,
      });
    }

    // Detect language
    if (action === 'detect') {
      const text = searchParams.get('text');
      
      if (!text) {
        return NextResponse.json(
          { error: 'Text is required for language detection' },
          { status: 400 }
        );
      }

      const translationService = getTranslationService();
      const detectedLanguage = await translationService.detectLanguage(text);
      
      return NextResponse.json({
        success: true,
        detectedLanguage,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
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