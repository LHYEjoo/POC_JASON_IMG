import * as React from 'react';

type Language = 'nl' | 'en';

interface Props {
  language?: Language;
}

export default function DisclaimerInline({ language = 'nl' }: Props) {
  const text = language === 'en' 
    ? 'You are talking with Henry, an AI character based on a true story. Henry himself is a digital representation to share the story safely.'
    : 'Je praat met Henry, een AI-personage gebaseerd op een waargebeurd verhaal. Henry zelf is een digitale representatie om het verhaal veilig te delen.';

  return (
    <div className="mt-8 mb-10 flex justify-center">
      <p
        className="w-2/3 text-sm font-medium text-center px-4 py-3 rounded"
        style={{ 
          fontFamily: 'Simplistic Sans',
          backgroundColor: '#FF0000',
          color: '#FFFFFF'
        }}
      >
        {text}
      </p>
    </div>
  );
}

