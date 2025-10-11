"use client";

import { useEffect, useState } from 'react';
import { safariCompatibility, BrowserInfo } from '@/lib/safari-compatibility';

interface BrowserDetectionProps {
  children: React.ReactNode;
}

export default function BrowserDetection({ children }: BrowserDetectionProps) {
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Detect browser and apply fixes
    const info = safariCompatibility.detectBrowser();
    setBrowserInfo(info);
    
    // Apply Safari-specific fixes
    safariCompatibility.applySafariFixes();
    
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Add browser-specific classes to the body
    if (browserInfo) {
      const classes = safariCompatibility.getSafariClasses();
      document.body.classList.add(...classes);
      
      // Add browser-specific class
      if (browserInfo.isSafari) {
        document.body.classList.add('safari-browser');
      }
      
      if (browserInfo.isMobile) {
        document.body.classList.add('mobile-browser');
      }
    }
  }, [browserInfo]);

  if (isLoading) {
    return <>{children}</>;
  }

  return (
    <div className={`browser-detection ${browserInfo?.isSafari ? 'safari-browser' : ''} ${browserInfo?.isMobile ? 'mobile-browser' : ''}`}>
      {children}
      
      {/* Browser compatibility warning for Safari */}
      {browserInfo?.isSafari && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Safari Compatibility
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    You're using Safari. Some features may work differently. 
                    For the best experience, consider using Chrome or Firefox.
                  </p>
                </div>
                <div className="mt-3">
                  <button
                    type="button"
                    className="bg-yellow-50 px-2 py-1.5 rounded-md text-sm font-medium text-yellow-800 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600"
                    onClick={() => {
                      const warning = document.querySelector('.fixed.bottom-4.right-4');
                      if (warning) {
                        warning.remove();
                      }
                    }}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
