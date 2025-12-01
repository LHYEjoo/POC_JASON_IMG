import * as React from 'react';

export default function SuggestedPrompts({ list, onSelect }: { list: string[]; onSelect: (t: string) => void }) {
  return (
    <div className="w-full">
      <div className="mb-3 font-bold text-center text-xl sm:text-2xl md:text-3xl">Suggestions...</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {list.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onSelect(t)}
            className="text-center rounded-[16px] px-3 py-3 sm:px-4 sm:py-4 bg-[#00ABFE] text-black shadow-vpro hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-black text-sm sm:text-base"
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}

