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
      <div className="mb-2 sm:mb-3 font-bold text-center text-base sm:text-xl md:text-2xl">Suggesties...</div>
      {/* Mobile: horizontal scroll, Desktop: grid */}
      <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4 overflow-x-auto sm:overflow-x-visible pb-2 sm:pb-0 -mx-2 sm:mx-0 px-2 sm:px-0 scrollbar-hide">
        {list.map((t, index) => {
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
              className="text-center rounded-[16px] px-3 py-2 sm:px-4 sm:py-3 md:py-4 bg-[#00ABFE] text-black shadow-vpro hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-black text-xs sm:text-sm md:text-base whitespace-nowrap sm:whitespace-normal shrink-0 sm:shrink"
            >
              {t}
            </button>
          );
        })}
      </div>
    </div>
  );
}

