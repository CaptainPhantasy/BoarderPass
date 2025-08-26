import { NextRequest, NextResponse } from 'next/server';
import { getComplianceService } from '@/lib/validation/compliance-service';
import { 
  supabase, 
  getCurrentUser, 
  updateDocument, 
  getCountryRequirements 
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
      text,
      documentType,
      issueCountry,
      targetCountry,
      issueDate,
      expiryDate
    } = body;

    // Validate input
    if (!targetCountry) {
      return NextResponse.json(
        { error: 'Target country is required' },
        { status: 400 }
      );
    }

    if (!documentType) {
      return NextResponse.json(
        { error: 'Document type is required' },
        { status: 400 }
      );
    }

    let textToValidate = text;
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
      textToValidate = document.translated_text || document.original_text;

      if (!textToValidate) {
        return NextResponse.json(
          { error: 'Document has no text to validate' },
          { status: 400 }
        );
      }
    }

    if (!textToValidate) {
      return NextResponse.json(
        { error: 'Text is required for validation' },
        { status: 400 }
      );
    }

    // Initialize compliance service
    const complianceService = getComplianceService();

    // Prepare metadata
    const metadata = {
      type: documentType,
      issueCountry: issueCountry || document?.issue_country || '',
      targetCountry: targetCountry || document?.target_country || '',
      issueDate: issueDate ? new Date(issueDate) : undefined,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
    };

    // Perform validation
    try {
      const validationResult = await complianceService.validateDocument(
        textToValidate,
        metadata
      );

      // Get specific country requirements
      const countryReq = await complianceService.getCountryRequirements(targetCountry);

      // Update document if documentId was provided
      if (document) {
        await updateDocument(documentId, {
          validation_results: validationResult,
          status: validationResult.isValid ? 'completed' : 'completed',
        });
      }

      return NextResponse.json({
        success: true,
        documentId: documentId || null,
        validationResult,
        countryRequirements: countryReq || null,
        metadata,
      });

    } catch (validationError) {
      console.error('Validation error:', validationError);
      
      // Update document status if applicable
      if (document) {
        await updateDocument(documentId, {
          status: 'failed',
        });
      }

      return NextResponse.json(
        { error: 'Validation failed' },
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
    const country = searchParams.get('country');

    // Get country requirements
    if (country) {
      try {
        const requirements = await getCountryRequirements(country);
        
        if (!requirements) {
          return NextResponse.json(
            { error: 'Country requirements not found' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          requirements,
        });
      } catch (error) {
        console.error('Failed to get country requirements:', error);
        return NextResponse.json(
          { error: 'Failed to retrieve country requirements' },
          { status: 500 }
        );
      }
    }

    // Get all countries with requirements
    try {
      const allRequirements = await getCountryRequirements();
      
      const countries = Array.isArray(allRequirements) 
        ? allRequirements.map(req => ({
            code: req.country_code,
            name: req.country_name,
            apostilleRequired: req.apostille_required,
            translationRequired: req.translation_required,
          }))
        : [];

      return NextResponse.json({
        success: true,
        countries,
      });
    } catch (error) {
      console.error('Failed to get all requirements:', error);
      return NextResponse.json({
        success: true,
        countries: [],
      });
    }

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}