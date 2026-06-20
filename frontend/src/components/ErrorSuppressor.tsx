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
        originalConsoleError(...args);
      };
    }
  }, []);

  return null;
}
