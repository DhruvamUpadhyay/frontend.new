"use client";
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * VisitorTracker — fires a single POST to /api/track on each page navigation.
 * Tracks: page path, referrer, screen size. The server adds IP, geo, UA, etc.
 * Renders nothing — pure side-effect component.
 */
export function VisitorTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<string>('');

  useEffect(() => {
    // Don't double-track the same page (React strict mode fires effects twice)
    if (pathname === lastTracked.current) return;
    lastTracked.current = pathname;

    // session-based debouncing to prevent database write spam
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const sessionKey = `tracked_${pathname}`;
      const lastTrackTime = sessionStorage.getItem(sessionKey);
      const now = Date.now();
      if (lastTrackTime && now - parseInt(lastTrackTime, 10) < 5 * 60 * 1000) {
        return;
      }
      sessionStorage.setItem(sessionKey, now.toString());
    }

    // Fire-and-forget — never block the UI
    const payload = {
      page: pathname,
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      screenWidth: typeof window !== 'undefined' ? window.innerWidth : 0,
      screenHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
    };

    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {
      // Silently ignore — tracking must never affect UX
    });
  }, [pathname]);

  return null;
}
