'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Globe, 
  CheckSquare,
  Play,
  Pause,
  RefreshCw
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
}

interface DocumentProcessorProps {
  documents: Document[]
  onStatusUpdate: (docId: string, status: string) => void
}

const processingSteps = [
  { id: 'extracting', label: 'Text Extraction', icon: FileText, description: 'Extracting text from document using OCR' },
  { id: 'translating', label: 'Translation', icon: Globe, description: 'Translating extracted text to target language' },
  { id: 'validating', label: 'Validation', icon: CheckSquare, description: 'Validating against country requirements' },
]

export default function DocumentProcessor({ documents, onStatusUpdate }: DocumentProcessorProps) {
  const [processingQueue, setProcessingQueue] = useState<Document[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState<string>('')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (documents.length > 0) {
      setProcessingQueue(documents)
    }
  }, [documents])

  const startProcessing = async () => {
    if (processingQueue.length === 0) return

    setIsProcessing(true)
    setProgress(0)

    for (const doc of processingQueue) {
      try {
        // Step 1: Text Extraction
        setCurrentStep('extracting')
        onStatusUpdate(doc.id, 'extracting')
        await simulateProcessing('extracting', 3000)
        setProgress(33)

        // Step 2: Translation
        setCurrentStep('translating')
        onStatusUpdate(doc.id, 'translating')
        await simulateProcessing('translating', 4000)
        setProgress(66)

        // Step 3: Validation
        setCurrentStep('validating')
        onStatusUpdate(doc.id, 'validating')
        await simulateProcessing('validating', 2000)
        setProgress(100)

        // Complete
        onStatusUpdate(doc.id, 'completed')
        
        // Remove from queue
        setProcessingQueue(prev => prev.filter(d => d.id !== doc.id))
        
      } catch (error) {
        console.error(`Error processing document ${doc.id}:`, error)
        onStatusUpdate(doc.id, 'failed')
        setProcessingQueue(prev => prev.filter(d => d.id !== doc.id))
      }
    }

    setIsProcessing(false)
    setCurrentStep('')
    setProgress(0)
  }

  const simulateProcessing = (step: string, duration: number): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, duration)
    })
  }

  const pauseProcessing = () => {
    setIsProcessing(false)
  }

  const resumeProcessing = () => {
    if (processingQueue.length > 0) {
      startProcessing()
    }
  }

  const retryDocument = (docId: string) => {
    const doc = documents.find(d => d.id === docId)
    if (doc) {
      onStatusUpdate(docId, 'uploaded')
      setProcessingQueue(prev => [...prev, { ...doc, status: 'uploaded' }])
    }
  }

  const getStepIcon = (step: string) => {
    switch (step) {
      case 'extracting':
        return <FileText className="h-5 w-5" />
      case 'translating':
        return <Globe className="h-5 w-5" />
      case 'validating':
        return <CheckSquare className="h-5 w-5" />
      default:
        return <Clock className="h-5 w-5" />
    }
  }

  const getStepColor = (step: string) => {
    switch (step) {
      case 'extracting':
        return 'text-blue-600 bg-blue-100'
      case 'translating':
        return 'text-purple-600 bg-purple-100'
      case 'validating':
        return 'text-orange-600 bg-orange-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  if (processingQueue.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No documents to process</h3>
        <p className="mt-1 text-sm text-gray-500">
          All documents have been processed successfully.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Processing Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Processing Queue</h3>
          <div className="flex items-center space-x-3">
            {!isProcessing ? (
              <button
                type="button"
                onClick={startProcessing}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Processing
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={pauseProcessing}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </button>
                <button
                  type="button"
                  onClick={resumeProcessing}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </button>
              </>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {isProcessing && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Processing Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}

        {/* Current Step */}
        {currentStep && (
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className={`p-2 rounded-lg ${getStepColor(currentStep)}`}>
              {getStepIcon(currentStep)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {processingSteps.find(s => s.id === currentStep)?.label}
              </p>
              <p className="text-xs text-gray-500">
                {processingSteps.find(s => s.id === currentStep)?.description}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Processing Steps Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Processing Steps</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {processingSteps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`p-4 rounded-lg border-2 transition-colors ${
                currentStep === step.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  currentStep === step.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  <step.icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{step.label}</h4>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Documents in Queue */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Documents in Queue ({processingQueue.length})
        </h3>
        
        <div className="space-y-3">
          {processingQueue.map((doc, index) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{doc.original_filename}</p>
                  <p className="text-xs text-gray-500">
                    {doc.source_country} → {doc.target_country} • {doc.document_type.replace('_', ' ')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">#{index + 1}</span>
                <button
                  type="button"
                  onClick={() => retryDocument(doc.id)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Retry document"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Processing Tips */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-3">Processing Tips</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>Processing time depends on document complexity and size</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>Larger documents may take longer to process</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>You can pause and resume processing at any time</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>Failed documents can be retried from the queue</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
