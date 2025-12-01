# Platform Functionaliteit Check

## ✅ Wat de code doet op elk platform:

### 🌐 **Web (Chrome/Edge/Firefox)**
1. **Live Preview (Interim Results)**:
   - ✅ Web Speech API geeft interim results tijdens spreken
   - ✅ `RECOG_INTERIM` wordt gedispatched → message met `status: 'stream'` verschijnt
   - ✅ ChatBubble toont streaming message met opacity effect
   - ✅ Text wordt real-time geüpdatet terwijl je spreekt

2. **Final Transcription**:
   - ✅ Whisper STT (via `/api/transcribe`) geeft accurate final result
   - ✅ Web Speech result wordt als fallback opgeslagen
   - ✅ `RECOG_RESULT` wordt gedispatched → message wordt `status: 'final'`

3. **Performance**:
   - ✅ TTS bursts worden parallel gegenereerd
   - ✅ Eerste burst start direct zodra die klaar is (niet wachten op alle)
   - ✅ Audio queue speelt bursts sequentieel af

### 📱 **iOS Safari**
1. **Live Preview (Interim Results)**:
   - ✅ Web Speech API geeft interim results (geen Whisper op iOS)
   - ✅ `RECOG_INTERIM` wordt gedispatched → message met `status: 'stream'` verschijnt
   - ✅ ChatBubble toont streaming message
   - ✅ Text wordt real-time geüpdatet

2. **Final Transcription**:
   - ✅ Alleen Web Speech wordt gebruikt (Whisper wordt overgeslagen)
   - ✅ Web Speech final result wordt direct gebruikt
   - ✅ `RECOG_RESULT` wordt gedispatched → message wordt `status: 'final'`

3. **Performance**:
   - ✅ TTS bursts worden parallel gegenereerd
   - ✅ Eerste burst start direct zodra die klaar is
   - ✅ Audio queue speelt bursts sequentieel af

4. **iOS-specifieke fixes**:
   - ✅ Grammars worden niet gezet (voorkomt errors)
   - ✅ Langere timeout (12s vs 8s)
   - ✅ `interimResults = true` expliciet gezet

### 🤖 **Android Chrome**
1. **Live Preview (Interim Results)**:
   - ✅ Web Speech API geeft interim results tijdens spreken
   - ✅ `RECOG_INTERIM` wordt gedispatched → message met `status: 'stream'` verschijnt
   - ✅ ChatBubble toont streaming message
   - ✅ Text wordt real-time geüpdatet

2. **Final Transcription**:
   - ✅ Whisper STT (via `/api/transcribe`) geeft accurate final result
   - ✅ Web Speech result wordt als fallback opgeslagen
   - ✅ `RECOG_RESULT` wordt gedispatched → message wordt `status: 'final'`

3. **Performance**:
   - ✅ TTS bursts worden parallel gegenereerd
   - ✅ Eerste burst start direct zodra die klaar is
   - ✅ Audio queue speelt bursts sequentieel af

## 🔍 Code Flow:

### Interim Results Flow:
```
User spreekt
  ↓
Web Speech API → onresult (interim) 
  ↓
setInterim(interimTranscript) 
  ↓
useEffect triggert → dispatch RECOG_INTERIM
  ↓
State machine → message met status: 'stream'
  ↓
ChatBubble rendert met opacity effect
```

### Final Result Flow:
```
User stopt met spreken
  ↓
Web Speech API → onresult (final) OF Whisper → final text
  ↓
dispatch RECOG_RESULT
  ↓
State machine → message wordt status: 'final'
  ↓
AI response start → RAG → TTS bursts parallel
  ↓
Eerste burst klaar → audio start direct
```

## ⚠️ Mogelijke problemen:

1. **Interim results niet zichtbaar**:
   - Check: `stt.interim` wordt gezet in `useRobustSpeechRecognition`
   - Check: `useEffect` in `DigitalShadow.tsx` triggert op `stt.interim` changes
   - Check: `RECOG_INTERIM` wordt correct gedispatched
   - Check: Message heeft `status: 'stream'` in state machine

2. **Performance issues**:
   - Check: TTS bursts worden parallel gegenereerd (Promise.all zonder await)
   - Check: Audio queue start direct wanneer eerste burst klaar is
   - Check: Network latency naar `/api/tts` en `/api/answer`

3. **iOS-specifieke problemen**:
   - Check: Grammars worden niet gezet (voorkomt errors)
   - Check: `interimResults = true` is expliciet gezet
   - Check: Timeout is 12s (langer dan andere platforms)

