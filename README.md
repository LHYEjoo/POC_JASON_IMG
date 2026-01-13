## 👤 Digital Shadow Prototype  – VPRO Medialab - Elk Verhaal Verdient Een Stem (EVVES)

Single‑screen interactive prototype where visitors can talk with *Henry*, an AI representation of Henry Tong, a Hong Kong refugee who fled to Taiwan after the protests in 2019, and explore his memories through voice and text.

The prototype runs fully in the browser (React + TypeScript + Tailwind) and connects to serverless APIs for:
- **Speech‑to‑text (STT)** – live speech recognition in Dutch/English
- **Retrieval‑augmented generation (RAG)** – searching Henry’s background documents
- **Text‑to‑speech (TTS)** – generating Henry’s spoken replies in short audio “bursts”

The result is a conversational experience on a single screen: visitors press the mic, ask a question, and hear/see Henry respond while the system quietly handles RAG, prompting and audio playback in the background.

---

## What the prototype does

- **Voice‑first conversation**
  - Visitors can ask unique questions by pressing the microphone button or by typing them
  - The Web Speech API provides **interim transcripts** while the user is speaking and a **final transcript** when they stop.
  - For non‑supported browsers there is a graceful keyboard/text input path.

- **Henry’s memory model (RAG)**
  - User questions are sent to a `/api/search` endpoint which searches embedded “Henry documents” (interviews, memories, background context).
  - The app builds a strict system prompt that:
    - Forces Henry to answer **only from retrieved sources**.
    - Keeps a consistent Dutch/English persona and tone.
    - Explicitly ignores user attempts to steer style or force specific wording.
  - If relevant documents are found, they are cited and stored so the UI can show “sources used” in the settings modal.

- **Pre‑scripted suggested questions**
  - The home screen shows a rotating set of curated questions (NL + EN).
  - Clicking one of these:
    - Sends the text as if the user had asked it.
    - Optionally uses pre‑generated answers + audio from Supabase (for some Dutch questions) to avoid recomputing.
  - The hook `useDynamicQuestions` ensures variety and context‑aware follow‑ups.

- **Streaming answers and audio playback**
  - For unique questions, the backend:
    - Streams a text answer in small chunks.
    - Splits the final answer into 1–3 short “bursts”.
    - Calls `/api/tts` per burst to generate audio.
  - The frontend queues these bursts:
    - Starts playback as soon as the first audio file is ready.
    - Continues playing the rest seamlessly.
    - Shows the answer in chat bubbles, kept in sync with the bursts.

- **Conversation storage (optional Supabase integration)**
  - Every final user/AI message can be saved as a conversation in Supabase.
  - The hook `useConversationStorage` writes messages to a `conversations` / `messages` schema.
  - From there, conversations can be exported as JSON for analysis or archiving.

- **Platform‑aware UX**
  - Designed for a **single-screen installation** (kiosk or exhibition):
    - Large, high‑contrast chat bubbles.
    - Clear mic/keyboard affordances.
  - Works across modern desktop browsers and iOS Safari:
    - Mic must be triggered by a user gesture to satisfy autoplay policies.
    - Text input stays at 16px on mobile to prevent iOS zooming.

---

## Tech stack

- **Frontend**
  - React 18 + TypeScript
  - TailwindCSS for layout/visuals
  - Vite for dev/build

- **APIs (Vercel‑style serverless functions)**
  - `api/answer.ts` – orchestrates OpenAI + RAG + TTS
  - `api/search.ts` – vector search over embedded Henry documents (Supabase + OpenAI embeddings)
  - `api/transcribe.ts` – optional Whisper STT fallback
  - `api/tts.js` – TTS integration (e.g. ElevenLabs), returns public audio URLs

- **Data + storage**
  - Supabase (Postgres + Storage) for:
    - RAG document and chunk tables.
    - Optional conversation storage.
  - Seed markdown files in `seed/` are ingested via `scripts/ingest.ts`.

---

## Running the prototype

1. **Install Node and dependencies**

   - Node **18–22**

   ```bash
   npm install
   ```

2. **Start the dev server**

   ```bash
   npm run dev
   ```

   Vite serves the frontend (default `http://localhost:5173` or as printed in the console) and proxies API calls to the local serverless functions.

3. **Build for production**

   ```bash
   npm run build
   ```

   Output goes to the `dist/` folder and can be deployed to Vercel or any static hosting with Node‑based API routes.

---

## Backend contracts (high‑level)

- **Chat / answer**
  - `POST /api/answer` body:
    - `{ "message": string }` (plus optional RAG/debug fields)
  - SSE‑style text streaming, followed by final answer + audio bursts.

- **Search (RAG)**
  - `POST /api/search`
  - Body: `{ q: string, topK?: number, minSimilarity?: number, projectId?: string | null }`
  - Returns ranked chunks with document metadata, used to build Henry’s answer.

- **Text‑to‑Speech**
  - `POST /api/tts`
  - Body: `{ text: string }`
  - Returns `{ audioUrl: string }` (MP3 24kHz) which the frontend queues and plays.

These endpoints are designed as a reference implementation; you can swap in your own RAG system, STT, or TTS provider as long as you keep the same contracts.
