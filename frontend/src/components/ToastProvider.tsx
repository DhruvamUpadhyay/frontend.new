"use client";
import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#1D1A39',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)',
          borderRadius: '12px',
        },
        success: {
          iconTheme: {
            primary: '#F59F59',
            secondary: '#1D1A39',
          },
        },
      }}
    />
  );
}
