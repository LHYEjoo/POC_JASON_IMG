import * as React from 'react';

type Question = {
  id: string;
  text: string;
  tags: string[];
};

export default function SuggestedPrompts({ 
  list, 
  questions,
  onSelect 
}: { 
  list: string[]; 
  questions?: Question[];
  onSelect: (text: string, questionId?: string) => void;
}) {
  return (
    <div className="w-full">
      <div className="mb-3 font-bold text-center text-xl sm:text-2xl md:text-3xl">Suggesties...</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {list.map((t, index) => {
          const question = questions?.[index];
          return (
            <button
              key={t}
              type="button"
              onClick={() => onSelect(t, question?.id)}
              className="text-center rounded-[16px] px-3 py-3 sm:px-4 sm:py-4 bg-[#00ABFE] text-black shadow-vpro hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-black text-sm sm:text-base"
            >
              {t}
            </button>
          );
        })}
      </div>
    </div>
  );
}

