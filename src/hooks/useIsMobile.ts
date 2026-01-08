import { useState, useEffect } from 'react';

/**
 * Hook that returns true if the viewport is mobile-sized (<= 640px)
 * Uses CSS media query for reliable, performant detection
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    // SSR-safe initial value
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 640px)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 640px)');
    
    // Set initial value
    setIsMobile(mediaQuery.matches);

    // Listen for changes
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return isMobile;
}



