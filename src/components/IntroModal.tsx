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
                 Dit project bij VPRO Medialab onderzoekt hoe AI kan helpen om verhalen van mensen die niet veilig herkenbaar kunnen spreken toch geloofwaardig en invoelbaar te vertellen. De meerwaarde zit in een digital shadow: een AI-gestuurde stem en representatie die anonimiteit combineert met emotionele impact en transparantie. In plaats van een statisch verhaal kunnen gebruikers in gesprek gaan en context verdiepen. Op dit moment is er een werkend proof-of-concept in de vorm van een mobiele applicatie, onderbouwd met onderzoek naar AI-stemmen, gebruikerservaring en ethische kaders, waarmee VPRO Medialab de journalistieke haalbaarheid kan toetsen.
                </>
              ) : (
                <>
                  This project at VPRO Medialab explores how AI can be used to tell the stories of people who cannot safely speak in public in a credible and emotionally engaging way. Its value lies in the concept of a digital shadow: an AI-driven voice and representation that combines anonymity with empathy and transparency. Instead of a static story, users can engage in an interactive conversation and explore deeper context. At present, the project exists as a working proof of concept in the form of a mobile application, supported by research into AI voices, user experience, and ethical frameworks, allowing VPRO Medialab to assess its journalistic viability.
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
            {/* Continue button */}
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  'px-8 py-3 rounded-full font-medium text-white',
                  'bg-primary hover:bg-primary/90 transition-colors',
                  'shadow-lg hover:shadow-xl',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
                )}
              >
                {language === 'nl' ? 'Doorgaan' : 'Continue'}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default IntroModal;
