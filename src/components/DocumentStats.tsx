'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

interface DocumentStatsProps {
  userId: string;
}

interface Stats {
  total: number;
  completed: number;
  processing: number;
  failed: number;
  pending: number;
}

export default function DocumentStats({ userId }: DocumentStatsProps) {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    completed: 0,
    processing: 0,
    failed: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [userId]);

  const loadStats = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('status')
        .eq('user_id', userId);

      if (error) throw error;

      const statusCounts = data?.reduce((acc, doc) => {
        acc[doc.status] = (acc[doc.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      setStats({
        total: data?.length || 0,
        completed: statusCounts.completed || 0,
        processing: statusCounts.processing || 0,
        failed: statusCounts.failed || 0,
        pending: statusCounts.pending || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Document Statistics</h2>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-500">Total Documents</span>
          <span className="text-2xl font-bold text-gray-900">{stats.total}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-500">Completed</span>
          <span className="text-lg font-semibold text-green-600">{stats.completed}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-500">Processing</span>
          <span className="text-lg font-semibold text-yellow-600">{stats.processing}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-500">Pending</span>
          <span className="text-lg font-semibold text-blue-600">{stats.pending}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-500">Failed</span>
          <span className="text-lg font-semibold text-red-600">{stats.failed}</span>
        </div>
      </div>

      {stats.total > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Success Rate: {Math.round((stats.completed / stats.total) * 100)}%
          </div>
        </div>
      )}
    </div>
  );
}
