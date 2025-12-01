// Server-side Whisper transcription proxy
// This keeps the OpenAI API key server-side only

import 'dotenv/config';
import OpenAI from 'openai';

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable: ${name}`);
  return v;
}

const OPENAI_API_KEY = requireEnv('OPENAI_API_KEY');
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Parse JSON body with base64 audio
    let body: { audio?: string; mimeType?: string };
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    } catch {
      res.status(400).json({ error: 'Invalid JSON body' });
      return;
    }

    if (!body.audio || typeof body.audio !== 'string') {
      res.status(400).json({ error: 'Missing audio data in request body' });
      return;
    }

    // Decode base64 to buffer
    const audioBuffer = Buffer.from(body.audio, 'base64');
    const mimeType = body.mimeType || 'audio/webm';

    // Create a File object for OpenAI SDK
    const file = new File([audioBuffer], 'audio.webm', { type: mimeType });

    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'nl', // Dutch
    });

    res.status(200).json({ text: transcription.text || '' });
  } catch (err: any) {
    console.error('[api/transcribe] error:', err?.message || err);
    res.status(500).json({ error: err?.message || 'Transcription failed' });
  }
}

