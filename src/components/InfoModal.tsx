import * as React from 'react';
import DisclaimerInline from './DisclaimerInline';
import { cn } from '../utils/cn';
import { type Language } from '../config/prompt';

interface Source {
  documentId: string;
  title: string;
  sourceId: string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  sources: Source[];
}

export function InfoModal({ isOpen, onClose, language, sources }: Props) {
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
          'bg-white rounded-[24px] shadow-vpro max-w-2xl w-full max-h-[90vh]',
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
            {language === 'nl' ? 'Informatie' : 'Information'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label={language === 'nl' ? 'Sluit info' : 'Close info'}
          >
            <svg
              className="w-6 h-6 text-gray-600"
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          {/* AI Disclaimer */}
          <section>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              {language === 'nl' ? 'AI-disclaimer' : 'AI disclaimer'}
            </h3>
            <DisclaimerInline language={language} />
          </section>

          {/* Sources */}
          <section>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {language === 'nl' ? 'Bronnen' : 'Sources'}
            </h3>
            <ul className="space-y-3 text-sm text-gray-700">
              {/* Predefined sources (moved from settings) */}
              <li>
                <span className="font-medium">
                  {language === 'nl' ? 'Bron 1:' : 'Source 1:'}
                </span>{' '}
                <a
                  href="https://hongkongfp.com/2020/07/24/hong-kong-newlyweds-acquitted-of-rioting-charges/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00ABFE] hover:underline"
                >
                  Hong Kong newlyweds acquitted of rioting charges (HKFP)
                </a>
              </li>
              <li>
                <span className="font-medium">
                  {language === 'nl' ? 'Bron 2:' : 'Source 2:'}
                </span>{' '}
                <a
                  href="https://hongkongfp.com/2019/08/04/not-even-nuclear-explosion-set-us-apart-hong-kong-couple-wed-days-charged-rioting/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00ABFE] hover:underline"
                >
                  Henry and Elaine marriage (HKFP)
                </a>
              </li>
              <li>
                <span className="font-medium">
                  {language === 'nl' ? 'Bron 3:' : 'Source 3:'}
                </span>{' '}
                {language === 'nl'
                  ? 'Video interview met Henry (niet toegankelijk voor gebruikers)'
                  : 'Video interview with Henry (not accessible for users)'}
              </li>
              <li>
                <span className="font-medium">
                  {language === 'nl' ? 'Bron 4:' : 'Source 4:'}
                </span>{' '}
                {language === 'nl'
                  ? 'Interview met Henry (niet toegankelijk voor gebruikers)'
                  : 'Interview with Henry (not accessible for users)'}
              </li>

              {/* Additional dynamic sources */}
              {sources.length > 0 &&
                sources.map((source, index) => (
                  <li key={source.documentId}>
                    <span className="font-medium">
                      {language === 'nl'
                        ? `Bron ${index + 5}:`
                        : `Source ${index + 5}:`}
                    </span>{' '}
                    {source.title}
                  </li>
                ))}
            </ul>
          </section>

          {/* Ruben series link */}
          <section>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {language === 'nl' ? 'Prototype' : 'Prototype'}
            </h3>
            <p className="text-sm text-gray-700 mb-3">
              <a
                href="https://www.vpro.nl/ruben-langs-de-zuid-chinese-zee"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00ABFE] hover:underline font-medium"
              >
                prototype for Ruben langs de zuid chinese zee series
              </a>
            </p>
            <p className="text-sm text-gray-700 space-y-2">
              {language === 'nl' ? (
                <>
                  <span className="block mb-2">
                    Dit prototype is gemaakt als test om te onderzoeken of we AI
                    kunnen inzetten in situaties waarin een informant gevaar zou
                    lopen als hij of zij publiek naar voren treedt. Het doel is
                    om de integriteit van het verhaal te behouden, maar tegelijk
                    de identiteit en alle informatie te beschermen die terug te
                    voeren is naar de oorspronkelijke persoon.
                  </span>
                  <span className="block mb-2">
                    In dit specifieke geval hebben we Henry’s echte identiteit
                    onthuld vanwege de televisieserie, waarin zijn gezicht en
                    stem ongewijzigd in beeld komen. Om verwarring te voorkomen
                    hebben we ervoor gekozen zijn identiteit hier te behouden,
                    maar het testen en prototypen is gedaan met een pseudoniem,
                    een AI‑gegenereerd portret en een nieuwe stem.
                  </span>
                  <span className="block">
                    Voor vragen kun je tot en met 3 februari mailen naar{' '}
                    <a
                      href="mailto:L.Ye@vpro.nl"
                      className="text-[#00ABFE] hover:underline font-medium"
                    >
                      L.Ye@vpro.nl
                    </a>
                    . Daarna kun je terecht bij{' '}
                    <a
                      href="mailto:medialab@vpro.nl"
                      className="text-[#00ABFE] hover:underline font-medium"
                    >
                      medialab@vpro.nl
                    </a>
                    .
                  </span>
                </>
              ) : (
                <>
                  <span className="block mb-2">
                    This prototype was created as an experiment to explore
                    whether we can use AI in cases where an informant would be
                    put at risk if they spoke out publicly. The aim is to keep
                    the integrity of the story intact while protecting the
                    identity and any information that could lead back to the
                    original person.
                  </span>
                  <span className="block mb-2">
                    In this specific case we revealed Henry’s real identity
                    because of the TV series, in which his face and voice are
                    shown on screen without any modifications. To avoid
                    confusion we chose to keep his identity here, but the
                    testing and prototyping were done with a pseudonym, an
                    AI‑generated image of him and a new voice.
                  </span>
                  <span className="block">
                    If you have any questions, you can email{' '}
                    <a
                      href="mailto:L.Ye@vpro.nl"
                      className="text-[#00ABFE] hover:underline font-medium"
                    >
                      L.Ye@vpro.nl
                    </a>{' '}
                    until the 3rd of February. After that, please send your
                    questions to{' '}
                    <a
                      href="mailto:medialab@vpro.nl"
                      className="text-[#00ABFE] hover:underline font-medium"
                    >
                      medialab@vpro.nl
                    </a>
                    .
                  </span>
                </>
              )}
            </p>
          </section>

          {/* Contact for original files */}
          <section>
            <p className="text-sm text-gray-600">
              {language === 'nl' ? (
                <>
                  Als je geïnteresseerd bent in het bekijken van de originele
                  bestanden, neem dan contact met ons op via{' '}
                  <a
                    href="mailto:L.Ye@vpro.nl"
                    className="text-[#00ABFE] hover:underline font-medium"
                  >
                    L.Ye@vpro.nl
                  </a>{' '}
                  om toegang te vragen voor de bestanden en de reden.
                </>
              ) : (
                <>
                  If you are interested in viewing the original files, please
                  contact us at{' '}
                  <a
                    href="mailto:L.Ye@vpro.nl"
                    className="text-[#00ABFE] hover:underline font-medium"
                  >
                    L.Ye@vpro.nl
                  </a>{' '}
                  to request access to the files and provide your reasoning.
                </>
              )}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default InfoModal;

