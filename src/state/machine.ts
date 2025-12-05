export type Msg = { id: string; role: 'user' | 'ai'; text: string; status: 'final' | 'stream'; imageUrl?: string };

export type UIState = 'idle' | 'recording' | 'ai_response_typing' | 'ai_response_playing';

export type AudioQueueItem = { id: string; text: string; url: string };

export type Action =
  | { type: 'MIC_TAP' }
  | { type: 'ADD_USER'; id: string; text: string }
  | { type: 'RECOG_RESULT'; text: string; id?: string }
  | { type: 'RECOG_INTERIM'; text: string; id?: string }
  | { type: 'RECOG_ERROR'; error: string }
  | { type: 'AI_START'; id: string }
  | { type: 'AI_BUFFER_DELTA'; text: string }
  | { type: 'AI_BUFFER_FLUSH' }
  | { type: 'AI_CHUNK_READY'; text: string }
  | { type: 'AUDIO_ENQUEUE'; payload: AudioQueueItem }
  | { type: 'ADD_AI_MESSAGE'; id: string; text: string; imageUrl?: string }
  | { type: 'AUDIO_START'; id: string }
  | { type: 'AI_DELTA'; text: string }
  | { type: 'AI_FINAL'; id: string; text: string; audioUrl?: string }
  | { type: 'AUDIO_STARTED' }
  | { type: 'AUDIO_ENDED' }
  | { type: 'RESET' }
  | { type: 'INACTIVITY_TIMEOUT' };

export interface UIContext {
  messages: Array<{ id: string; role: 'user' | 'ai'; text: string; status: 'final' | 'stream'; imageUrl?: string }>;
  composingAI: string;
  audioQueue: AudioQueueItem[];
  ui: UIState;
  inactivityAt?: number;
}

export function reducer(state: UIState, ctx: UIContext, action: Action): [UIState, UIContext] {
  switch (action.type) {
    case 'MIC_TAP':
      return ['recording', { ...ctx, ui: 'recording' }];
    
    case 'ADD_USER': {
      // ADD_USER(id, text): Append a final user message; set ui = 'ai_response_typing'
      const userMessage = { 
        id: action.id, 
        role: 'user' as const, 
        text: action.text, 
        status: 'final' as const 
      };
      const next: UIContext = {
        ...ctx,
        messages: [...ctx.messages, userMessage],
        composingAI: '',
        ui: 'ai_response_typing'
      };
      return ['ai_response_typing', next];
    }
    
    case 'RECOG_RESULT': {
      // Replace interim message with final message, or add new if no interim exists
      const interimId = action.id || 'interim-speech';
      const filteredMessages = ctx.messages.filter(msg => msg.id !== interimId);
      const finalId = action.id || crypto.randomUUID();
      const userMessage = { 
        id: finalId, 
        role: 'user' as const, 
        text: action.text, 
        status: 'final' as const 
      };
      const next: UIContext = {
        ...ctx,
        messages: [...filteredMessages, userMessage],
        composingAI: '',
        ui: 'ai_response_typing'
      };
      
      // Ensure the message is properly persisted by logging it
      
      return ['ai_response_typing', next];
    }
    
    case 'RECOG_INTERIM': {
      const interimId = action.id || 'interim-speech';
      // Only update interim message if text has actually changed to prevent flashing
      const existingInterim = ctx.messages.find(msg => msg.id === interimId);
      
      // If the text is the same, don't update to prevent flashing
      if (existingInterim && existingInterim.text === action.text) {
        return [state, ctx];
      }
      
      // Remove only the specific interim message (by ID) and add the new one
      const filteredMessages = ctx.messages.filter(msg => msg.id !== interimId);
      const interimMessage = { 
        id: interimId, 
        role: 'user' as const, 
        text: action.text, 
        status: 'stream' as const 
      };
      const next: UIContext = {
        ...ctx,
        messages: [...filteredMessages, interimMessage]
      };
      // eslint-disable-next-line no-console
      console.log('[STATE] RECOG_INTERIM', { interimId, text: action.text.slice(0, 50), messageCount: next.messages.length });
      return [state, next];
    }
    
    case 'RECOG_ERROR': {
      // RECOG_ERROR(): Reset UI to idle when speech recognition fails
      const next: UIContext = {
        ...ctx,
        ui: 'idle'
      };
      return ['idle', next];
    }
    
    case 'AI_START': {
      // AI_START(id): Prepare to receive stream; set composingAI = '', ui = 'ai_response_typing'
      // Also clean up any remaining interim/streaming messages when AI starts
      const filteredMessages = ctx.messages.filter(msg => msg.status !== 'stream');
      const next: UIContext = {
        ...ctx,
        messages: filteredMessages,
        composingAI: '',
        ui: 'ai_response_typing'
      };
      return ['ai_response_typing', next];
    }
    
    case 'AI_BUFFER_DELTA': {
      // AI_BUFFER_DELTA(text): Accumulate in composingAI buffer, but do not render
      const next: UIContext = {
        ...ctx,
        composingAI: ctx.composingAI + action.text
      };
      return ['ai_response_typing', next];
    }
    
    case 'AI_BUFFER_FLUSH': {
      // AI_BUFFER_FLUSH(): Clear the composing buffer after final
      const next: UIContext = {
        ...ctx,
        composingAI: ''
      };
      return [state, next];
    }
    
    case 'AI_CHUNK_READY': {
      // AI_CHUNK_READY(text): Chunk is ready for TTS (handled by side-effect)
      return [state, ctx];
    }
    
    case 'AUDIO_ENQUEUE': {
      // AUDIO_ENQUEUE(payload): Add audio item to queue
      const next: UIContext = {
        ...ctx,
        audioQueue: [...ctx.audioQueue, action.payload]
      };
      return [state, next];
    }
    
    case 'ADD_AI_MESSAGE': {
      // ADD_AI_MESSAGE(id, text, imageUrl?): Append AI message to chat history
      const aiMsg = { 
        id: action.id, 
        role: 'ai' as const, 
        text: action.text, 
        status: 'final' as const,
        imageUrl: (action as any).imageUrl
      };
      const next: UIContext = {
        ...ctx,
        messages: [...ctx.messages, aiMsg]
      };
      return [state, next];
    }
    
    case 'AUDIO_START': {
      // AUDIO_START(id): Set UI to playing state
      const next: UIContext = {
        ...ctx,
        ui: 'ai_response_playing'
      };
      return ['ai_response_playing', next];
    }
    
    case 'AI_DELTA': {
      // AI_DELTA(text): Concatenate to composingAI (legacy support)
      const next: UIContext = {
        ...ctx,
        composingAI: ctx.composingAI + action.text
      };
      return ['ai_response_typing', next];
    }
    
    case 'AI_FINAL': {
      // AI_FINAL(id, text): Append one AI message with text = (composingAI || text), status = 'final'; set composingAI = '', ui = 'ai_response_playing'
      const finalText = ctx.composingAI.length ? ctx.composingAI : action.text;
      const aiMsg = { 
        id: action.id, 
        role: 'ai' as const, 
        text: finalText, 
        status: 'final' as const 
      };
      const next: UIContext = {
        ...ctx,
        messages: [...ctx.messages, aiMsg],
        composingAI: '',
        ui: 'ai_response_playing'
      };
      return ['ai_response_playing', next];
    }
    
    case 'AUDIO_STARTED': {
      // AUDIO_STARTED(): No changes to messages
      return [state, ctx];
    }
    
    case 'AUDIO_ENDED': {
      // AUDIO_ENDED(): Only set ui = 'idle'. Do not alter messages
      const next: UIContext = {
        ...ctx,
        ui: 'idle',
        inactivityAt: Date.now() + 60000
      };
      return ['idle', next];
    }
    
    case 'INACTIVITY_TIMEOUT': {
      // INACTIVITY_TIMEOUT(): No changes to messages
      return ['idle', { ...ctx, ui: 'idle' }];
    }
    
    case 'RESET': {
      // RESET(): Clear conversation but preserve Jason's initial messages
      // Keep only AI messages that are part of the initial story (not conversation responses)
      const initialMessages = ctx.messages.filter(msg => 
        msg.role === 'ai' && 
        (msg.id === 'initial-1' || msg.id === 'initial-2' || msg.id === 'initial-3')
      );
      
      return ['idle', { 
        messages: initialMessages, 
        composingAI: '', 
        audioQueue: [],
        ui: 'idle' 
      }];
    }
    
    default:
      return [state, ctx];
  }
}

