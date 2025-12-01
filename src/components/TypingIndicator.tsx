import * as React from 'react';

// Three-dot typing animation in header blue
export default function TypingIndicator() {
  return (
    <div className="inline-flex items-center gap-2 rounded-[16px] bg-wolf px-3 py-2 shadow-vpro" aria-live="polite">
      <span className="inline-block h-2.5 w-2.5 rounded-full bg-gray-500 animate-pulse"></span>
      <span className="inline-block h-2.5 w-2.5 rounded-full bg-gray-500 animate-pulse [animation-delay:120ms]"></span>
      <span className="inline-block h-2.5 w-2.5 rounded-full bg-gray-500 animate-pulse [animation-delay:240ms]"></span>
    </div>
  );
}

