import * as React from 'react';

export type STTStatus = 'idle' | 'listening' | 'processing' | 'unsupported' | 'error';
export type STTError =
  | 'unsupported'
  | 'permission-denied'
  | 'not-allowed'
  | 'no-speech'
  | 'network'
  | 'speech-error';

type Options = {
  lang?: string;
  interimResults?: boolean;
  continuous?: boolean;
  maxAlternatives?: number;
};

type UseRobustSTTReturn = {
  start: () => Promise<() => void | void>;
  stop: () => void;
  status: STTStatus;
  interim: string;
  isSupported: boolean;
};

export function useRobustSpeechRecognition(
  onResult: (finalText: string) => void,
  onError: (err: STTError) => void,
  lang: string = 'en-US',
  opts: Options = {}
): UseRobustSTTReturn {
  const [status, setStatus] = React.useState<STTStatus>('idle');
  const [interim, setInterim] = React.useState('');
  const [isSupported, setIsSupported] = React.useState(false);
  
  const recRef = React.useRef<any | null>(null);
  const deliveredFinalRef = React.useRef(false);
  const heardSpeechRef = React.useRef(false);
  const hasPermissionRef = React.useRef(false);
  const silenceTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const speechTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const isListeningRef = React.useRef(false);

  // Check browser support
  React.useEffect(() => {
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    setIsSupported(!!SR);
    
    if (!SR) {
      setStatus('unsupported');
      onError('unsupported');
    }
  }, [onError]);

  const stop = React.useCallback(() => {
    
    try {
      if (recRef.current) {
        recRef.current.stop();
        recRef.current.abort();
        recRef.current = null; // Clear the reference
      }
    } catch (e) {
      // Ignore errors when stopping
    }
    
    // Clear all timeouts
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }
    
    setStatus('idle');
    setInterim('');
    deliveredFinalRef.current = false;
    heardSpeechRef.current = false;
    isListeningRef.current = false;
  }, []);

  const start = React.useCallback(async () => {
    if (!isSupported) {
      console.error('[RobustSTT] Speech recognition not supported');
      onError('unsupported');
      return () => {};
    }


    // Stop any existing recognition first
    if (recRef.current) {
      try {
        recRef.current.stop();
        recRef.current.abort();
      } catch (e) {
        // Ignore errors
      }
      recRef.current = null;
    }

    // Check HTTPS requirement
    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
      console.error('[RobustSTT] HTTPS required for speech recognition');
      setStatus('error');
      onError('speech-error');
      return () => {};
    }

    // Request microphone permission
    if (!hasPermissionRef.current) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            // Add more audio constraints for better reliability
            sampleRate: 44100,
            channelCount: 1
          } 
        });
        stream.getTracks().forEach(t => t.stop());
        hasPermissionRef.current = true;
      } catch (err: any) {
        console.error('[RobustSTT] Microphone permission denied:', err);
        setStatus('error');
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          onError('permission-denied');
        } else if (err.name === 'NotFoundError') {
          onError('speech-error');
        } else {
          onError('permission-denied');
        }
        return () => {};
      }
    }

    // Reset state
    deliveredFinalRef.current = false;
    heardSpeechRef.current = false;
    setInterim('');
    isListeningRef.current = true;

    // Create speech recognition
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const rec = new SR();
    recRef.current = rec;

    // Browser-specific optimizations (detect BEFORE using isIOS)
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isMobileChrome = /Android.*Chrome/i.test(navigator.userAgent);
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Configure speech recognition with reliability improvements
    rec.lang = lang;
    rec.interimResults = opts.interimResults !== false; // Default to true
    rec.continuous = opts.continuous !== false; // Default to true
    rec.maxAlternatives = opts.maxAlternatives || 1;
    
    // Add reliability improvements (don't set grammars on iOS - it causes errors)
    if (!isIOS) {
      try {
        rec.grammars = undefined; // Disable grammars for better compatibility
      } catch (e) {
        // Ignore if grammars can't be set
      }
    }
    // Don't set serviceURI - it's not supported on all browsers


    // Mobile optimizations
    if (isMobile) {
      rec.continuous = true; // Better for mobile
      rec.interimResults = true; // Show real-time feedback
    }

    // Safari/iOS optimizations
    if (isSafari || isIOS) {
      rec.maxAlternatives = 1;
      rec.continuous = true;
      rec.interimResults = true; // Force interim results on iOS for live preview
    }

    // Mobile Chrome optimizations
    if (isMobileChrome) {
      rec.continuous = true;
      rec.interimResults = true;
    }

    // Event handlers
    rec.onstart = () => {
      // eslint-disable-next-line no-console
      console.log('[RobustSTT] Recognition started');
      setStatus('listening');
      setInterim('');
    };

    rec.onresult = (e: any) => {
      const results = Array.from(e.results || []);
      let finalTranscript = '';
      let interimTranscript = '';
      
      // eslint-disable-next-line no-console
      console.log('[RobustSTT] onresult called, results count:', results.length);
      
      for (let i = 0; i < results.length; i++) {
        const result = results[i] as any;
        const transcript = result[0]?.transcript?.trim() || '';
        
        // Skip empty or very short transcripts
        if (transcript.length < 2) continue;
        
        // eslint-disable-next-line no-console
        console.log('[RobustSTT] Result', i, { transcript: transcript.slice(0, 50), isFinal: result.isFinal });
        
        if (result.isFinal) {
          finalTranscript += (finalTranscript ? ' ' : '') + transcript;
        } else {
          // For interim results, accumulate all final results so far + this interim
          // This gives us the full context up to the current interim word
          let accumulated = '';
          for (let j = 0; j <= i; j++) {
            const r = results[j] as any;
            const t = r[0]?.transcript?.trim() || '';
            if (t.length >= 2) {
              accumulated += (accumulated ? ' ' : '') + t;
            }
          }
          interimTranscript = accumulated;
        }
      }
      
      // Handle final results
      if (finalTranscript) {
        // eslint-disable-next-line no-console
        console.log('[RobustSTT] Final transcript:', finalTranscript);
        deliveredFinalRef.current = true;
        heardSpeechRef.current = true;
        setInterim('');
        setStatus('idle');
        // Clear any pending timeout since we got a final result
        if (speechTimeoutRef.current) {
          clearTimeout(speechTimeoutRef.current);
          speechTimeoutRef.current = null;
        }
        // Only call onResult if we have valid text (not empty, not placeholder, not garbage)
        const cleanText = finalTranscript.trim();
        
        // Filter out known garbage text patterns from speech recognition services
        const garbagePatterns = [
          'ondertitels ingediend',
          'amara.org',
          'subtitles submitted',
          'community',
          'gemeenschap'
        ];
        const isGarbage = garbagePatterns.some(pattern => 
          cleanText.toLowerCase().includes(pattern.toLowerCase())
        );
        
        if (cleanText && cleanText.length > 0 && 
            !cleanText.includes('... ... ...') && 
            !isGarbage) {
          onResult(cleanText);
        } else if (isGarbage || cleanText.length === 0) {
          // eslint-disable-next-line no-console
          console.log('[RobustSTT] Rejecting garbage or empty text:', cleanText);
          // Don't call onResult - treat as if no speech was detected
          onError('no-speech');
        }
        // Stop after final result
        stop();
      } else if (interimTranscript && opts.interimResults !== false) {
        // eslint-disable-next-line no-console
        console.log('[RobustSTT] Interim transcript:', interimTranscript);
        heardSpeechRef.current = true;
        // Show interim results in real-time - update immediately
        // Filter out placeholder text
        const cleanInterim = interimTranscript.trim();
        if (cleanInterim && !cleanInterim.includes('... ... ...')) {
          setInterim(cleanInterim);
        }
        
        // Reset timeout when new speech is detected
        if (speechTimeoutRef.current) {
          clearTimeout(speechTimeoutRef.current);
        }
        
        // Use 5 second timeout for both platforms
        const timeoutDuration = 5000; // 5 seconds for both iOS and web
        speechTimeoutRef.current = setTimeout(() => {
          // Only show no-speech error if we haven't delivered a final result AND haven't heard any speech
          if (!deliveredFinalRef.current && !heardSpeechRef.current) {
            onError('no-speech');
          }
          stop();
        }, timeoutDuration);
      } else {
        // eslint-disable-next-line no-console
        console.log('[RobustSTT] No transcript found in results');
      }
    };

    rec.onerror = (e: any) => {
      console.error('[RobustSTT] Speech recognition error:', e);
      setStatus('error');
      
      // Reset permission flag on certain errors
      if (e?.error === 'not-allowed' || e?.error === 'permission-denied') {
        hasPermissionRef.current = false;
      }
      
      if (e?.error === 'not-allowed') {
        onError('not-allowed');
      } else if (e?.error === 'no-speech') {
        if (!deliveredFinalRef.current && !heardSpeechRef.current) {
          onError('no-speech');
        }
      } else if (e?.error === 'network') {
        onError('network');
      } else if (e?.error === 'audio-capture') {
        // Audio capture error - try to restart
        setTimeout(() => {
          if (isListeningRef.current) {
            try {
              rec.start();
            } catch (err) {
              console.error('[RobustSTT] Failed to restart after audio-capture error:', err);
              onError('speech-error');
            }
          }
        }, 1000);
      } else {
        onError('speech-error');
      }
    };

    rec.onend = () => {
      
      // Clear timeouts
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
        speechTimeoutRef.current = null;
      }
      
      // Check if we delivered any final results
      if (!deliveredFinalRef.current && !heardSpeechRef.current && status !== 'error') {
        onError('no-speech');
      }
      
      // Reset all refs for next use
      deliveredFinalRef.current = false;
      heardSpeechRef.current = false;
      
      setStatus(prev => (prev === 'processing' ? 'idle' : prev === 'listening' ? 'idle' : prev));
      setInterim('');
      isListeningRef.current = false;
    };

    try {
      rec.start();
    } catch (err) {
      console.error('[RobustSTT] Failed to start speech recognition:', err);
      setStatus('error');
      onError('speech-error');
    }

    return () => {
      stop();
    };
  }, [isSupported, lang, opts.interimResults, opts.continuous, opts.maxAlternatives, onError, onResult, stop]);

  return { start, stop, status, interim, isSupported };
}
