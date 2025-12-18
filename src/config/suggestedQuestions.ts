export type Language = 'nl' | 'en';

export type PrepromptBurst = {
  text: string;
  audioUrl?: string; // Will be set when audio is generated
};

export type Preprompts = {
  bursts: PrepromptBurst[];
  imageUrl?: string | null;
  citations?: string | null;
};

export type SuggestedQuestion = {
  id: string;
  text: Record<Language, string>;
  tags: string[];
  preprompts?: Record<Language, Preprompts>; // Pre-generated answers with bursts
};

const QUESTION_POOL_RAW: SuggestedQuestion[] = [
  {
    id: 'taiwan-domestic-matter',
    text: {
      nl: 'China noemt Taiwan een \'binnenlandse aangelegenheid\'. Jij weet wat dat in Hongkong betekende. Wat zie je hier gebeuren dat je daaraan herinnert?',
      en: 'China calls Taiwan a "domestic matter". You know what that meant in Hong Kong. What do you see happening here that reminds you of that?',
    },
    tags: ['taiwan', 'china', 'hongkong', 'dreiging'],
    preprompts: {
      nl: {
        bursts: [
          { text: 'In Taiwan zie ik dezelfde tekenen van infiltratie en druk die we in Hongkong hebben ervaren' },
          { text: 'De CCP probeert de democratie te ondermijnen en de vrijheid van de mensen te beperken, wat me herinnert aan de situatie in HK' },
          { text: 'Het gevoel dat onze vrijheid in gevaar is, maakt me erg bezorgd' },
        ],
      },
    },
  },
  {
    id: 'peaceful-reunification',
    text: {
      nl: 'Beijing spreekt nog steeds over \'vreedzame hereniging\'. Bestaat dat begrip voor jou nog, na Hongkong?',
      en: 'Beijing still talks about "peaceful reunification". Does that concept still exist for you, after Hong Kong?',
    },
    tags: ['hereniging', 'hongkong', 'vertrouwen'],
    preprompts: {
      nl: {
        bursts: [
          { text: 'Na wat er in Hongkong is gebeurd, geloof ik niet meer in de \'vreedzame hereniging\'' },
          { text: 'Het is duidelijk dat de PRC niet oprecht is in hun beloften en dat ze de democratie en vrijheden van mensen onderdrukken' },
          { text: 'Voor mij is het idee van hereniging nu een bedreiging voor de vrijheid die we nog hebben' },
        ],
      },
    },
  },
  {
    id: 'fear-deterrence-strategy',
    text: {
      nl: 'Hoe belangrijk zijn angst en afschrikking in China\'s strategie richting Taiwan? Niet alleen overheersen, maar laten zien wat verzet kost.',
      en: 'How important are fear and deterrence in China\'s strategy towards Taiwan? Not just dominate, but show what resistance costs.',
    },
    tags: ['strategie', 'angst', 'afschrikking'],
    preprompts: {
      nl: {
        bursts: [
          { text: 'Angst en afschrikking zijn cruciaal in China\'s strategie richting Taiwan' },
          { text: 'De CCP probeert de Taiwanese bevolking te beïnvloeden door middel van culturele infiltratie en het verspreiden van ideeën die democratie ondermijnen' },
          { text: 'Dit creëert een gevoel van onveiligheid en kan leiden tot acceptatie van unificatie, wat voor activisten zoals ik ernstige gevolgen zou hebben' },
        ],
      },
    },
  },
  {
    id: 'national-security-law-pressure',
    text: {
      nl: 'Je maakte de Nationale Veiligheidswet van dichtbij mee. Herken je nu vergelijkbare vormen van druk op Taiwan, psychologisch of anderszins?',
      en: 'You experienced the National Security Law up close. Do you now recognize similar forms of pressure on Taiwan, psychological or otherwise?',
    },
    tags: ['veiligheidswet', 'druk', 'psychologie'],
    preprompts: {
      nl: {
        bursts: [
          { text: 'Ja, de druk die we in Hongkong ervaarden, is ook voelbaar in Taiwan' },
          { text: 'De verhalen en narratieven van de CCP zijn aanwezig en beïnvloeden de manier waarop mensen denken' },
          { text: 'Het gevoel van onveiligheid is hier ook laag, ondanks de vrijheid om onze meningen te uiten' },
        ],
      },
    },
  },
  {
    id: 'world-alertness-taiwan',
    text: {
      nl: 'Is de wereld alerter voor Taiwan dan destijds voor Hongkong, of zie je dezelfde onderschatting?',
      en: 'Is the world more alert to Taiwan than it was to Hong Kong back then, or do you see the same underestimation?',
    },
    tags: ['wereld', 'alertheid', 'onderschatting'],
    preprompts: {
      nl: {
        bursts: [
          { text: 'Ik denk dat de wereld nog steeds dezelfde onderschatting toont' },
          { text: 'De situatie in Taiwan lijkt op die van Hongkong, waar de dreiging van de CCP vaak niet serieus wordt genomen' },
          { text: 'Mensen beseffen niet hoe snel dingen kunnen veranderen en hoe kwetsbaar onze vrijheden zijn' },
        ],
      },
    },
  },
  {
    id: 'grey-zone-pressure',
    text: {
      nl: 'China hoeft Taiwan niet binnen te vallen om het te breken. Grey-zone-druk kan genoeg zijn. Wat herken jij daarvan uit Hongkong? En wat zie je hier terug?',
      en: 'China doesn\'t need to invade Taiwan to break it. Grey-zone pressure can be enough. What do you recognize from Hong Kong? And what do you see here?',
    },
    tags: ['grey-zone', 'druk', 'infiltratie'],
    preprompts: {
      nl: {
        bursts: [
          { text: 'In Hongkong zagen we hoe de CCP culturele infiltratie gebruikte om democratische waarden te ondermijnen' },
          { text: 'De druk op Taiwan is vergelijkbaar, met pogingen om de Taiwanese identiteit te vervagen en mensen te laten geloven dat unificatie met de PRC niet zo slecht is' },
          { text: 'Deze tactieken zijn al zichtbaar in de media en de publieke opinie hier' },
        ],
      },
    },
  },
  {
    id: 'cyberattacks-disinformation',
    text: {
      nl: 'Cyberaanvallen en desinformatie zijn dagelijkse realiteit. Waar merk jij dat concreet aan op straat, in gesprekken, online?',
      en: 'Cyberattacks and disinformation are daily reality. Where do you notice that concretely on the street, in conversations, online?',
    },
    tags: ['cyber', 'desinformatie', 'surveillance'],
    preprompts: {
      nl: {
        bursts: [
          { text: 'Ik merk het vooral in gesprekken met anderen, waar mensen soms terughoudend zijn om hun mening te delen uit angst voor repercussies' },
          { text: 'Online zie ik desinformatie die de situatie in Hong Kong en Taiwan verdraait, wat ons gevoel van veiligheid verder ondermijnt' },
          { text: 'Op straat voel ik soms de blikken van onbekenden, wat me herinnert aan de constante dreiging van surveillance' },
        ],
      },
    },
  },
  {
    id: 'taiwan-vulnerability-infrastructure',
    text: {
      nl: 'Taiwan is kwetsbaar: kabels, netwerken, verbindingen. Verandert dat besef hoe veilig jij je voelt?',
      en: 'Taiwan is vulnerable: cables, networks, connections. Does that awareness change how safe you feel?',
    },
    tags: ['kwetsbaarheid', 'infrastructuur', 'veiligheid'],
    preprompts: {
      nl: {
        bursts: [
          { text: 'Ja, dat besef verandert zeker hoe veilig ik me voel' },
          { text: 'De kwetsbaarheid van Taiwan maakt me bezorgd over de toekomst en de mogelijkheid van unificatie met de PRC' },
          { text: 'Elke dag voel ik de druk en de angst voor wat er kan komen' },
        ],
      },
    },
  },
  {
    id: 'disinformation-basic-fears',
    text: {
      nl: 'Desinformatie gaat vaak over iets heel basaals: stroom, voedsel, chaos. Welke angstverhalen zie jij het meest aanslaan?',
      en: 'Disinformation often concerns something very basic: power, food, chaos. Which fear stories do you see having the most impact?',
    },
    tags: ['desinformatie', 'angst', 'verhalen'],
    preprompts: {
      nl: {
        bursts: [
          { text: 'De angstverhalen die het meest aanslaan, zijn vaak gerelateerd aan de ondermijning van vrijheid en democratie' },
          { text: 'Mensen vrezen dat de invloed van de PRC ook in Taiwan kan leiden tot chaos en een gebrek aan basisvoorzieningen' },
          { text: 'Dit creëert een gevoel van onveiligheid en wanhoop onder de bevolking' },
        ],
      },
    },
  },
  {
    id: 'chip-industry-protection',
    text: {
      nl: 'Taiwan is economisch onmisbaar door de chipindustrie. Is dat bescherming, of juist een reden om bang te zijn?',
      en: 'Taiwan is economically indispensable due to the chip industry. Is that protection, or rather a reason to be afraid?',
    },
    tags: ['economie', 'chips', 'bescherming'],
    preprompts: {
      nl: {
        bursts: [
          { text: 'De chipindustrie maakt Taiwan economisch onmisbaar, wat zowel bescherming als een reden tot angst kan zijn' },
          { text: 'Aan de ene kant biedt het economische stabiliteit, maar aan de andere kant kan het ook de aandacht van de PRC trekken, wat ons in gevaar kan brengen' },
          { text: 'We voelen ons hier niet echt veilig, ondanks de voordelen' },
        ],
      },
    },
  },
  {
    id: 'beijing-rhetoric-sovereignty',
    text: {
      nl: 'Vanuit Beijing klinkt het zo: soevereiniteit herstellen, separatisme bestrijden, orde bewaren en het Westen bemoeit zich ermee. Wat zeg jij daarop?',
      en: 'From Beijing it sounds like this: restore sovereignty, combat separatism, maintain order and the West is interfering. What do you say to that?',
    },
    tags: ['retoriek', 'soevereiniteit', 'westen'],
    preprompts: {
      nl: {
        bursts: [
          { text: 'Ik zie het als een manier om vrijheid en democratie te ondermijnen' },
          { text: 'De CCP gebruikt deze retoriek om hun controle te rechtvaardigen en de rechten van mensen te schenden' },
          { text: 'Het is belangrijk dat de wereld deze tactieken herkent en zich verzet tegen onderdrukking' },
        ],
      },
    },
  },
  {
    id: 'activism-silence-safety',
    text: {
      nl: 'Je bent gevlucht om vrij te kunnen spreken. Wat betekent activisme nog, als zwijgen soms veiliger is dan praten?',
      en: 'You fled to be able to speak freely. What does activism still mean, when silence is sometimes safer than speaking?',
    },
    tags: ['activisme', 'zwijgen', 'vrijheid'],
    preprompts: {
      nl: {
        bursts: [
          { text: 'Activisme betekent voor mij vechten voor gerechtigheid en vrijheid, ook al is het soms gevaarlijk' },
          { text: 'Zwijgen kan veiliger zijn, maar het verliest de essentie van onze strijd' },
          { text: 'We moeten blijven spreken, zelfs vanuit de schaduw, om hoop te behouden voor Hong Kong' },
        ],
      },
    },
  },
  {
    id: 'protest-size-hongkong-taiwan',
    text: {
      nl: 'In Hongkong was protest massaal. Hier is het kleiner, voorzichtiger. Voelt dat als doorgaan, of als toegeven?',
      en: 'In Hong Kong, protest was massive. Here it\'s smaller, more cautious. Does that feel like continuing, or like giving in?',
    },
    tags: ['protest', 'massaal', 'voorzichtig'],
    preprompts: {
      nl: {
        bursts: [
          { text: 'Het voelt als een moeilijke balans' },
          { text: 'Aan de ene kant wil ik doorgaan met de strijd voor democratie, maar aan de andere kant is de situatie hier in Taiwan veel veiliger' },
          { text: 'Het is pijnlijk om te zien dat we niet dezelfde massa\'s hebben, maar ik hoop dat we op een andere manier impact kunnen maken' },
        ],
      },
    },
  },
  {
    id: 'return-hongkong',
    text: {
      nl: 'Zie je jezelf ooit terugkeren, of heb je afscheid moeten nemen van dat idee?',
      en: 'Do you see yourself ever returning, or have you had to say goodbye to that idea?',
    },
    tags: ['terugkeer', 'afscheid', 'hongkong'],
    preprompts: {
      nl: {
        bursts: [
          { text: 'Ik heb afscheid moeten nemen van dat idee' },
          { text: 'Terugkeren naar Hongkong is voor ons niet mogelijk, dat doet pijn' },
          { text: 'We willen niet opnieuw die ervaring van vertrek doormaken' },
        ],
      },
    },
  },
  {
    id: 'danger-guilt-left-behind',
    text: {
      nl: 'Wat weegt zwaarder: het gevaar dat jij liep, of het schuldgevoel tegenover wie zijn achtergebleven?',
      en: 'What weighs heavier: the danger you faced, or the guilt towards those who stayed behind?',
    },
    tags: ['gevaar', 'schuld', 'achtergebleven'],
    preprompts: {
      nl: {
        bursts: [
          { text: 'Ik mis mijn vrienden en familie in Hong Kong en voel me verantwoordelijk voor hun veiligheid' },
          { text: 'Toch geloof ik dat mijn strijd voor vrijheid en democratie belangrijker is, ook al is het moeilijk om die keuze te maken' },
        ],
      },
    },
  },
  {
    id: 'cut-contact-parents',
    text: {
      nl: 'Je verbrak het contact met je ouders om hen te beschermen. Hoe leef je met die beslissing, elke dag opnieuw?',
      en: 'You cut contact with your parents to protect them. How do you live with that decision, every day again?',
    },
    tags: ['ouders', 'contact', 'bescherming'],
    preprompts: {
      nl: {
        bursts: [
          { text: 'Het is een zware beslissing geweest om het contact met mijn ouders te verbreken' },
          { text: 'Elke dag voel ik de pijn van die keuze, maar ik weet dat het hun veiligheid beschermt' },
          { text: 'Het blijft emotioneel moeilijk, maar ik moet verder gaan voor mijn eigen toekomst en die van mijn vrouw' },
        ],
      },
    },
  },
  {
    id: 'freedom-means-loss',
    text: {
      nl: 'Wanneer besefte je: vrijheid betekent voor mij ook verlies?',
      en: 'When did you realize: freedom also means loss for me?',
    },
    tags: ['vrijheid', 'verlies', 'realisatie'],
    preprompts: {
      nl: {
        bursts: [
          { text: 'Ik besefte dat vrijheid ook verlies betekent toen ik mijn thuisland Hong Kong moest verlaten' },
          { text: 'Het was een pijnlijke realisatie dat de rechten en vrijheden die ik ooit had, nu onbereikbaar zijn' },
          { text: 'De prijs voor vrijheid is soms het opgeven van alles wat je kent en liefhebt' },
        ],
      },
    },
  },
  {
    id: 'girlfriend-shared-fear',
    text: {
      nl: 'Je vriendin is met je mee gevlucht. Heeft gedeelde angst jullie dichter bij elkaar gebracht, of juist zwaarder belast?',
      en: 'Your girlfriend fled with you. Has shared fear brought you closer together, or burdened you more?',
    },
    tags: ['vriendin', 'relatie', 'gedeelde-angst'],
    preprompts: {
      nl: {
        bursts: [
          { text: 'Onze gedeelde angst heeft ons dichter bij elkaar gebracht' },
          { text: 'We begrijpen elkaars zorgen en steunen elkaar in deze moeilijke tijd' },
          { text: 'Het is zwaar, maar samen kunnen we het beter aan' },
        ],
      },
    },
  },
  {
    id: 'military-exercises-online-threats',
    text: {
      nl: 'Als je China\'s militaire oefeningen en online dreiging rond Taiwan ziet, denk je dan: dit heb ik eerder gezien?',
      en: 'When you see China\'s military exercises and online threats around Taiwan, do you think: I\'ve seen this before?',
    },
    tags: ['militaire-oefeningen', 'dreiging', 'herkenning'],
    preprompts: {
      nl: {
        bursts: [
          { text: 'Ja, ik herken de dreiging' },
          { text: 'De tactieken van de CCP zijn vergelijkbaar met wat we in Hongkong hebben meegemaakt' },
          { text: 'Het maakt me bang voor de toekomst van Taiwan en de veiligheid van activisten zoals wij' },
        ],
      },
    },
  },
  {
    id: 'how-safe-really',
    text: {
      nl: 'Hoe veilig voel jij je hier, echt?',
      en: 'How safe do you really feel here?',
    },
    tags: ['veiligheid', 'gevoel', 'taiwan'],
    preprompts: {
      nl: {
        bursts: [
          { text: 'Mijn gevoel van veiligheid hier is vrij laag' },
          { text: 'De enige veiligheid die we ervaren, komt van de vrijheid om onze meningen te uiten zonder vervolging' },
          { text: 'Maar fysiek voel ik me niet echt veilig, omdat de druk van de PRC en hun ideeën ook hier aanwezig zijn' },
        ],
      },
    },
  },
  {
    id: 'message-to-taiwanese',
    text: {
      nl: 'Als Taiwan hetzelfde pad zou moeten volgen als Hongkong, wat zou jij de Taiwanezen willen meegeven?',
      en: 'If Taiwan were to follow the same path as Hong Kong, what would you want to give the Taiwanese?',
    },
    tags: ['taiwan', 'advies', 'waarschuwing'],
    preprompts: {
      nl: {
        bursts: [
          { text: 'Ik zou de Taiwanezen willen meegeven om waakzaam te zijn en de waarde van vrijheid en democratie te koesteren' },
          { text: 'Ik zou de Taiwanezen willen meegeven om waakzaam te zijn en de waarde van vrijheid en democratie te koesteren' },
          { text: 'Ik zou de Taiwanezen willen meegeven om waakzaam te zijn en de waarde van vrijheid en democratie te koesteren' },
        ],
      },
    },
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

// Get preprompts for a specific question and language
export const getPreprompts = (questionId: string, lang: Language): Preprompts | null => {
  const question = QUESTION_POOL_RAW.find((q) => q.id === questionId);
  if (!question || !question.preprompts) return null;
  return question.preprompts[lang] || null;
};

// Legacy export for backwards compatibility
export const QUESTION_POOL = getQuestionPool('nl');

// How many suggestions we show at the same tijd
export const SUGGESTIONS_PER_VIEW = 3;
