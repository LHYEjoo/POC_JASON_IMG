import * as React from 'react';
import { cn } from '../utils/cn';
import { useIsMobile } from '../hooks/useIsMobile';

type Question = {
  id: string;
  text: string;
  tags: string[];
};

export default function SuggestedPrompts({ 
  list, 
  questions,
  onSelect,
  onClose
}: { 
  list: string[]; 
  questions?: Question[];
  onSelect: (text: string, questionId?: string) => void;
  onClose?: () => void;
}) {
  const isMobile = useIsMobile();
  // Mobile: show only first 2, Desktop: show all
  const displayList = isMobile ? list.slice(0, 2) : list;

  return (
    <div className="w-full relative">
      {/* Close button - only on mobile */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="sm:hidden absolute top-0 right-0 z-10 h-6 w-6 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          aria-label="Sluit suggesties"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
      
      <div className="mb-2 sm:mb-3 font-bold text-center text-base sm:text-xl md:text-2xl">Suggesties...</div>
      
      {/* Mobile: vertical scroll with 2 items, Desktop: grid */}
      <div className="flex flex-col sm:grid sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4 overflow-y-auto sm:overflow-y-visible sm:overflow-x-visible max-h-[120px] sm:max-h-none scrollbar-hide">
        {displayList.map((t, index) => {
          // Try to find question by index first, then by text match as fallback
          let question = questions?.[index];
          if (!question && questions) {
            question = questions.find((q) => q.text === t);
          }
          // Final fallback: if still not found, log warning
          if (!question) {
            // eslint-disable-next-line no-console
            console.warn('[SuggestedPrompts] Question not found for text:', t, 'at index:', index, 'available questions:', questions?.map(q => ({ id: q.id, text: q.text })));
          }
          return (
            <button
              key={t}
              type="button"
              onClick={() => {
                // Use full question text from questions array, not truncated display text
                const fullText = question?.text || t;
                // eslint-disable-next-line no-console
                console.log('[SuggestedPrompts] Button clicked:', { 
                  displayText: t,
                  fullText: fullText,
                  questionId: question?.id, 
                  hasQuestion: !!question,
                  hasQuestions: !!questions, 
                  questionsLength: questions?.length, 
                  listLength: list.length,
                  index,
                  questionAtIndex: questions?.[index]?.id,
                  allQuestionIds: questions?.map(q => q.id)
                });
                if (!question?.id) {
                  // eslint-disable-next-line no-console
                  console.error('[SuggestedPrompts] WARNING: questionId is undefined!', { text: t, question, questions });
                }
                // Pass full question text, not truncated display text
                onSelect(fullText, question?.id);
              }}
              className={cn(
                "text-center rounded-[16px] px-3 py-2 sm:px-4 sm:py-3 md:py-4 bg-[#00ABFE] text-black shadow-vpro hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-black text-xs sm:text-sm md:text-base",
                "sm:whitespace-normal",
                // Mobile: full width, no shrink
                "w-full sm:w-auto shrink-0"
              )}
            >
              {t}
            </button>
          );
        })}
      </div>
    </div>
  );
}

