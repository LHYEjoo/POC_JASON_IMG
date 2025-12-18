export type SuggestedQuestion = {
  id: string;
  text: string;
  tags: string[];
};

export const QUESTION_POOL: SuggestedQuestion[] = [
  // Original 3 questions (kept first so behaviour stays familiar)
  {
    id: 'protest-risk',
    text: 'Wat was de grootste risico die je nam tijdens de protesten en de gevolgen ervan? Hoe ben je ermee omgegaan?',
    tags: ['protest', 'risico', 'veiligheid'],
  },
  {
    id: 'meaning-of-safety-today',
    text: 'Wat betekent veiligheid voor jou vandaag, en hoe verschilt het van vroeger?',
    tags: ['veiligheid', 'gevoel', 'emotie'],
  },
  {
    id: 'worth-it-to-protest',
    text: 'Was het de moeite waard om te protesteren, ook al betekende dit dat je je eigen land moest verlaten?',
    tags: ['protest', 'spijt', 'vlucht'],
  },

  // Extra variations so the suggestions can rotate
  {
    id: 'miss-hongkong-most',
    text: 'Wat mis je het meest aan Hongkong sinds je vertrek?',
    tags: ['hongkong', 'heimwee'],
  },
  {
    id: 'memory-2019-strongest',
    text: 'Welke herinnering uit 2019 blijft het sterkst in je hoofd hangen?',
    tags: ['herinnering', 'protest', 'hongkong'],
  },
  {
    id: 'decision-to-flee-taiwan',
    text: 'Hoe voelde het moment waarop je definitief besloot te vluchten naar Taiwan?',
    tags: ['taiwan', 'vlucht', 'emotie'],
  },
  {
    id: 'impact-on-relations',
    text: 'Wat heeft het zwaarst gewogen op je relaties met vrienden of familie door je vlucht?',
    tags: ['relaties', 'familie', 'vlucht'],
  },
  {
    id: 'normal-day-taiwan',
    text: 'Hoe ziet een “normale” dag er nu voor je uit in Taiwan vergeleken met vroeger in Hongkong?',
    tags: ['taiwan', 'hongkong', 'dagelijks-leven'],
  },
  {
    id: 'feel-unsafe-when',
    text: 'Wanneer voel je je hier het meest onveilig, en waarom?',
    tags: ['veiligheid', 'angst'],
  },
  {
    id: 'younger-self-advice',
    text: 'Wat zou je tegen je jongere zelf zeggen die nog midden in de protesten stond?',
    tags: ['protest', 'reflectie'],
  },
];

// How many suggestions we show at the same tijd
export const SUGGESTIONS_PER_VIEW = 3;

