"use client";

import { useEffect } from 'react';

export function ErrorSuppressor() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const originalConsoleError = console.error;
      console.error = (...args: any[]) => {
        // Tawk.to's internal script randomly logs `true` as an error, which triggers Next.js's massive red overlay.
        // We suppress exactly this error so it doesn't ruin the developer experience.
        if (args[0] === true || args[0] === 'true') return; 
        
        // Suppress Firestore offline connection errors (often happens locally with corporate VPNs or cert issues)
        if (typeof args[0] === 'string' && args[0].includes('Could not reach Cloud Firestore backend')) return;
        
        originalConsoleError(...args);
      };
    }
  }, []);

  return null;
}
