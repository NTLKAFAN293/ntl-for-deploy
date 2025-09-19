import { type BotPublic, type BotFile, type BotLog } from "@shared/schema";

const API_BASE = '/api';

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || 'Request failed');
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Bot operations
  async getBots(): Promise<BotPublic[]> {
    return this.request<BotPublic[]>('/bots');
  }

  async getBot(id: string): Promise<BotPublic> {
    return this.request<BotPublic>(`/bots/${id}`);
  }

  async createBot(data: { name: string; token: string; config?: any }): Promise<BotPublic> {
    return this.request<BotPublic>('/bots', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBot(id: string, data: { name?: string; config?: any }): Promise<BotPublic> {
    return this.request<BotPublic>(`/bots/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async updateBotToken(id: string, token: string): Promise<BotPublic> {
    return this.request<BotPublic>(`/bots/${id}/token`, {
      method: 'PATCH',
      body: JSON.stringify({ token }),
    });
  }

  async startBot(id: string): Promise<BotPublic> {
    return this.request<BotPublic>(`/bots/${id}/start`, {
      method: 'POST',
    });
  }

  async stopBot(id: string): Promise<BotPublic> {
    return this.request<BotPublic>(`/bots/${id}/stop`, {
      method: 'POST',
    });
  }

  async deleteBot(id: string): Promise<void> {
    return this.request<void>(`/bots/${id}`, {
      method: 'DELETE',
    });
  }

  // File operations
  async getBotFiles(botId: string): Promise<BotFile[]> {
    return this.request<BotFile[]>(`/bots/${botId}/files`);
  }

  async createBotFile(data: {
    botId: string;
    name: string;
    content?: string;
    language?: 'javascript' | 'python' | 'json';
  }): Promise<BotFile> {
    return this.request<BotFile>(`/bots/${data.botId}/files`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBotFile(id: string, data: { content?: string; isDirty?: boolean }): Promise<BotFile> {
    return this.request<BotFile>(`/files/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteBotFile(id: string): Promise<void> {
    return this.request<void>(`/files/${id}`, {
      method: 'DELETE',
    });
  }

  // Log operations
  async getBotLogs(botId: string, limit?: number): Promise<BotLog[]> {
    const query = limit ? `?limit=${limit}` : '';
    return this.request<BotLog[]>(`/bots/${botId}/logs${query}`);
  }

  async clearBotLogs(botId: string): Promise<void> {
    return this.request<void>(`/bots/${botId}/logs`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();