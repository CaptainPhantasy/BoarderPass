'use client';

import { Suspense, lazy } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

// Lazy load heavy components
const DocumentUpload = lazy(() => import('@/components/DocumentUpload'));
const DocumentList = lazy(() => import('@/components/DocumentList'));
const DocumentStats = lazy(() => import('@/components/DocumentStats'));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-gray-600">Loading dashboard...</span>
  </div>
);

export default function DocumentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }
        setUser(user);
      } catch (error) {
        console.error('Error checking user:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          router.push('/login');
        } else if (session?.user) {
          setUser(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Document Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Manage your document translations and validations
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Document Stats */}
          <div className="lg:col-span-1">
            <Suspense fallback={<LoadingSpinner />}>
              <DocumentStats userId={user.id} />
            </Suspense>
          </div>

          {/* Document Upload */}
          <div className="lg:col-span-2">
            <Suspense fallback={<LoadingSpinner />}>
              <DocumentUpload userId={user.id} />
            </Suspense>
          </div>
        </div>

        {/* Document List */}
        <div className="mt-8">
          <Suspense fallback={<LoadingSpinner />}>
            <DocumentList userId={user.id} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}