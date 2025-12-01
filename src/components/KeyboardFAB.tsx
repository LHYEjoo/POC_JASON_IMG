import * as React from 'react';

export default function KeyboardFAB({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-12 w-12 rounded-[16px] bg-white shadow-lg border border-gray-200 flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00ABFE]"
      aria-label="Toetsenbord"
      title="Toetsenbord"
    >
      {/* Try multiple approaches for keyboard icon */}
      <img 
        src="/icons/keyboard.webp" 
        alt="Toetsenbord" 
        className="h-6 w-6"
        onError={(e) => {
          // Fallback to emoji if image fails
          e.currentTarget.style.display = 'none';
          if (e.currentTarget.nextElementSibling) {
            (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block';
          }
        }}
      />
      <span className="h-6 w-6 text-lg hidden">⌨️</span>
    </button>
  );
}



