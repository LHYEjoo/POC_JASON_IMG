// Serverless LLM answer endpoint.
// - Accepts { messages, model? }
// - Uses OpenAI Chat Completions
// - Returns { ok, text, tokensUsed }

import 'dotenv/config';
import OpenAI from 'openai';

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

type AnswerRequest = {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
};

type AnswerResponse =
  | { ok: true; text: string; tokensUsed?: number }
  | { ok: false; error: string };

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable: ${name}`);
  return v;
}

const OPENAI_API_KEY = requireEnv('OPENAI_API_KEY');
const DEFAULT_MODEL = process.env.CHAT_MODEL || 'gpt-4o-mini';

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed' } satisfies AnswerResponse);
    return;
  }

  let body: AnswerRequest;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  } catch {
    res.status(400).json({ ok: false, error: 'Invalid JSON body' } satisfies AnswerResponse);
    return;
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  const model = body.model || DEFAULT_MODEL;
  const temperature = typeof body.temperature === 'number'
    ? Math.max(0, Math.min(1, body.temperature))
    : 0;

  if (messages.length === 0) {
    res.status(400).json({ ok: false, error: 'Missing messages' } satisfies AnswerResponse);
    return;
  }

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature,
    });
    const text = completion.choices?.[0]?.message?.content ?? '';
    const tokensUsed =
      (completion as any).usage?.total_tokens ??
      (completion as any).usage?.prompt_tokens;
    res.status(200).json({ ok: true, text, tokensUsed } satisfies AnswerResponse);
  } catch (err: any) {
    const message = err?.message || 'Unknown error';
    console.error('[api/answer] error:', message);
    res.status(500).json({ ok: false, error: message } satisfies AnswerResponse);
  }
}


