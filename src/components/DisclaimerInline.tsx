import * as React from 'react';

export default function DisclaimerInline() {
  return (
    <div className="mt-8 mb-10 flex justify-center">
      <p
        className="w-2/3 text-sm font-medium text-[var(--color-text)] text-center"
        style={{ fontFamily: 'Simplistic Sans' }}
      >
        Je praat met Henry, een AI-personage gebaseerd op een waargebeurd verhaal. Henry zelf is een digitale representatie om het verhaal veilig te delen.
      </p>
    </div>
  );
}

