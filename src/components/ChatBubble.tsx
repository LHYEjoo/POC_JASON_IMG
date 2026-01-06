import * as React from 'react';
import { cn } from '../utils/cn';

interface Props {
  type: 'ai' | 'user';
  text: string;
  showAvatar?: boolean;
  avatarSrc?: string;
  status?: 'final' | 'stream';
  imageUrl?: string;
}

export function ChatBubble({ type, text, showAvatar, avatarSrc, status = 'final', imageUrl }: Props) {
  const isAI = type === 'ai';
  if (isAI) {
    return (
      <div className="flex items-end gap-2 sm:gap-3">
        {showAvatar ? (
          <img src={avatarSrc} alt="Henry" className="h-8 w-8 sm:h-10 sm:w-10 rounded-full shrink-0" />
        ) : (
          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full opacity-0 shrink-0" />
        )}
        <div className="relative flex flex-col gap-1.5 sm:gap-2 min-w-0">
          <div 
            className="max-w-[85%] sm:max-w-[70ch] rounded-[16px] px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-lg shadow-vpro bg-wolf text-[var(--color-text)] leading-relaxed" 
            style={{ 
              fontFamily: 'Simplistic Sans',
              // Browser fallbacks
              backgroundColor: '#D6D6D6',
              color: '#000000',
              borderRadius: '16px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
              whiteSpace: 'pre-line' // Preserve newlines for citations
            }}
          >
            {text}
          </div>
          {imageUrl && (
            <div className="max-w-[85%] sm:max-w-[70ch]">
              <img 
                src={imageUrl} 
                alt="Response image" 
                className="rounded-[16px] shadow-vpro w-full h-auto object-cover block"
                style={{
                  borderRadius: '16px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                  maxHeight: '400px',
                  objectFit: 'cover',
                  maxWidth: '100%'
                }}
              />
            </div>
          )}
          {showAvatar && (
            <span className="absolute -left-1.5 sm:-left-2 bottom-2.5 sm:bottom-3 h-0 w-0 border-t-6 border-b-6 border-r-6 sm:border-t-8 sm:border-b-8 sm:border-r-8 border-t-transparent border-b-transparent border-r-wolf" />
          )}
        </div>
      </div>
    );
  }

  const isStreaming = status === 'stream';
  
  return (
    <div className={cn('flex justify-end')}>
      <div 
        className={cn(
          'max-w-[85%] sm:max-w-[70ch] rounded-[16px] px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-lg shadow-vpro transition-opacity duration-200 leading-relaxed',
          isStreaming 
            ? 'bg-primary/70 text-white/90 border border-primary/30' 
            : 'bg-primary text-white'
        )} 
        style={{ 
          fontFamily: 'Simplistic Sans',
          // Browser fallbacks
          backgroundColor: isStreaming ? '#00ABFE' : '#00ABFE',
          color: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.12)'
        }}
      >
        {text}
        {isStreaming && (
          <span className="inline-block w-1.5 h-3 sm:w-2 sm:h-4 ml-1 bg-white/60 animate-pulse" />
        )}
      </div>
    </div>
  );
}

export default ChatBubble;

