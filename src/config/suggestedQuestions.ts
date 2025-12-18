export type Language = 'nl' | 'en';

export type SuggestedQuestion = {
  id: string;
  text: Record<Language, string>;
  tags: string[];
};

const QUESTION_POOL_RAW: SuggestedQuestion[] = [
  // Original 3 questions (kept first so behaviour stays familiar)
  {
    id: 'protest-risk',
    text: {
      nl: 'Wat was de grootste risico die je nam tijdens de protesten en de gevolgen ervan? Hoe ben je ermee omgegaan?',
      en: 'What was the biggest risk you took during the protests and its consequences? How did you handle it?',
    },
    tags: ['protest', 'risico', 'veiligheid'],
  },
  {
    id: 'meaning-of-safety-today',
    text: {
      nl: 'Wat betekent veiligheid voor jou vandaag, en hoe verschilt het van vroeger?',
      en: 'What does safety mean to you today, and how does it differ from before?',
    },
    tags: ['veiligheid', 'gevoel', 'emotie'],
  },
  {
    id: 'worth-it-to-protest',
    text: {
      nl: 'Was het de moeite waard om te protesteren, ook al betekende dit dat je je eigen land moest verlaten?',
      en: 'Was it worth it to protest, even though it meant you had to leave your own country?',
    },
    tags: ['protest', 'spijt', 'vlucht'],
  },

  // Extra variations so the suggestions can rotate
  {
    id: 'miss-hongkong-most',
    text: {
      nl: 'Wat mis je het meest aan Hongkong sinds je vertrek?',
      en: 'What do you miss most about Hong Kong since you left?',
    },
    tags: ['hongkong', 'heimwee'],
  },
  {
    id: 'memory-2019-strongest',
    text: {
      nl: 'Welke herinnering uit 2019 blijft het sterkst in je hoofd hangen?',
      en: 'Which memory from 2019 stays strongest in your mind?',
    },
    tags: ['herinnering', 'protest', 'hongkong'],
  },
  {
    id: 'decision-to-flee-taiwan',
    text: {
      nl: 'Hoe voelde het moment waarop je definitief besloot te vluchten naar Taiwan?',
      en: 'How did it feel the moment you definitively decided to flee to Taiwan?',
    },
    tags: ['taiwan', 'vlucht', 'emotie'],
  },
  {
    id: 'impact-on-relations',
    text: {
      nl: 'Wat heeft het zwaarst gewogen op je relaties met vrienden of familie door je vlucht?',
      en: 'What weighed most heavily on your relationships with friends or family because of your flight?',
    },
    tags: ['relaties', 'familie', 'vlucht'],
  },
  {
    id: 'normal-day-taiwan',
    text: {
      nl: 'Hoe ziet een "normale" dag er nu voor je uit in Taiwan vergeleken met vroeger in Hongkong?',
      en: 'What does a "normal" day look like for you now in Taiwan compared to before in Hong Kong?',
    },
    tags: ['taiwan', 'hongkong', 'dagelijks-leven'],
  },
  {
    id: 'feel-unsafe-when',
    text: {
      nl: 'Wanneer voel je je hier het meest onveilig, en waarom?',
      en: 'When do you feel most unsafe here, and why?',
    },
    tags: ['veiligheid', 'angst'],
  },
  {
    id: 'younger-self-advice',
    text: {
      nl: 'Wat zou je tegen je jongere zelf zeggen die nog midden in de protesten stond?',
      en: 'What would you say to your younger self who was still in the middle of the protests?',
    },
    tags: ['protest', 'reflectie'],
  },
];

// Convert to format expected by useDynamicQuestions (with text as string based on language)
export const getQuestionPool = (lang: Language): Array<{ id: string; text: string; tags: string[] }> => {
  return QUESTION_POOL_RAW.map((q) => ({
    id: q.id,
    text: q.text[lang],
    tags: q.tags,
  }));
};

// Legacy export for backwards compatibility
export const QUESTION_POOL = getQuestionPool('nl');

// How many suggestions we show at the same tijd
export const SUGGESTIONS_PER_VIEW = 3;

