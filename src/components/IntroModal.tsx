import * as React from 'react';
import { cn } from '../utils/cn';
import { type Language } from '../config/prompt';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export function IntroModal({ isOpen, onClose, language }: Props) {
  const modalRef = React.useRef<HTMLDivElement>(null);

  // Close on escape key
  React.useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Close on click outside
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };


  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(2px)',
      }}
    >
      <div
        ref={modalRef}
        className={cn(
          'bg-white rounded-[24px] shadow-vpro max-w-3xl w-full max-h-[90vh]',
          'flex flex-col overflow-hidden'
        )}
        style={{
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900">
            {language === 'nl' ? 'Introductie' : 'Introduction'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-red-50 rounded-full transition-colors"
            aria-label={language === 'nl' ? 'Sluiten' : 'Close'}
          >
            <svg
              className="w-6 h-6 text-red-500"
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
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Introduction text */}
          <section className="mb-6">
            <p className="text-base text-gray-700 leading-relaxed mb-4">
              {language === 'nl' ? (
                <>
                  Dit is een <strong>prototype</strong> van een interactieve chat-ervaring waarbij je in gesprek kunt gaan met Henry, een AI-personage gebaseerd op een waargebeurd verhaal, en een echt persoon. Het prototype maakt gebruik van spraakherkenning, kunstmatige intelligentie en tekst-naar-spraak technologie om een natuurlijk gesprek te simuleren. (probeert ie dan he)
                </>
              ) : (
                <>
                  This is a <strong>prototype</strong> of an interactive chat experience where you can have a conversation with Henry, an AI character based on a true story. The prototype uses speech recognition, artificial intelligence, and text-to-speech technology to simulate a natural conversation.
                </>
              )}
            </p>
            <p className="text-base text-gray-700 leading-relaxed">
              {language === 'nl' ? (
                <>
                  <strong>Let op:</strong> Dit is een experimenteel prototype in ontwikkeling. De functionaliteit en antwoorden kunnen variëren en zijn niet definitief.
                </>
              ) : (
                <>
                  <strong>Note:</strong> This is an experimental prototype in development. Functionality and responses may vary and are not final.
                </>
              )}
            </p>
          </section>

          {/* Video */}
          <section>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              {language === 'nl' ? 'Video' : 'Video'}
            </h3>
            <div className="relative w-full rounded-[16px] overflow-hidden bg-black" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src="https://www.youtube.com/embed/-hJv8A1WG5Q"
                title={language === 'nl' ? 'Ruben langs de Zuid-Chinese Zee' : 'Ruben langs de Zuid-Chinese Zee'}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default IntroModal;
