// Test to verify message persistence according to exact specifications
import { reducer } from './machine';

describe('Message Persistence - Exact Spec Implementation', () => {
  const initialState = {
    messages: [],
    composingAI: '',
    ui: 'idle' as const,
  };

  test('ADD_USER appends final user message and sets ui to ai_response_typing', () => {
    const [state, ctx] = reducer('idle', initialState, {
      type: 'ADD_USER',
      id: 'user-1',
      text: 'Hello'
    });
    
    expect(ctx.messages).toHaveLength(1);
    expect(ctx.messages[0]).toEqual({
      id: 'user-1',
      role: 'user',
      text: 'Hello',
      status: 'final'
    });
    expect(ctx.ui).toBe('ai_response_typing');
    expect(ctx.composingAI).toBe('');
  });

  test('AI_START prepares for stream without affecting messages', () => {
    const [state, ctx] = reducer('ai_response_typing', initialState, {
      type: 'AI_START',
      id: 'ai-1'
    });
    
    expect(ctx.messages).toHaveLength(0);
    expect(ctx.composingAI).toBe('');
    expect(ctx.ui).toBe('ai_response_typing');
  });

  test('AI_DELTA concatenates to composingAI without affecting messages', () => {
    const stateWithComposing = {
      ...initialState,
      composingAI: 'Hello',
      ui: 'ai_response_typing' as const
    };
    
    const [state, ctx] = reducer('ai_response_typing', stateWithComposing, {
      type: 'AI_DELTA',
      text: ' world'
    });
    
    expect(ctx.messages).toHaveLength(0);
    expect(ctx.composingAI).toBe('Hello world');
  });

  test('AI_FINAL appends AI message with composingAI text and sets ui to ai_response_playing', () => {
    const stateWithComposing = {
      ...initialState,
      composingAI: 'Hello world',
      ui: 'ai_response_typing' as const
    };
    
    const [state, ctx] = reducer('ai_response_typing', stateWithComposing, {
      type: 'AI_FINAL',
      id: 'ai-1',
      text: 'fallback text'
    });
    
    expect(ctx.messages).toHaveLength(1);
    expect(ctx.messages[0]).toEqual({
      id: 'ai-1',
      role: 'ai',
      text: 'Hello world', // Uses composingAI, not fallback
      status: 'final'
    });
    expect(ctx.composingAI).toBe('');
    expect(ctx.ui).toBe('ai_response_playing');
  });

  test('AUDIO_STARTED makes no changes to messages', () => {
    const stateWithMessages = {
      ...initialState,
      messages: [
        { id: 'msg-1', role: 'user', text: 'Hello', status: 'final' },
        { id: 'msg-2', role: 'ai', text: 'Hi', status: 'final' }
      ]
    };
    
    const [state, ctx] = reducer('ai_response_playing', stateWithMessages, {
      type: 'AUDIO_STARTED'
    });
    
    expect(ctx.messages).toHaveLength(2);
    expect(ctx.messages[0].text).toBe('Hello');
    expect(ctx.messages[1].text).toBe('Hi');
  });

  test('AUDIO_ENDED only sets ui to idle, does not alter messages', () => {
    const stateWithMessages = {
      ...initialState,
      messages: [
        { id: 'msg-1', role: 'user', text: 'Hello', status: 'final' },
        { id: 'msg-2', role: 'ai', text: 'Hi', status: 'final' }
      ],
      ui: 'ai_response_playing' as const
    };
    
    const [state, ctx] = reducer('ai_response_playing', stateWithMessages, {
      type: 'AUDIO_ENDED'
    });
    
    expect(ctx.messages).toHaveLength(2);
    expect(ctx.messages[0].text).toBe('Hello');
    expect(ctx.messages[1].text).toBe('Hi');
    expect(ctx.ui).toBe('idle');
  });

  test('INACTIVITY_TIMEOUT makes no changes to messages', () => {
    const stateWithMessages = {
      ...initialState,
      messages: [
        { id: 'msg-1', role: 'user', text: 'Hello', status: 'final' },
        { id: 'msg-2', role: 'ai', text: 'Hi', status: 'final' }
      ]
    };
    
    const [state, ctx] = reducer('idle', stateWithMessages, {
      type: 'INACTIVITY_TIMEOUT'
    });
    
    expect(ctx.messages).toHaveLength(2);
    expect(ctx.messages[0].text).toBe('Hello');
    expect(ctx.messages[1].text).toBe('Hi');
    expect(ctx.ui).toBe('idle');
  });

  test('RESET is the only action that clears messages', () => {
    const stateWithMessages = {
      ...initialState,
      messages: [
        { id: 'msg-1', role: 'user', text: 'Hello', status: 'final' },
        { id: 'msg-2', role: 'ai', text: 'Hi', status: 'final' }
      ]
    };
    
    const [state, ctx] = reducer('idle', stateWithMessages, {
      type: 'RESET'
    });
    
    expect(ctx.messages).toHaveLength(0);
    expect(ctx.composingAI).toBe('');
    expect(ctx.ui).toBe('idle');
  });

  test('complete conversation flow preserves all messages', () => {
    let state = 'idle';
    let ctx = initialState;
    
    // User message
    [state, ctx] = reducer(state, ctx, { type: 'ADD_USER', id: 'user-1', text: 'Hello' });
    expect(ctx.messages).toHaveLength(1);
    
    // AI start
    [state, ctx] = reducer(state, ctx, { type: 'AI_START', id: 'ai-1' });
    expect(ctx.messages).toHaveLength(1);
    
    // AI delta
    [state, ctx] = reducer(state, ctx, { type: 'AI_DELTA', text: 'Hi' });
    expect(ctx.messages).toHaveLength(1);
    expect(ctx.composingAI).toBe('Hi');
    
    // AI final
    [state, ctx] = reducer(state, ctx, { type: 'AI_FINAL', id: 'ai-1', text: 'fallback' });
    expect(ctx.messages).toHaveLength(2);
    expect(ctx.messages[1].text).toBe('Hi');
    
    // Audio started
    [state, ctx] = reducer(state, ctx, { type: 'AUDIO_STARTED' });
    expect(ctx.messages).toHaveLength(2);
    
    // Audio ended
    [state, ctx] = reducer(state, ctx, { type: 'AUDIO_ENDED' });
    expect(ctx.messages).toHaveLength(2);
    expect(ctx.ui).toBe('idle');
    
    // Inactivity timeout
    [state, ctx] = reducer(state, ctx, { type: 'INACTIVITY_TIMEOUT' });
    expect(ctx.messages).toHaveLength(2);
    
    // Final verification
    expect(ctx.messages[0].text).toBe('Hello');
    expect(ctx.messages[1].text).toBe('Hi');
  });
});
