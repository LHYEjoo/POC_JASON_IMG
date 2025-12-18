import * as React from 'react';
import { QUESTION_POOL, SUGGESTIONS_PER_VIEW, type SuggestedQuestion } from '../config/suggestedQuestions';

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

type QuestionState = {
  current: SuggestedQuestion[];
  remaining: SuggestedQuestion[];
};

function getContextTags(context: string | undefined): Set<string> {
  const tags = new Set<string>();
  if (!context) return tags;

  const lower = context.toLowerCase();

  if (lower.includes('taiwan')) tags.add('taiwan');
  if (lower.includes('hong kong') || lower.includes('hongkong')) tags.add('hongkong');
  if (lower.includes('veilig') || lower.includes('onveilig') || lower.includes('bang')) tags.add('veiligheid');
  if (lower.includes('protest') || lower.includes('demonstratie') || lower.includes('demonstreren')) tags.add('protest');
  if (lower.includes('familie') || lower.includes('vriend')) tags.add('relaties');
  if (lower.includes('dag') || lower.includes('dagelijks')) tags.add('dagelijks-leven');
  if (lower.includes('spijt') || lower.includes('had ik maar')) tags.add('spijt');

  return tags;
}

export function useDynamicQuestions() {
  const [state, setState] = React.useState<QuestionState>(() => {
    const shuffled = shuffle(QUESTION_POOL);
    const current = shuffled.slice(0, SUGGESTIONS_PER_VIEW);
    const remaining = shuffled.slice(SUGGESTIONS_PER_VIEW);
    return { current, remaining };
  });

  const next = React.useCallback((usedQuestion: string, context?: string) => {
    setState((prev) => {
      // Find the used question in the current set
      const used = prev.current.find((q) => q.text === usedQuestion);
      if (!used) return prev;

      // Remove the used question from the current visible set
      const newCurrent = prev.current.filter((q) => q.text !== usedQuestion);
      const newRemaining = [...prev.remaining];

      if (newRemaining.length === 0) {
        return {
          current: newCurrent,
          remaining: newRemaining,
        };
      }

      // Determine which tags are relevant for the next question
      const contextTags = getContextTags(context || usedQuestion);

      // Prefer a remaining question that shares at least one tag with the context
      let replacementIndex = -1;
      if (contextTags.size > 0) {
        replacementIndex = newRemaining.findIndex((q) =>
          q.tags.some((tag) => contextTags.has(tag)),
        );
      }

      // Fallback: just take the first remaining question
      if (replacementIndex === -1) {
        replacementIndex = 0;
      }

      const [replacement] = newRemaining.splice(replacementIndex, 1);
      if (replacement) {
        newCurrent.push(replacement);
      }

      return {
        current: newCurrent,
        remaining: newRemaining,
      };
    });
  }, []);

  return {
    list: state.current.map((q) => q.text),
    next,
  };
}

