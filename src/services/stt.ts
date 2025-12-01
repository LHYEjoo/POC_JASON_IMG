// Simple browser STT module with Whisper (MediaRecorder + upload) and Web Speech fallback
// Usage: const text = await startTranscription();

const isIOS = (): boolean => {
  const ua = navigator.userAgent || (navigator as any).vendor || (window as any).opera;
  const isAppleMobile = /iPad|iPhone|iPod/.test(ua);
  const isIPadOnIOS13Plus = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  return isAppleMobile || isIPadOnIOS13Plus;
};

const hasMediaRecorder = (): boolean => typeof window !== 'undefined' && 'MediaRecorder' in window;

async function recordWithMediaRecorder(durationMs: number = 7000): Promise<string> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      // Re-enable AGC to improve sensitivity in quiet environments
      autoGainControl: true
    } as MediaTrackConstraints
  });
  const mimeType = (window as any).MediaRecorder?.isTypeSupported('audio/webm;codecs=opus')
    ? 'audio/webm;codecs=opus'
    : ((window as any).MediaRecorder?.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg');
  const recorder = new MediaRecorder(stream, { mimeType });
  const chunks: Blob[] = [];

  return new Promise((resolve, reject) => {
    recorder.ondataavailable = (e: BlobEvent) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };
    recorder.onerror = (e: Event) => {
      console.error('[STT] MediaRecorder error', e);
      reject((e as any).error || new Error('MediaRecorder error'));
    };
    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: mimeType });
      try {
        const text = await transcribeWithOpenAI(blob);
        resolve(text);
      } catch (err) {
        reject(err);
      } finally {
        stream.getTracks().forEach((t) => t.stop());
      }
    };

    recorder.start();
    setTimeout(() => {
      if (recorder.state !== 'inactive') recorder.stop();
    }, durationMs);
  });
}

async function transcribeWithOpenAI(audioBlob: Blob): Promise<string> {
  // Try server-side proxy first (safer, no client-side API key needed)
  try {
    // Convert blob to base64 for easier server-side handling
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Remove data URL prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    });

    const resp = await fetch('/api/transcribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio: base64,
        mimeType: audioBlob.type || 'audio/webm',
      }),
    });

    if (resp.ok) {
      const data = await resp.json();
      return data.text || '';
    }
    const errorText = await resp.text().catch(() => '');
    console.warn('[STT] Server transcription failed:', resp.status, errorText);
  } catch (err) {
    console.warn('[STT] Server transcription error, falling back to direct OpenAI', err);
  }

  // Fallback: direct OpenAI call (requires client-side API key)
  const apiKey = (import.meta as any)?.env?.VITE_OPENAI_API_KEY ||
    (window as any).OPENAI_API_KEY ||
    localStorage.getItem('OPENAI_API_KEY');
  const envKey = (import.meta as any)?.env?.VITE_OPENAI_API_KEY;
  // Log whether the key is present (without exposing the full value)
  console.log('[STT] VITE_OPENAI_API_KEY loaded?', !!envKey, envKey ? `${envKey.slice(0, 6)}...${envKey.slice(-4)}` : 'undefined');

  if (!apiKey) {
    console.warn('[STT] No OpenAI API key found. Set VITE_OPENAI_API_KEY, window.OPENAI_API_KEY, or localStorage.OPENAI_API_KEY');
    throw new Error('Missing OpenAI API key');
  }

  const form = new FormData();
  form.append('file', audioBlob, 'audio.webm');
  form.append('model', 'whisper-1');

  const resp = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: form,
  });

  if (!resp.ok) {
    const errText = await resp.text().catch(() => '');
    console.error('[STT] OpenAI transcription failed', resp.status, errText);
    throw new Error(`OpenAI transcription error: ${resp.status}`);
  }

  const data = await resp.json();
  const text: string = data.text || '';
  return text;
}

async function transcribeWithWebSpeech(): Promise<string> {
  const SpeechRecognition: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) {
    throw new Error('Web Speech API not supported in this browser');
  }

  return new Promise((resolve, reject) => {
    const recognition = new SpeechRecognition();
    recognition.lang = navigator.language || 'nl-NL';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    let resolved = false;

    recognition.onresult = (event: Event) => {
      const res0: any = (event as any).results && (event as any).results[0];
      const alt0: any = res0 && res0[0];
      const transcript = alt0 ? String(alt0.transcript) : '';
      resolved = true;
      try { recognition.stop(); } catch {}
      resolve(transcript);
    };
    recognition.onerror = (event: any) => {
      console.error('[STT] Web Speech error:', event?.error);
      if (!resolved) reject(new Error(event?.error || 'Web Speech error'));
    };
    recognition.onend = () => {
      if (!resolved) resolve('');
    };

    try {
      recognition.start();
    } catch (err) {
      reject(err);
    }
  });
}

export async function startTranscription(): Promise<string> {
  try {
    if (isIOS()) {
      return await transcribeWithWebSpeech();
    }
    if (!hasMediaRecorder()) {
      return await transcribeWithWebSpeech();
    }
    return await recordWithMediaRecorder();
  } catch (err) {
    console.warn('[STT] Primary STT route failed, attempting Web Speech fallback', err);
    try {
      return await transcribeWithWebSpeech();
    } catch (fallbackErr) {
      console.error('[STT] Both Whisper and Web Speech failed');
      throw fallbackErr;
    }
  }
}

export default { startTranscription };