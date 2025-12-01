// src/services/supabaseStorage.ts
// Supabase-integrated conversation storage

import { supabase } from '../lib/supabase';

// Define types locally
export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  last_updated: string;
  messages: Array<{
    id: string;
    role: 'user' | 'ai';
    text: string;
    status: 'final' | 'stream';
    timestamp: string;
  }>;
  session_id?: string;
  ip_address?: string;
}

export interface ConversationSummary {
  id: string;
  title: string;
  created_at: string;
  last_updated: string;
  message_count: number;
  first_question?: string;
}

class SupabaseStorage {
  // Save conversation to Supabase
  async saveConversation(conversation: Conversation): Promise<void> {
    try {
      // Start a transaction
      const { error: conversationError } = await supabase
        .from('conversations')
        .upsert({
          id: conversation.id,
          title: conversation.title,
          created_at: conversation.created_at,
          last_updated: conversation.last_updated,
          session_id: conversation.session_id,
          ip_address: conversation.ip_address
        });

      if (conversationError) {
        throw new Error(`Failed to save conversation: ${conversationError.message}`);
      }

      // Save messages
      if (conversation.messages.length > 0) {
        const messagesData = conversation.messages.map(msg => ({
          id: msg.id,
          conversation_id: conversation.id,
          role: msg.role,
          text: msg.text,
          status: msg.status,
          timestamp: msg.timestamp
        }));

        const { error: messagesError } = await supabase
          .from('messages')
          .upsert(messagesData);

        if (messagesError) {
          throw new Error(`Failed to save messages: ${messagesError.message}`);
        }
      }
    } catch (error) {
      console.error('Error saving conversation to Supabase:', error);
      throw error;
    }
  }

  // Get all conversations
  async getAllConversations(): Promise<ConversationSummary[]> {
    try {
      const { data, error } = await supabase
        .from('conversation_summaries')
        .select('*')
        .order('last_updated', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch conversations: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching conversations from Supabase:', error);
      return [];
    }
  }

  // Get specific conversation with messages
  async getConversation(id: string): Promise<Conversation | null> {
    try {
      // Get conversation
      const { data: conversationData, error: conversationError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', id)
        .single();

      if (conversationError) {
        if (conversationError.code === 'PGRST116') return null; // Not found
        throw new Error(`Failed to fetch conversation: ${conversationError.message}`);
      }

      // Get messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', id)
        .order('timestamp', { ascending: true });

      if (messagesError) {
        throw new Error(`Failed to fetch messages: ${messagesError.message}`);
      }

      return {
        id: conversationData.id,
        title: conversationData.title,
        created_at: conversationData.created_at,
        last_updated: conversationData.last_updated,
        messages: messagesData.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          text: msg.text,
          status: msg.status,
          timestamp: msg.timestamp
        })),
        session_id: conversationData.session_id,
        ip_address: conversationData.ip_address
      };
    } catch (error) {
      console.error('Error fetching conversation from Supabase:', error);
      return null;
    }
  }

  // Add message to existing conversation
  async addMessage(conversationId: string, message: Omit<Conversation['messages'][0], 'timestamp'>): Promise<void> {
    try {
      const messageData = {
        id: message.id,
        conversation_id: conversationId,
        role: message.role,
        text: message.text,
        status: message.status,
        timestamp: new Date().toISOString()
      };

      const { error } = await supabase
        .from('messages')
        .upsert(messageData);

      if (error) {
        throw new Error(`Failed to add message: ${error.message}`);
      }
    } catch (error) {
      console.error('Error adding message to Supabase:', error);
      throw error;
    }
  }

  // Search conversations
  async searchConversations(query: string): Promise<ConversationSummary[]> {
    try {
      const { data, error } = await supabase
        .from('conversation_summaries')
        .select('*')
        .or(`title.ilike.%${query}%,first_question.ilike.%${query}%`)
        .order('last_updated', { ascending: false });

      if (error) {
        throw new Error(`Failed to search conversations: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error searching conversations in Supabase:', error);
      return [];
    }
  }

  // Delete conversation
  async deleteConversation(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete conversation: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting conversation from Supabase:', error);
      throw error;
    }
  }

  // Get analytics
  async getAnalytics(): Promise<{
    totalConversations: number;
    totalMessages: number;
    averageMessagesPerConversation: number;
    mostCommonQuestions: string[];
    conversationsByDate: Array<{ date: string; count: number }>;
  }> {
    try {
      // Get total conversations
      const { count: totalConversations, error: conversationsError } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true });

      if (conversationsError) {
        throw new Error(`Failed to get conversation count: ${conversationsError.message}`);
      }

      // Get total messages
      const { count: totalMessages, error: messagesError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true });

      if (messagesError) {
        throw new Error(`Failed to get message count: ${messagesError.message}`);
      }

      // Get most common questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('messages')
        .select('text')
        .eq('role', 'user');

      if (questionsError) {
        throw new Error(`Failed to get questions: ${questionsError.message}`);
      }

      const questionCounts = questionsData.reduce((acc: Record<string, number>, msg: any) => {
        acc[msg.text] = (acc[msg.text] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const mostCommonQuestions = Object.entries(questionCounts)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 10)
        .map(([question]) => question);

      // Get conversations by date
      const { data: dateData, error: dateError } = await supabase
        .from('conversations')
        .select('created_at');

      if (dateError) {
        throw new Error(`Failed to get date data: ${dateError.message}`);
      }

      const conversationsByDate = dateData.reduce((acc: Record<string, number>, conv: any) => {
        const date = conv.created_at.split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalConversations: totalConversations || 0,
        totalMessages: totalMessages || 0,
        averageMessagesPerConversation: (totalConversations || 0) > 0 ? (totalMessages || 0) / (totalConversations || 0) : 0,
        mostCommonQuestions,
        conversationsByDate: Object.entries(conversationsByDate).map(([date, count]) => ({ date, count: count as number }))
      };
    } catch (error) {
      console.error('Error getting analytics from Supabase:', error);
      throw error;
    }
  }

  // Export conversation as JSON
  async exportConversation(id: string): Promise<string> {
    const conversation = await this.getConversation(id);
    if (!conversation) throw new Error('Conversation not found');
    
    return JSON.stringify(conversation, null, 2);
  }

  // Create new conversation
  async createConversation(): Promise<Conversation> {
    const id = `conv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const now = new Date().toISOString();
    
    const conversation: Conversation = {
      id,
      title: 'New Conversation',
      created_at: now,
      last_updated: now,
      messages: []
    };

    await this.saveConversation(conversation);
    return conversation;
  }

  // Get current conversation (mock implementation)
  async getCurrentConversation(): Promise<Conversation | null> {
    // This would need to be implemented based on your session management
    // For now, return null to create new conversations
    return null;
  }
}

// Export singleton instance
export const supabaseStorage = new SupabaseStorage();
