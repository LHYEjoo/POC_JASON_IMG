export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method-not-allowed' });

  const key = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID || 'UgBBYS2sOqTuMpoF3BR0';

  const { text, normalize_volume } = req.body || {};
  if (!text || typeof text !== 'string') return res.status(400).json({ error: 'missing-text' });
  if (!key) return res.status(500).json({ error: 'missing-elevenlabs-key' });

  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: text.trim(),
      model_id: 'eleven_multilingual_v2',
      voice_settings: { 
        speed:1.05,
        stability: 0.7, 
        similarity_boost: 0.65,
        style: 0.23,  
        // Add volume normalization settings
        use_speaker_boost: false,  // Helps with volume consistency
      }
    }),
  });

  if (!r.ok || !r.body) {
    const t = await r.text().catch(() => '');
    return res.status(502).json({ error: 'tts-failed', detail: String(t).slice(0,200) });
  }

  // Buffer stream en serveer als MP3
  const reader = r.body.getReader();
  const chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  const buf = Buffer.concat(chunks.map((u) => Buffer.from(u)));
  res.setHeader('Content-Type', 'audio/mpeg');
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).send(buf);
}
