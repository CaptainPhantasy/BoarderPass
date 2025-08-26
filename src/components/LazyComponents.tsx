import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Loading component for lazy-loaded components
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-gray-600">Loading...</span>
  </div>
);

// Lazy load heavy components
export const LazyDocumentUpload = dynamic(
  () => import('./DocumentUpload'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false // Disable SSR for file upload components
  }
);

export const LazyDocumentViewer = dynamic(
  () => import('./DocumentViewer'),
  {
    loading: () => <LoadingSpinner />,
    ssr: true
  }
);

export const LazyPDFViewer = dynamic(
  () => import('./PDFViewer'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
);

export const LazyOCRProcessor = dynamic(
  () => import('./OCRProcessor'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
);

export const LazyTranslationEditor = dynamic(
  () => import('./TranslationEditor'),
  {
    loading: () => <LoadingSpinner />,
    ssr: true
  }
);

// Lazy load utility components
export const LazyDataTable = dynamic(
  () => import('./DataTable'),
  {
    loading: () => <LoadingSpinner />,
    ssr: true
  }
);

export const LazyChart = dynamic(
  () => import('./Chart'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
);

// Lazy load authentication components
export const LazyAuthGuard = dynamic(
  () => import('./AuthGuard'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
);

// Lazy load admin components
export const LazyAdminPanel = dynamic(
  () => import('./AdminPanel'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
);

// Higher-order component for lazy loading with error boundary
export function withLazyLoading<T extends object>(
  Component: React.ComponentType<T>,
  fallback?: React.ComponentType
) {
  const LazyComponent = dynamic(() => Promise.resolve(Component), {
    loading: () => fallback ? <fallback /> : <LoadingSpinner />,
    ssr: true
  });

  return function LazyWrapper(props: T) {
    return (
      <Suspense fallback={fallback ? <fallback /> : <LoadingSpinner />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}
