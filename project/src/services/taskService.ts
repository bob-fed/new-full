import { api } from './api';
import { Task, TaskApplication, TaskFilters, PaginatedResponse } from '../types';

export const taskService = {
  async getTasks(filters?: TaskFilters, page = 1, limit = 10): Promise<PaginatedResponse<Task>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await api.get(`/tasks?${params.toString()}`);
    return response.data;
  },

  async getTask(id: string): Promise<Task> {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  async createTask(taskData: Omit<Task, 'id' | 'clientId' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  async updateTask(id: string, taskData: Partial<Task>): Promise<Task> {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  },

  async deleteTask(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },

  async getMyTasks(role: 'client' | 'provider'): Promise<Task[]> {
    const response = await api.get(`/tasks/my/${role}`);
    return response.data;
  },

  async applyToTask(taskId: string, applicationData: {
    message?: string;
    proposedPrice?: number;
  }): Promise<TaskApplication> {
    const response = await api.post(`/tasks/${taskId}/apply`, applicationData);
    return response.data;
  },

  async getTaskApplications(taskId: string): Promise<TaskApplication[]> {
    const response = await api.get(`/tasks/${taskId}/applications`);
    return response.data;
  },

  async updateApplicationStatus(
    taskId: string,
    applicationId: string,
    status: 'accepted' | 'rejected'
  ): Promise<TaskApplication> {
    const response = await api.put(`/tasks/${taskId}/applications/${applicationId}`, { status });
    return response.data;
  },

  async getCategories() {
    const response = await api.get('/categories');
    return response.data;
  },
};