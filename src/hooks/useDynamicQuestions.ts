import * as React from 'react';
import { getQuestionPool, SUGGESTIONS_PER_VIEW, type Language } from '../config/suggestedQuestions';

type QuestionWithTags = {
  id: string;
  text: string;
  tags: string[];
};

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

type QuestionState = {
  current: QuestionWithTags[];
  remaining: QuestionWithTags[];
};

function getContextTags(context: string | undefined, lang: Language): Set<string> {
  const tags = new Set<string>();
  if (!context) return tags;

  const lower = context.toLowerCase();

  // Language-agnostic tags
  if (lower.includes('taiwan')) tags.add('taiwan');
  if (lower.includes('hong kong') || lower.includes('hongkong')) tags.add('hongkong');
  if (lower.includes('protest') || lower.includes('demonstratie') || lower.includes('demonstration')) tags.add('protest');
  if (lower.includes('familie') || lower.includes('family') || lower.includes('vriend') || lower.includes('friend')) tags.add('relaties');
  if (lower.includes('dag') || lower.includes('day') || lower.includes('dagelijks') || lower.includes('daily')) tags.add('dagelijks-leven');
  if (lower.includes('spijt') || lower.includes('regret') || lower.includes('had ik maar') || lower.includes('wish i')) tags.add('spijt');

  // Language-specific tags
  if (lang === 'nl') {
    if (lower.includes('veilig') || lower.includes('onveilig') || lower.includes('bang')) tags.add('veiligheid');
  } else {
    if (lower.includes('safe') || lower.includes('unsafe') || lower.includes('afraid') || lower.includes('fear')) tags.add('veiligheid');
  }

  return tags;
}

export function useDynamicQuestions(lang: Language) {
  const [state, setState] = React.useState<QuestionState>(() => {
    const pool = getQuestionPool(lang);
    const shuffled = shuffle(pool);
    const current = shuffled.slice(0, SUGGESTIONS_PER_VIEW);
    const remaining = shuffled.slice(SUGGESTIONS_PER_VIEW);
    return { current, remaining };
  });

  // Reset state when language changes
  React.useEffect(() => {
    const pool = getQuestionPool(lang);
    const shuffled = shuffle(pool);
    const current = shuffled.slice(0, SUGGESTIONS_PER_VIEW);
    const remaining = shuffled.slice(SUGGESTIONS_PER_VIEW);
    setState({ current, remaining });
  }, [lang]);

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
      const contextTags = getContextTags(context || usedQuestion, lang);

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
  }, [lang]);

  return {
    list: state.current.map((q) => q.text),
    next,
  };
}

