import * as React from 'react';
import DisclaimerInline from './DisclaimerInline';
import { cn } from '../utils/cn';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  audioEnabled: boolean;
  onAudioToggle: (enabled: boolean) => void;
  onReset: () => void;
}

export function SettingsModal({ isOpen, onClose, audioEnabled, onAudioToggle, onReset }: Props) {
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
          <h2 className="text-2xl font-semibold text-gray-900">Instellingen</h2>
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
                Audio afspelen
              </label>
              <button
                type="button"
                id="audio-toggle"
                onClick={() => onAudioToggle(!audioEnabled)}
                className={cn(
                  'relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#00ABFE] focus:ring-offset-2',
                  audioEnabled ? 'bg-[#00ABFE]' : 'bg-gray-300'
                )}
                aria-label={audioEnabled ? 'Audio aan' : 'Audio uit'}
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
              {audioEnabled
                ? 'Jason spreekt zijn antwoorden uit'
                : 'Jason spreekt zijn antwoorden niet uit'}
            </p>
          </div>

          {/* AI Disclaimer */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">AI Disclaimer</h3>
            <div className="bg-gray-50 rounded-[16px] p-4">
              <DisclaimerInline />
            </div>
          </div>
        </div>

        {/* Footer with Reset Button */}
        <div className="border-t border-gray-200 px-6 py-4">
          <button
            type="button"
            onClick={() => {
              onReset();
              onClose();
            }}
            className="w-full rounded-[16px] px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-medium shadow-vpro transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            ↻ Reset Gesprek
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;

