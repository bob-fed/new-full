import { api } from './api';
import { Message } from '../types';

export const chatService = {
  async getMessages(taskId: string): Promise<Message[]> {
    const response = await api.get(`/messages/${taskId}`);
    return response.data;
  },

  async sendMessage(messageData: {
    taskId: string;
    receiverId: string;
    content: string;
  }): Promise<Message> {
    const response = await api.post('/messages', messageData);
    return response.data;
  },

  async markAsRead(messageId: string): Promise<void> {
    await api.put(`/messages/${messageId}/read`);
  },

  async getConversations(): Promise<any[]> {
    const response = await api.get('/messages/conversations');
    return response.data;
  },
};