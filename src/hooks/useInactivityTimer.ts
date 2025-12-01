import * as React from 'react';

export function useInactivityTimer(onTimeout: () => void) {
  const ref = React.useRef<number | null>(null);
  const start = React.useCallback((ms: number) => {
    if (ref.current) window.clearTimeout(ref.current);
    ref.current = window.setTimeout(onTimeout, ms);
  }, [onTimeout]);
  const cancel = React.useCallback(() => {
    if (ref.current) window.clearTimeout(ref.current);
    ref.current = null;
  }, []);
  return { start, cancel };
}

