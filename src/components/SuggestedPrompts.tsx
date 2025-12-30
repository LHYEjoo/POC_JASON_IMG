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
                // eslint-disable-next-line no-console
                console.log('[SuggestedPrompts] Button clicked:', { 
                  text: t, 
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
                onSelect(t, question?.id);
              }}
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

