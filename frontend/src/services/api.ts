import { QueryClient } from '@tanstack/react-query';
import type { Agent, Event } from '@/types';

const API_BASE = 'http://localhost:8080'; // API Gateway

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

// Типы для Backend ответов
interface BackendAgent {
  id: string;
  name: string;
  personality: string;
  mood: string;
  position: { x: number; y: number };
  memories: Array<{ text: string; timestamp: string }>;
  plans: Array<{ description: string }>;
}

interface BackendNews {
  id: number;
  content: string;
  status: string;
  createdAt: string;
}

// API методы
export const api = {
  // ========== AGENTS ==========
  
  async getAgents(): Promise<BackendAgent[]> {
    try {
      const response = await fetch(`${API_BASE}/agents`);
      if (!response.ok) throw new Error('Failed to fetch agents');
      return response.json();
    } catch (error) {
      console.error('❌ Error fetching agents:', error);
      throw error;
    }
  },

  async getAgent(id: string): Promise<BackendAgent> {
    try {
      const response = await fetch(`${API_BASE}/agent/${id}`);
      if (!response.ok) throw new Error('Failed to fetch agent');
      return response.json();
    } catch (error) {
      console.error(`❌ Error fetching agent ${id}:`, error);
      throw error;
    }
  },

  // ========== NEWS ==========
  
  async getNews(): Promise<BackendNews[]> {
    try {
      const response = await fetch(`${API_BASE}/news`);
      if (!response.ok) throw new Error('Failed to fetch news');
      return response.json();
    } catch (error) {
      console.error('❌ Error fetching news:', error);
      throw error;
    }
  },

  // ========== MESSAGES ==========
  
  async sendMessageToAgent(agentId: string, message: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/agent/${agentId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      if (!response.ok) throw new Error('Failed to send message');
      console.log('✅ Message sent to agent:', agentId);
    } catch (error) {
      console.error('❌ Error sending message:', error);
      throw error;
    }
  },
};

// ========== MAPPERS (Backend → Frontend) ==========

export const mappers = {
  // Маппинг агента из Backend в Frontend формат
  mapAgent(backendAgent: BackendAgent): Agent {
    return {
      id: backendAgent.id,
      name: backendAgent.name,
      personality: backendAgent.personality,
      mood: this.mapMood(backendAgent.mood),
      memories: backendAgent.memories?.map(m => m.text) || [],
      plans: backendAgent.plans?.map(p => p.description) || [],
      position: backendAgent.position || { x: 100, y: 100 },
    };
  },

  // Маппинг настроения
  mapMood(backendMood: string): Agent['mood'] {
    const moodMap: Record<string, Agent['mood']> = {
      'HAPPY': 'happy',
      'SAD': 'sad',
      'ANGRY': 'angry',
      'NEUTRAL': 'neutral',
      'EXCITED': 'excited',
      'TIRED': 'tired',
    };
    return moodMap[backendMood] || 'neutral';
  },

  // Маппинг новости в событие
  mapNewsToEvent(news: BackendNews): Event {
    return {
      id: `news-${news.id}`,
      timestamp: new Date(news.createdAt).getTime(),
      type: 'global',
      message: news.content,
    };
  },
};
