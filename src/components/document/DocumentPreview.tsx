'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Image, 
  Download, 
  Eye, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  X,
  Globe,
  Calendar,
  User
} from 'lucide-react'

interface Document {
  id: string
  document_type: string
  source_country: string
  target_country: string
  source_language: string
  target_language: string
  status: string
  original_filename: string
  created_at: string
  extracted_text?: string
  translated_text?: string
  validation_results?: any
}

interface DocumentPreviewProps {
  document: Document
  onDelete?: (id: string) => void
}

const statusConfig = {
  uploaded: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Uploaded' },
  processing: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Processing' },
  extracting: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Extracting Text' },
  translating: { icon: Globe, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Translating' },
  validating: { icon: CheckCircle, color: 'text-orange-600', bg: 'bg-orange-100', label: 'Validating' },
  completed: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Completed' },
  failed: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Failed' },
}

const documentTypeIcons = {
  degree: '🎓',
  transcript: '📚',
  birth_certificate: '👶',
  marriage_certificate: '💒',
  bank_statement: '🏦',
  tax_return: '📊',
  employment_letter: '💼',
  police_clearance: '👮',
}

export default function DocumentPreview({ document, onDelete }: DocumentPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'extracted' | 'translated' | 'validation'>('details')

  const status = statusConfig[document.status as keyof typeof statusConfig] || statusConfig.uploaded
  const StatusIcon = status.icon

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getFileIcon = () => {
    if (document.original_filename.toLowerCase().endsWith('.pdf')) {
      return <FileText className="h-8 w-8 text-red-500" />
    }
    return <Image className="h-8 w-8 text-blue-500" />
  }

  const tabs = [
    { id: 'details', label: 'Details', icon: User },
    { id: 'extracted', label: 'Extracted Text', icon: FileText, disabled: !document.extracted_text },
    { id: 'translated', label: 'Translation', icon: Globe, disabled: !document.translated_text },
    { id: 'validation', label: 'Validation', icon: CheckCircle, disabled: !document.validation_results },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-gray-100 rounded-lg">
              {getFileIcon()}
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-lg font-medium text-gray-900">
                  {document.original_filename}
                </span>
                <span className="text-2xl">
                  {documentTypeIcons[document.document_type as keyof typeof documentTypeIcons]}
                </span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <Globe className="h-4 w-4 mr-1" />
                  {document.source_country} → {document.target_country}
                </span>
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(document.created_at)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.color}`}>
              <div className="flex items-center space-x-1">
                <StatusIcon className="h-4 w-4" />
                <span>{status.label}</span>
              </div>
            </div>
            
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {isExpanded ? <X className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
            
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(document.id)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-gray-200"
        >
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    disabled={tab.disabled}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : tab.disabled
                        ? 'border-transparent text-gray-400 cursor-not-allowed'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'details' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Document Information</h4>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Document Type:</dt>
                      <dd className="text-gray-900 font-medium">
                        {documentTypeIcons[document.document_type as keyof typeof documentTypeIcons]} {document.document_type.replace('_', ' ')}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Source Country:</dt>
                      <dd className="text-gray-900 font-medium">{document.source_country}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Target Country:</dt>
                      <dd className="text-gray-900 font-medium">{document.target_country}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Source Language:</dt>
                      <dd className="text-gray-900 font-medium">{document.source_language}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Target Language:</dt>
                      <dd className="text-gray-900 font-medium">{document.target_language}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Created:</dt>
                      <dd className="text-gray-900 font-medium">{formatDate(document.created_at)}</dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Processing Status</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Upload</span>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Text Extraction</span>
                      {document.status === 'extracting' ? (
                        <Clock className="h-5 w-5 text-yellow-500" />
                      ) : document.extracted_text ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Translation</span>
                      {document.status === 'translating' ? (
                        <Clock className="h-5 w-5 text-yellow-500" />
                      ) : document.translated_text ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Validation</span>
                      {document.status === 'validating' ? (
                        <Clock className="h-5 w-5 text-yellow-500" />
                      ) : document.validation_results ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'extracted' && document.extracted_text && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Extracted Text</h4>
                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                    {document.extracted_text}
                  </pre>
                </div>
              </div>
            )}

            {activeTab === 'translated' && document.translated_text && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Translated Text</h4>
                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                    {document.translated_text}
                  </pre>
                </div>
              </div>
            )}

            {activeTab === 'validation' && document.validation_results && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Validation Results</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                    {JSON.stringify(document.validation_results, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </button>
            <button
              type="button"
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </button>
          </div>
          
          {document.status === 'completed' && (
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              View Certificate
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
