import * as React from 'react';
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
  audioEnabled: boolean;
  onAudioToggle: (enabled: boolean) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onReset: () => void;
  sources: Source[];
  darkMode?: boolean;
  onDarkModeToggle?: (enabled: boolean) => void;
  temperature?: number;
  onTemperatureChange?: (temp: number) => void;
}

export function SettingsModal({ isOpen, onClose, audioEnabled, onAudioToggle, language, onLanguageChange, onReset, sources, darkMode = false, onDarkModeToggle, temperature = 0, onTemperatureChange }: Props) {
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dimmed background
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
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900">{language === 'nl' ? 'Instellingen' : 'Settings'}</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-red-50 rounded-full transition-colors"
              aria-label="Close settings"
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
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Audio Toggle */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="audio-toggle" className="text-lg font-medium text-gray-900">
                {language === 'nl' ? 'Audio afspelen' : 'Play Audio'}
              </label>
              <button
                type="button"
                id="audio-toggle"
                onClick={() => onAudioToggle(!audioEnabled)}
                className={cn(
                  'relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#00ABFE] focus:ring-offset-2',
                  audioEnabled ? 'bg-[#00ABFE]' : 'bg-gray-300'
                )}
                aria-label={audioEnabled ? (language === 'nl' ? 'Audio aan' : 'Audio on') : (language === 'nl' ? 'Audio uit' : 'Audio off')}
              >
                <span
                  className={cn(
                    'inline-block h-5 w-5 transform rounded-full bg-white transition-transform',
                    audioEnabled ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>
            <p className="text-sm text-gray-600">
              {language === 'nl'
                ? (audioEnabled
                    ? 'Henry spreekt zijn antwoorden uit'
                    : 'Henry spreekt zijn antwoorden niet uit')
                : (audioEnabled
                    ? 'Henry speaks his answers out loud'
                    : 'Henry does not speak his answers out loud')}
            </p>
          </div>

          {/* Language Toggle */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="language-toggle" className="text-lg font-medium text-gray-900">
                {language === 'nl' ? 'Taal' : 'Language'}
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onLanguageChange('nl')}
                  className={cn(
                    'px-4 py-2 rounded-[12px] font-medium transition-colors',
                    language === 'nl'
                      ? 'bg-[#00ABFE] text-black'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  )}
                >
                  NL
                </button>
                <button
                  type="button"
                  onClick={() => onLanguageChange('en')}
                  className={cn(
                    'px-4 py-2 rounded-[12px] font-medium transition-colors',
                    language === 'en'
                      ? 'bg-[#00ABFE] text-black'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  )}
                >
                  EN
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {language === 'nl'
                ? 'Kies de taal waarin Henry communiceert'
                : 'Choose the language Henry communicates in'}
            </p>
          </div>

          {/* Dark Mode Toggle */}
          {onDarkModeToggle && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="dark-mode-toggle" className="text-lg font-medium text-gray-900">
                  {language === 'nl' ? 'Donkere modus' : 'Dark Mode'}
                </label>
                <button
                  type="button"
                  id="dark-mode-toggle"
                  onClick={() => onDarkModeToggle(!darkMode)}
                  className={cn(
                    'relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#00ABFE] focus:ring-offset-2',
                    darkMode ? 'bg-[#00ABFE]' : 'bg-gray-300'
                  )}
                  aria-label={darkMode ? (language === 'nl' ? 'Donkere modus aan' : 'Dark mode on') : (language === 'nl' ? 'Donkere modus uit' : 'Dark mode off')}
                >
                  <span
                    className={cn(
                      'inline-block h-5 w-5 transform rounded-full bg-white transition-transform',
                      darkMode ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>
              <p className="text-sm text-gray-600">
                {language === 'nl'
                  ? (darkMode
                      ? 'Donkere modus is ingeschakeld'
                      : 'Donkere modus is uitgeschakeld')
                  : (darkMode
                      ? 'Dark mode is enabled'
                      : 'Dark mode is disabled')}
              </p>
            </div>
          )}

          {/* Temperature Slider */}
          {onTemperatureChange && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="temperature-slider" className="text-lg font-medium text-gray-900 dark:text-white">
                  {language === 'nl' ? 'Temperatuur' : 'Temperature'}
                </label>
                <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
                  {temperature.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                id="temperature-slider"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(e) => {
                  const newValue = parseFloat(e.target.value);
                  // eslint-disable-next-line no-console
                  console.log('🔥🔥🔥 SLIDER CHANGED:', newValue, 'old value:', temperature);
                  onTemperatureChange(newValue);
                }}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#00ABFE]"
                style={{
                  background: `linear-gradient(to right, #00ABFE 0%, #00ABFE ${temperature * 100}%, #e5e7eb ${temperature * 100}%, #e5e7eb 100%)`
                }}
                aria-label={language === 'nl' ? 'Temperatuur slider' : 'Temperature slider'}
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>{language === 'nl' ? 'Deterministisch' : 'Deterministic'}</span>
                <span>{language === 'nl' ? 'Creatief' : 'Creative'}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {language === 'nl'
                  ? 'Lager = meer consistent en voorspelbaar, Hoger = meer creatief en gevarieerd'
                  : 'Lower = more consistent and predictable, Higher = more creative and varied'}
              </p>
            </div>
          )}

          {/* Sources & contact moved to InfoModal */}
        </div>

        {/* Footer with Save Settings Button */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <button
            type="button"
            onClick={() => {
              onClose();
            }}
            className="w-full rounded-[16px] px-4 py-3 bg-[#00ABFE] hover:bg-[#0099E6] text-white font-medium shadow-vpro transition-colors focus:outline-none focus:ring-2 focus:ring-[#00ABFE] focus:ring-offset-2"
          >
            {language === 'nl' ? 'Instellingen Opslaan' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;

