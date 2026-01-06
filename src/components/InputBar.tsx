import * as React from 'react';
import { cn } from '../utils/cn';

type STTStatus = 'idle' | 'listening' | 'processing' | 'finalizing' | 'unsupported' | 'error';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (text: string) => void;
  onMicClick: () => void;
  sttStatus: STTStatus;
  interimText?: string;
  isRecording?: boolean;
  placeholder?: string;
}

export default function InputBar({
  value,
  onChange,
  onSubmit,
  onMicClick,
  sttStatus,
  interimText,
  isRecording = false,
  placeholder = 'Typ je vraag…'
}: Props) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = React.useState(false);

  // Show interim text when listening, otherwise show input value
  const displayValue = sttStatus === 'listening' && interimText ? interimText : value;
  const showInterim = sttStatus === 'listening' && interimText && !value;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const textToSubmit = value.trim();
    if (textToSubmit) {
      onSubmit(textToSubmit);
      onChange('');
      inputRef.current?.focus();
    }
  };

  const recordingActive = isRecording || sttStatus === 'listening';

  return (
    <div className="w-full bg-[var(--color-jerboa)] border-t border-black/10">
      <div className="mx-auto max-w-4xl px-3 sm:px-6 py-2 sm:py-3">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          {/* Text input */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={displayValue}
              onChange={(e) => {
                // Only allow editing when not listening
                if (sttStatus !== 'listening') {
                  onChange(e.target.value);
                }
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={showInterim ? undefined : placeholder}
              disabled={sttStatus === 'listening'}
              className={cn(
                'w-full rounded-[16px] border border-wolf bg-white px-3 py-2.5 sm:px-4 sm:py-3',
                'text-sm sm:text-base',
                'shadow-vpro focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
                'disabled:opacity-60 disabled:cursor-not-allowed',
                sttStatus === 'listening' && 'bg-blue-50'
              )}
              style={{
                fontFamily: 'Simplistic Sans',
              }}
            />
            {showInterim && (
              <div className="absolute inset-0 flex items-center px-3 sm:px-4 pointer-events-none">
                <span className="text-sm sm:text-base text-gray-500 italic truncate">
                  {interimText}
                </span>
              </div>
            )}
          </div>

          {/* Mic button */}
          <button
            type="button"
            onClick={onMicClick}
            aria-label={recordingActive ? 'Stop opname' : 'Start opname'}
            aria-pressed={recordingActive}
            className={cn(
              'h-10 w-10 sm:h-12 sm:w-12 rounded-full shadow-vpro',
              'flex items-center justify-center shrink-0',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
              recordingActive
                ? 'bg-accent animate-pulse'
                : 'bg-primary text-white hover:bg-secondary'
            )}
          >
            {recordingActive && (
              <span className="absolute -inset-1 rounded-full border-2 border-[#FF999A] animate-ping" />
            )}
            <svg
              className="h-5 w-5 sm:h-6 sm:w-6"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          </button>

          {/* Send button - only show when there's text to send */}
          {value.trim() && sttStatus !== 'listening' && (
            <button
              type="submit"
              className={cn(
                'h-10 w-10 sm:h-12 sm:w-12 rounded-full shadow-vpro',
                'flex items-center justify-center shrink-0',
                'bg-primary text-white hover:bg-secondary',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary'
              )}
              aria-label="Stuur"
            >
              <svg
                className="h-5 w-5 sm:h-6 sm:w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

