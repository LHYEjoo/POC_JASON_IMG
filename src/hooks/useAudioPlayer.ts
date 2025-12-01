import * as React from 'react';

export interface AudioQueueItem {
  id: string;
  text: string;
  url: string; // mp3/m4a blob URL
}

interface AudioPlayerCallbacks {
  onAddMessage: (id: string, text: string) => void;
  onAudioStart: (id: string) => void;
  onAudioEnd: (id: string, queueEmpty: boolean) => void;
}

export function useAudioPlayer(callbacks: AudioPlayerCallbacks) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const queueRef = React.useRef<AudioQueueItem[]>([]);
  const playingRef = React.useRef(false);
  const unlockedRef = React.useRef(false);
  const cb = React.useRef(callbacks);
  React.useEffect(() => { cb.current = callbacks; }, [callbacks]);

  const ensureEl = () => {
    if (!audioRef.current) {
      const el = document.createElement('audio');
      el.setAttribute('playsinline', 'true');
      el.preload = 'auto';
      el.crossOrigin = 'anonymous';
      el.volume = 0.9; // vaste startvolume
      audioRef.current = el;
    }
    return audioRef.current!;
  };

  // iOS autoplay gate: AANROEPEN BINNEN de mic-tap / pointerdown
  const unlock = async () => {
    if (unlockedRef.current) return;
    const el = ensureEl();
    try {
      // Try AudioContext first (most reliable)
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const buffer = audioContext.createBuffer(1, 1, 22050);
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start(0);
        // Resume context if suspended (required on iOS)
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
      } catch (ctxErr) {
        // AudioContext might not be available, continue with element approach
      }
      
      // Also try playing the audio element (required for some browsers)
      try {
        // Create a minimal valid audio data URI (1 sample of silence)
        el.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
        await el.play();
        el.pause();
        el.currentTime = 0;
      } catch (playErr) {
        // If that fails, try with empty src
        try {
          el.src = '';
          await el.play();
          el.pause();
        } catch {
          // Final fallback - just mark as unlocked
        }
      }
      unlockedRef.current = true;
    } catch (e) {
      console.error('[AudioPlayer] Audio unlock failed:', e);
      // Don't block - mark as unlocked anyway so we can continue
      unlockedRef.current = true;
    }
  };

  const process = async () => {
    if (playingRef.current) return;
    const head = queueRef.current[0];
    if (!head) return;
    // eslint-disable-next-line no-console
    console.log('[AudioPlayer][process] start', {
      id: head.id,
      text: head.text,
      remaining: queueRef.current.length,
    });
    playingRef.current = true;

    // 1) Tekst ALTIJD direct in UI
    cb.current.onAddMessage(head.id, head.text);

    const el = ensureEl();
    el.onplay = () => cb.current.onAudioStart(head.id);
    const done = (skipError = false) => {
      playingRef.current = false;
      queueRef.current = queueRef.current.slice(1);
      cb.current.onAudioEnd(head.id, queueRef.current.length === 0);
      if (queueRef.current.length) setTimeout(process, 30);
    };
    el.onended = () => done();
    el.onerror = () => done(true);

    try {
      el.src = head.url;
      await el.play(); // kan op iOS nog steeds weigeren; tekst blijft zichtbaar
    } catch (e) {
      console.error('[AudioPlayer] Audio play failed:', e);
      done(true);
    }
  };

  const enqueue = (it: AudioQueueItem) => { 
    // eslint-disable-next-line no-console
    console.log('[AudioPlayer][enqueue]', it);
    queueRef.current = [...queueRef.current, it]; 
    void process(); 
  };
  const setQueue = (items: AudioQueueItem[]) => { 
    queueRef.current = items.slice(); 
    void process(); 
  };
  const stop = () => { 
    const el = audioRef.current; 
    if (el) { 
      el.pause(); 
      el.currentTime = 0; 
    } 
    playingRef.current = false; 
    queueRef.current = []; 
  };

  return { enqueue, setQueue, stop, unlock };
}