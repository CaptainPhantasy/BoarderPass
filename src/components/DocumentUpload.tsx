'use client';

import { useState, useId } from 'react';

interface DocumentUploadProps {
  userId: string;
}

export default function DocumentUpload({ userId }: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileUploadId = useId();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccess('');
    setUploading(true);

    try {
      // Step 1: OCR
      const formData = new FormData();
      formData.append('file', file);
      formData.append('language', 'eng');
      formData.append('documentType', 'certificate');
      formData.append('targetCountry', 'US');

      const ocrResponse = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });

      if (!ocrResponse.ok) {
        throw new Error('OCR processing failed');
      }

      const ocrResult = await ocrResponse.json();
      setSuccess('Document uploaded and text extracted successfully!');

      // Step 2: Translation
      const translateResponse = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: ocrResult.documentId,
          targetLanguage: 'es',
        }),
      });

      if (translateResponse.ok) {
        setSuccess('Document translated successfully!');
      }

      // Step 3: Validation
      const validateResponse = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: ocrResult.documentId,
          documentType: 'certificate',
          targetCountry: 'US',
        }),
      });

      if (validateResponse.ok) {
        setSuccess('Document validated successfully!');
      }

      // Step 4: Generate PDF
      const generateResponse = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: ocrResult.documentId,
        }),
      });

      if (generateResponse.ok) {
        setSuccess('PDF generated successfully! You can download it now.');
      }

    } catch (error) {
      console.error('Error processing document:', error);
      setError('Failed to process document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Upload New Document</h2>
      
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="mt-4">
          <label htmlFor={fileUploadId} className="cursor-pointer">
            <span className="mt-2 block text-sm font-medium text-gray-900">
              {uploading ? 'Uploading...' : 'Click to upload a document'}
            </span>
            <input
              id={fileUploadId}
              name="file-upload"
              type="file"
              className="sr-only"
              accept="image/*,.pdf"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
          <p className="mt-1 text-xs text-gray-500">
            PNG, JPG, PDF up to 10MB
          </p>
        </div>
      </div>
    </div>
  );
}
