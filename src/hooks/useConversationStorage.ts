// src/hooks/useConversationStorage.ts
import { useEffect, useCallback } from 'react';
import { supabaseStorage, Conversation } from '../services/supabaseStorage';
import { UIContext } from '../state/machine';

export function useConversationStorage(ctx: UIContext, enabled: boolean = true) {
  // Auto-save messages to storage
  useEffect(() => {
    if (!enabled) return;
    const saveMessage = async () => {
      if (ctx.messages.length > 0) {
        // Get the last message
        const lastMessage = ctx.messages[ctx.messages.length - 1];
        
        // Only save final messages (not interim/streaming)
        if (lastMessage.status === 'final') {
          try {
            // Get current conversation or create new one
            const currentConversation = await supabaseStorage.getCurrentConversation();
            if (currentConversation) {
              await supabaseStorage.addMessage(currentConversation.id, {
                id: lastMessage.id,
                role: lastMessage.role,
                text: lastMessage.text,
                status: lastMessage.status
              });
            } else {
              // Create new conversation and save message
              const newConversation = await supabaseStorage.createConversation();
              await supabaseStorage.addMessage(newConversation.id, {
                id: lastMessage.id,
                role: lastMessage.role,
                text: lastMessage.text,
                status: lastMessage.status
              });
            }
          } catch (error) {
            console.error('Error saving message to Supabase:', error);
          }
        }
      }
    };

    saveMessage();
  }, [ctx.messages, enabled]);

  // Load conversation from storage
  const loadConversation = useCallback((conversation: Conversation) => {
    // This would need to be integrated with your state management
    // You'd need to dispatch actions to load the conversation
    return conversation;
  }, []);

  // Create new conversation
  const createNewConversation = useCallback(async () => {
    if (!enabled) return { id: 'disabled', title: '', created_at: '', last_updated: '', messages: [] } as any;
    return await supabaseStorage.createConversation();
  }, [enabled]);

  // Get current conversation
  const getCurrentConversation = useCallback(async () => {
    if (!enabled) return null;
    return await supabaseStorage.getCurrentConversation();
  }, [enabled]);

  // Export current conversation
  const exportCurrentConversation = useCallback(async () => {
    if (!enabled) return;
    const current = await getCurrentConversation();
    if (current) {
      const json = await supabaseStorage.exportConversation(current.id);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversation_${current.id}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [getCurrentConversation, enabled]);

  return {
    loadConversation,
    createNewConversation,
    getCurrentConversation,
    exportCurrentConversation
  };
}
