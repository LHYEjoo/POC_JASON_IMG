import * as React from 'react';
import { cn } from '../utils/cn';

type STTStatus = 'idle' | 'listening' | 'processing' | 'finalizing' | 'unsupported' | 'error';

export default function MicFAB({
  state,
  onClick,
  placement = 'center',
  // Nieuw: optioneel doorgeven i.v.m. STT
  sttStatus,
  interimText,
}: {
  state: 'idle' | 'recording' | 'playing';
  onClick: () => void;
  placement?: 'center' | 'inline';
  sttStatus?: STTStatus;
  interimText?: string;
}) {
  // "Actief opnemen" wanneer óf expliciet via state, óf STT luistert
  const recordingActive =
    state === 'recording' || sttStatus === 'listening';

  const button = (
    <div className="flex flex-col items-center">
      <button
        type="button"
        aria-label={recordingActive ? 'Stop opname' : 'Start opname'}
        aria-pressed={recordingActive}
        onClick={onClick}
        className={cn(
          'pointer-events-auto relative h-28 w-28 rounded-full shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary text-white text-3xl flex items-center justify-center',
          'bg-accent',
          recordingActive ? 'animate-pulse' : ''
        )}
      >
        {recordingActive && (
          <span className="absolute -inset-4 rounded-full border-4 border-[#FF999A] animate-ping" />
        )}
        <span className="sr-only">
          {recordingActive ? 'Opnemen' : 'Druk om te spreken'}
        </span>
        <img src="/icons/mic.svg" alt="Microfoon" className="h-14 w-14" />
      </button>

      {/* Live feedback tijdens luisteren */}
      {sttStatus === 'listening' && (
        <div className="mt-2 text-center">
          <span className="text-sm text-gray-500 block">
            Listening… {interimText}
          </span>
          <div className="flex justify-center mt-1">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (placement === 'inline') return button;

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center pointer-events-none">
      {button}
    </div>
  );
}
