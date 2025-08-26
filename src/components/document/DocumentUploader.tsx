'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { Upload, X, FileText, Image, File, Globe, MapPin } from 'lucide-react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'

const documentSchema = z.object({
  sourceCountry: z.string().min(1, 'Source country is required'),
  targetCountry: z.string().min(1, 'Target country is required'),
  documentType: z.enum([
    'degree', 'transcript', 'birth_certificate', 'marriage_certificate',
    'bank_statement', 'tax_return', 'employment_letter', 'police_clearance'
  ], { required_error: 'Document type is required' }),
  sourceLanguage: z.string().min(1, 'Source language is required'),
  targetLanguage: z.string().min(1, 'Target language is required'),
})

type DocumentForm = z.infer<typeof documentSchema>

interface UploadedFile {
  id: string
  file: File
  preview: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
}

interface DocumentUploaderProps {
  onDocumentsAdded: (documents: any[]) => void
}

const countries = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰' },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
]

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', flag: '🇧🇩' },
  { code: 'ur', name: 'Urdu', flag: '🇵🇰' },
  { code: 'uk', name: 'Ukrainian', flag: '🇺🇦' },
]

const documentTypes = [
  { value: 'degree', label: 'Academic Degree', icon: '🎓' },
  { value: 'transcript', label: 'Academic Transcript', icon: '📚' },
  { value: 'birth_certificate', label: 'Birth Certificate', icon: '👶' },
  { value: 'marriage_certificate', label: 'Marriage Certificate', icon: '💒' },
  { value: 'bank_statement', label: 'Bank Statement', icon: '🏦' },
  { value: 'tax_return', label: 'Tax Return', icon: '📊' },
  { value: 'employment_letter', label: 'Employment Letter', icon: '💼' },
  { value: 'police_clearance', label: 'Police Clearance', icon: '👮' },
]

export default function DocumentUploader({ onDocumentsAdded }: DocumentUploaderProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<DocumentForm>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      sourceCountry: '',
      targetCountry: '',
      documentType: 'degree',
      sourceLanguage: 'en',
      targetLanguage: 'en',
    },
  })

  const watchedValues = watch()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
      status: 'pending' as const,
      progress: 0,
    }))

    setUploadedFiles(prev => [...prev, ...newFiles])
    toast.success(`${acceptedFiles.length} file(s) added successfully`)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.tiff'],
      'application/pdf': ['.pdf'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 10,
  })

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-8 w-8 text-blue-500" />
    if (file.type === 'application/pdf') return <FileText className="h-8 w-8 text-red-500" />
    return <File className="h-8 w-8 text-gray-500" />
  }

  const onSubmit = async (data: DocumentForm) => {
    if (uploadedFiles.length === 0) {
      toast.error('Please upload at least one document')
      return
    }

    setIsUploading(true)

    try {
      // TODO: Implement actual document upload to Supabase
      const documents = uploadedFiles.map(file => ({
        id: file.id,
        ...data,
        original_filename: file.file.name,
        status: 'uploaded',
        created_at: new Date().toISOString(),
      }))

      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 2000))

      onDocumentsAdded(documents)
      setUploadedFiles([])
      toast.success('Documents uploaded successfully!')
      
    } catch (error) {
      toast.error('Failed to upload documents. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Document Type and Country Selection */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Document Configuration</h3>
        
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Document Type */}
          <div>
            <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-2">
              Document Type
            </label>
            <select
              id="documentType"
              {...register('documentType')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {documentTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
            {errors.documentType && (
              <p className="mt-1 text-sm text-red-600">{errors.documentType.message}</p>
            )}
          </div>

          {/* Source Country */}
          <div>
            <label htmlFor="sourceCountry" className="block text-sm font-medium text-gray-700 mb-2">
              Source Country
            </label>
            <select
              id="sourceCountry"
              {...register('sourceCountry')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select source country</option>
              {countries.map(country => (
                <option key={country.code} value={country.code}>
                  {country.flag} {country.name}
                </option>
              ))}
            </select>
            {errors.sourceCountry && (
              <p className="mt-1 text-sm text-red-600">{errors.sourceCountry.message}</p>
            )}
          </div>

          {/* Target Country */}
          <div>
            <label htmlFor="targetCountry" className="block text-sm font-medium text-gray-700 mb-2">
              Target Country
            </label>
            <select
              id="targetCountry"
              {...register('targetCountry')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select target country</option>
              {countries.map(country => (
                <option key={country.code} value={country.code}>
                  {country.flag} {country.name}
                </option>
              ))}
            </select>
            {errors.targetCountry && (
              <p className="mt-1 text-sm text-red-600">{errors.targetCountry.message}</p>
            )}
          </div>

          {/* Source Language */}
          <div>
            <label htmlFor="sourceLanguage" className="block text-sm font-medium text-gray-700 mb-2">
              Source Language
            </label>
            <select
              id="sourceLanguage"
              {...register('sourceLanguage')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
            {errors.sourceLanguage && (
              <p className="mt-1 text-sm text-red-600">{errors.sourceLanguage.message}</p>
            )}
          </div>

          {/* Target Language */}
          <div>
            <label htmlFor="targetLanguage" className="block text-sm font-medium text-gray-700 mb-2">
              Target Language
            </label>
            <select
              id="targetLanguage"
              {...register('targetLanguage')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
            {errors.targetLanguage && (
              <p className="mt-1 text-sm text-red-600">{errors.targetLanguage.message}</p>
            )}
          </div>
        </form>
      </div>

      {/* File Upload Area */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Documents</h3>
        
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            {isDragActive
              ? 'Drop the files here...'
              : 'Drag & drop files here, or click to select files'}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Supports PDF, JPG, PNG, GIF, BMP, TIFF (Max 10MB per file, up to 10 files)
          </p>
        </div>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Selected Files ({uploadedFiles.length})
          </h3>
          
          <div className="space-y-3">
            {uploadedFiles.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.file)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Submit Button */}
      {uploadedFiles.length > 0 && (
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isUploading}
            onClick={handleSubmit(onSubmit)}
            className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isUploading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Uploading...
              </div>
            ) : (
              `Process ${uploadedFiles.length} Document${uploadedFiles.length > 1 ? 's' : ''}`
            )}
          </button>
        </div>
      )}
    </div>
  )
}
