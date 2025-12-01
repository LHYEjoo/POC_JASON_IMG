export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method-not-allowed' });

  // ---- SSE headers + immediate flush ----
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  if (typeof res.flushHeaders === 'function') res.flushHeaders();

  const write = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`);
  const comment = (txt) => res.write(`: ${txt}\n\n`); // SSE comment (doorbreekt buffering)
  const close = (obj) => { try { write(obj); } catch {} res.end(); };

  // Open "ping" om proxies te doorbreken + keep-alive elke 12s
  comment('open');
  const ping = setInterval(() => comment('ping'), 12000);

  try {
    const { messages, message, threadId } = req.body || {};
    const apiKey = process.env.OPENAI_API_KEY;

    console.log('[CHAT] API called with message:', message);

    // Thread-id event eerst (je UI logt dit)
    const tid = threadId || ('th_' + Math.random().toString(36).slice(2, 10));
    write({ type: 'thread_id', threadId: tid });

    // Kies prompt
    let prompt = '';
    if (Array.isArray(messages) && messages.length) {
      const lastUser = [...messages].reverse().find(m => m.role === 'user');
      prompt = (lastUser?.content ?? '').toString();
    } else if (typeof message === 'string') {
      prompt = message;
    } else {
      clearInterval(ping);
      return close({ type: 'final', text: 'missing-message' });
    }

    // Fallback als key mist: geen 500 laten bubbelen, maar netje afsluiten met final
    if (!apiKey) {
      write({ type: 'delta', text: '...' });
      clearInterval(ping);
      return close({ type: 'final', text: 'Server mist OPENAI_API_KEY (prod env).' });
    }

    console.log('[CHAT] Using regular chat completions (fallback)...');

    // Use regular chat completions instead of Assistant API
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        stream: true,
        temperature: 0,
        messages: [
          { 
            role: 'system', 
            content: `You are Jason, a Hong Kong refugee who fled to Taiwan in 2019 after the protests. You were involved in the democratic movement and were being watched by the police. Now you're trying to build a new life in Taiwan, but you never feel completely safe.

Your personality: cautious, distrustful, emotional, authentic, vulnerable. You speak briefly, directly and personally. You're afraid of persecution, miss your home, and have trust issues.

Respond briefly and naturally in English. Maximum 3 sentences. Short, factual, believable. Use your background and experiences in your answers. No unnecessary disclaimers.` 
          },
          ...(Array.isArray(messages) ? messages : [{ role: 'user', content: prompt }]),
        ],
      }),
    });

    if (!r.ok || !r.body) {
      const t = await r.text().catch(() => '');
      console.log('[CHAT] OpenAI failed:', t);
      clearInterval(ping);
      return close({ type: 'final', text: `openai-failed: ${String(t).slice(0,200)}` });
    }

    console.log('[CHAT] Streaming response...');
    const reader = r.body.getReader();
    const decoder = new TextDecoder();
    let full = '';
    let gotDelta = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });

      for (const raw of chunk.split('\n')) {
        const line = raw.trim();
        if (!line.startsWith('data:')) continue;
        const payload = line.slice(5).trim();
        if (payload === '[DONE]') continue;
        try {
          const json = JSON.parse(payload);
          const delta = json?.choices?.[0]?.delta?.content;
          if (delta) {
            gotDelta = true;
            full += delta;
            write({ type: 'delta', text: delta });
          }
        } catch { /* negeer */ }
      }
    }

    console.log('[CHAT] Response completed');
    clearInterval(ping);
    return close({ type: 'final', text: gotDelta ? full : (full || '') });
  } catch (e) {
    clearInterval(ping);
    console.error('[api/chat] error:', e);
    return close({ type: 'final', text: 'Serverfout tijdens stream.' });
  }
}
