# Digital Shadow – VPRO Medialab (Society 5.0)

Single-screen interactive chat POC built with React + TypeScript + Tailwind.

## Setup

1) Install Node 18+ and pnpm or npm

2) Install deps

```bash
pnpm install
# or
npm install
```

3) Run the dev server

```bash
pnpm dev
# or
npm run dev
```

This starts Vite on http://localhost:3000 and proxies API calls to http://localhost:3000.

## Backend contracts

- POST `/chat` body `{ mode: "stream"|"single", message: string }`
  - SSE-style body for `mode=stream` with lines:
    - `data: {"type":"delta","text":"..."}`
    - `data: {"type":"final","text":"...","audioUrl":"https://..."}` (MP3 24kHz)
- Optional POST `/stt` with audio blob → `{ text }`
- Optional POST `/tts` with `{ text }` → `{ audioUrl }`

## Notes

- Web Speech API (nl-NL) is used client-side for STT; Whisper fallback route is present in code-level flags but off by default.
- Audio is backend-generated (e.g. ElevenLabs) and returned as a public/proxied URL.
- iOS Safari supported: trigger mic via user gesture to satisfy autoplay policies.



test test test