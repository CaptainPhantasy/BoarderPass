'use client';

import { useState, useEffect } from 'react';
import { usePWA } from '@/hooks/usePWA';

interface PWAInstallPromptProps {
  className?: string;
  showOnMobile?: boolean;
  showOnDesktop?: boolean;
}

export default function PWAInstallPrompt({ 
  className = '', 
  showOnMobile = true, 
  showOnDesktop = false 
}: PWAInstallPromptProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const {
    canInstall,
    isInstalled,
    installPWA,
    updateAvailable,
    updateServiceWorker,
    isUpdating,
  } = usePWA();

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Show prompt when conditions are met
  useEffect(() => {
    const shouldShow = 
      !isInstalled && 
      canInstall && 
      !isDismissed &&
      ((isMobile && showOnMobile) || (!isMobile && showOnDesktop));

    setIsVisible(shouldShow);
  }, [canInstall, isInstalled, isDismissed, isMobile, showOnMobile, showOnDesktop]);

  // Check if previously dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissed) {
      setIsDismissed(true);
    }
  }, []);

  const handleInstall = async () => {
    try {
      const success = await installPWA();
      if (success) {
        setIsVisible(false);
      }
    } catch (error) {
      console.error('Installation failed:', error);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  const handleUpdate = async () => {
    try {
      await updateServiceWorker();
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  if (!isVisible && !updateAvailable) {
    return null;
  }

  if (updateAvailable) {
    return (
      <div className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 ${className}`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium">Update Available</h3>
            <p className="text-sm text-blue-200 mt-1">
              A new version of BOARDERPASS is available. Update now for the latest features.
            </p>
          </div>
          <button
            type="button"
            onClick={handleUpdate}
            disabled={isUpdating}
            aria-label="Update application"
            className="flex-shrink-0 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 px-3 py-1 rounded text-sm font-medium transition-colors"
          >
            {isUpdating ? 'Updating...' : 'Update'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white border border-gray-200 p-4 rounded-lg shadow-lg z-50 ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900">Install BOARDERPASS</h3>
          <p className="text-sm text-gray-500 mt-1">
            Install our app for a better experience. Quick access from your home screen.
          </p>
        </div>
        
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Close install prompt"
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="mt-4 flex space-x-3">
        <button
          type="button"
          onClick={handleInstall}
          aria-label="Install BOARDERPASS application"
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Install
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss install prompt"
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Not now
        </button>
      </div>
      
      <div className="mt-3 text-xs text-gray-400 text-center">
        <p>Access from your home screen</p>
        <p>Works offline • Faster loading</p>
      </div>
    </div>
  );
}
