'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  
  // Document processing state
  const [sourceCountry, setSourceCountry] = useState<string>('');
  const [targetCountry, setTargetCountry] = useState<string>('');
  const [documentType, setDocumentType] = useState<string>('');
  const [showRequirements, setShowRequirements] = useState<boolean>(false);
  const [showTranslation, setShowTranslation] = useState<boolean>(false);
  const [validationResults, setValidationResults] = useState<{score: number, errors: string[]} | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateRequirements = (source: string, target: string, docType: string) => {
    if (source && target && docType) {
      setShowRequirements(true);
      setShowTranslation(true);
    } else {
      setShowRequirements(false);
      setShowTranslation(false);
    }
  };
  
  const handleValidation = () => {
    if (!sourceCountry || !targetCountry || !documentType) return;
    
    const errors = [];
    if (sourceCountry === 'IN' && targetCountry === 'US') {
      errors.push('Apostille required');
    }
    
    setValidationResults({
      score: errors.length === 0 ? 100 : 75,
      errors
    });
  };
  
  const getRequirementsForCountry = (source: string, target: string, docType: string) => {
    const requirements = [];
    
    if (source === 'IN' && target === 'US' && docType === 'degree') {
      requirements.push(
        { type: 'must-have', text: 'Original degree certificate' },
        { type: 'authentication', text: 'MEA apostille' },
        { type: 'standard', text: 'Certified English translation' }
      );
    } else if (source === 'MX' && target === 'US' && docType === 'transcript') {
      requirements.push(
        { type: 'authentication', text: 'Secretary of Education apostille' },
        { type: 'standard', text: 'Official transcript copy' }
      );
    } else if (source === 'CN' && target === 'CA' && docType === 'degree') {
      requirements.push(
        { type: 'authentication', text: 'Foreign Affairs Ministry apostille' },
        { type: 'standard', text: 'Degree verification' }
      );
    } else if (source === 'BR' && target === 'PT' && docType === 'degree') {
      requirements.push(
        { type: 'authentication', text: 'Ministry of Foreign Affairs apostille' },
        { type: 'standard', text: 'Portuguese translation' }
      );
    } else if (source === 'NG' && target === 'GB' && docType === 'degree') {
      requirements.push(
        { type: 'must-have', text: 'National Youth Service Corps (NYSC) certificate' },
        { type: 'standard', text: 'University verification' }
      );
    }
    
    return requirements;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">BOARDERPASS</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link
                    href="/documents"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={async () => {
                      await supabase.auth.signOut();
                      router.push('/');
                    }}
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h2 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Document Translation</span>
            <span className="block text-blue-600">Made Simple</span>
          </h2>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Translate, validate, and certify your international documents with confidence. 
            Supporting refugees, immigrants, and global citizens worldwide.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            {user ? (
              <Link
                href="/documents"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/register"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
              >
                Start Free Translation
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Document Processing Form */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Document Processing</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label htmlFor="source-country" className="block text-sm font-medium text-gray-700 mb-2">
                  Source Country
                </label>
                <select
                  id="source-country"
                  value={sourceCountry}
                  onChange={(e) => {
                    setSourceCountry(e.target.value);
                    updateRequirements(e.target.value, targetCountry, documentType);
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Select source country</option>
                  <option value="IN">India</option>
                  <option value="MX">Mexico</option>
                  <option value="CN">China</option>
                  <option value="BR">Brazil</option>
                  <option value="NG">Nigeria</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="target-country" className="block text-sm font-medium text-gray-700 mb-2">
                  Target Country
                </label>
                <select
                  id="target-country"
                  value={targetCountry}
                  onChange={(e) => {
                    setTargetCountry(e.target.value);
                    updateRequirements(sourceCountry, e.target.value, documentType);
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Select target country</option>
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="PT">Portugal</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="document-type" className="block text-sm font-medium text-gray-700 mb-2">
                  Document Type
                </label>
                <select
                  id="document-type"
                  value={documentType}
                  onChange={(e) => {
                    setDocumentType(e.target.value);
                    updateRequirements(sourceCountry, targetCountry, e.target.value);
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Select document type</option>
                  <option value="degree">Degree</option>
                  <option value="transcript">Transcript</option>
                  <option value="certificate">Certificate</option>
                </select>
              </div>
            </div>
            
            <div className="text-center mb-6">
              <button
                id="validate-button"
                onClick={handleValidation}
                disabled={!sourceCountry || !targetCountry || !documentType}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                Validate Requirements
              </button>
            </div>
            
            {/* Requirements Section */}
            {showRequirements && (
              <div className="requirements-section border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Requirements</h3>
                <div className="space-y-3">
                  {getRequirementsForCountry(sourceCountry, targetCountry, documentType).map((req, index) => (
                    <div key={index} className={`requirement-item p-3 rounded-md ${
                      req.type === 'must-have' ? 'bg-red-50 border border-red-200' :
                      req.type === 'authentication' ? 'bg-yellow-50 border border-yellow-200' :
                      'bg-gray-50 border border-gray-200'
                    }`}>
                      <div className={`${
                        req.type === 'must-have' ? 'requirement-must-have' :
                        req.type === 'authentication' ? 'requirement-authentication' :
                        'requirement-item'
                      }`}>
                        {req.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Validation Results */}
            {validationResults && (
              <div className="validation-results border-t pt-6 mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Validation Results</h3>
                <div className="compliance-score mb-4">
                  <span className="text-2xl font-bold text-green-600">{validationResults.score}%</span>
                  <span className="ml-2 text-gray-600">Compliance Score</span>
                </div>
                {validationResults.errors.map((error: string, index: number) => (
                  <div key={index} className="validation-error p-3 bg-red-50 border border-red-200 rounded-md mb-2">
                    {error}
                  </div>
                ))}
              </div>
            )}
            
            {/* Translation Section */}
            {showTranslation && (
              <div className="translation-section border-t pt-6 mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Legal Term Translation</h3>
                <div className="term-mapping p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">स्नातक</span>
                    <span className="text-gray-500">→</span>
                    <span className="font-medium">Bachelor's Degree</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Office Information */}
            {sourceCountry === 'IN' && targetCountry === 'US' && (
              <div className="office-locations border-t pt-6 mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Office Information</h3>
                <div className="office-location p-4 bg-gray-50 border border-gray-200 rounded-md">
                  <h4 className="font-medium">MEA Apostille Division</h4>
                  <p className="office-address text-gray-600">Patiala House, Tilak Marg, New Delhi</p>
                </div>
              </div>
            )}
            
            {/* Fee Estimation */}
            {sourceCountry === 'IN' && targetCountry === 'US' && (
              <div className="fee-estimation border-t pt-6 mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Fee Estimation</h3>
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <span className="total-estimated-fee font-medium text-green-800">₹1000-3000</span>
                  <span className="ml-2 text-green-600">Total estimated cost</span>
                </div>
              </div>
            )}
            
            {/* Processing Time */}
            {sourceCountry === 'IN' && targetCountry === 'US' && (
              <div className="processing-time border-t pt-6 mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Processing Time</h3>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <span className="typical-processing-days font-medium text-blue-800">15</span>
                  <span className="ml-2 text-blue-600">typical processing days</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need for document processing
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {/* Feature 1 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">OCR Text Extraction</p>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Advanced OCR technology extracts text from scanned documents and images with high accuracy.
                </dd>
              </div>

              {/* Feature 2 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Multi-Language Translation</p>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Translate documents between 100+ languages with legal terminology support.
                </dd>
              </div>

              {/* Feature 3 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Compliance Validation</p>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Automatic validation against country-specific requirements and apostille verification.
                </dd>
              </div>

              {/* Feature 4 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">PDF Generation</p>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Generate certified PDF documents with translations and validation reports.
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">How It Works</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Simple 4-step process
            </p>
          </div>

          <div className="mt-10">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0 md:space-x-8">
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-600 text-white text-xl font-bold">
                  1
                </div>
                <h3 className="mt-4 text-lg font-medium">Upload Document</h3>
                <p className="mt-2 text-sm text-gray-500">Scan or photograph your document</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-600 text-white text-xl font-bold">
                  2
                </div>
                <h3 className="mt-4 text-lg font-medium">Extract Text</h3>
                <p className="mt-2 text-sm text-gray-500">AI-powered OCR extracts text</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-600 text-white text-xl font-bold">
                  3
                </div>
                <h3 className="mt-4 text-lg font-medium">Translate & Validate</h3>
                <p className="mt-2 text-sm text-gray-500">Translate and check compliance</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-600 text-white text-xl font-bold">
                  4
                </div>
                <h3 className="mt-4 text-lg font-medium">Download PDF</h3>
                <p className="mt-2 text-sm text-gray-500">Get your certified translation</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to translate your documents?</span>
            <span className="block">Start today for free.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-blue-200">
            Join thousands of users who trust BOARDERPASS for their document translation needs.
          </p>
          {!user && (
            <Link
              href="/register"
              className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 sm:w-auto"
            >
              Sign up for free
            </Link>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Twitter</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center text-base text-gray-400">
              2025 BOARDERPASS. Humanitarian document translation platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}