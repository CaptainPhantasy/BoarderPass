'use client';

import { useState } from 'react';

export default function TranslationPage() {
  const [sourceText, setSourceText] = useState('');
  const [targetText, setTargetText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('hi');
  const [targetLanguage, setTargetLanguage] = useState('en');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-2xl font-bold text-gray-900">Translation Interface</h1>
          </div>
        </div>

        {/* Translation Interface */}
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          {/* Language Selectors */}
          <div className="mb-6 flex space-x-4">
            <div className="flex-1">
              <label htmlFor="source-language" className="block text-sm font-medium text-gray-700 mb-2">
                Source Language
              </label>
              <select
                id="source-language"
                value={sourceLanguage}
                onChange={(e) => setSourceLanguage(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="hi">Hindi</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="zh">Chinese</option>
              </select>
            </div>
            <div className="flex-1">
              <label htmlFor="target-language" className="block text-sm font-medium text-gray-700 mb-2">
                Target Language
              </label>
              <select
                id="target-language"
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="zh">Chinese</option>
              </select>
            </div>
          </div>

          {/* Side-by-side Text Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source Text
              </label>
              <textarea
                className="source-text w-full h-64 border border-gray-300 rounded-md px-3 py-2"
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Enter text to translate..."
              />
              {/* Legal term highlighting */}
              {sourceText.includes('स्नातक') && (
                <div className="mt-2">
                  <span className="legal-term bg-yellow-200 px-1 rounded">स्नातक</span>
                  <span className="ml-2 text-sm text-gray-600">Legal term detected</span>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Text
              </label>
              <textarea
                className="target-text w-full h-64 border border-gray-300 rounded-md px-3 py-2"
                value={targetText}
                onChange={(e) => setTargetText(e.target.value)}
                placeholder="Translation will appear here..."
              />
            </div>
          </div>

          {/* Translation Button */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                // Simple mock translation for testing
                if (sourceText.includes('स्नातक')) {
                  setTargetText(sourceText.replace('स्नातक', "Bachelor's Degree"));
                }
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Translate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}