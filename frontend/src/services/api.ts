import { QueryClient } from '@tanstack/react-query';
import type { Agent, Event } from '@/types';

// Используем относительные пути - Vite прокси перенаправит на нужные сервисы
// /api/agent → http://localhost:8081/api/agent
// /api/v1/news → http://localhost:8082/api/v1/news

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
      // Через Vite proxy → Agent Service (8081)
      const response = await fetch('/api/agent');
      if (!response.ok) throw new Error('Failed to fetch agents');
      return response.json();
    } catch (error) {
      console.error('❌ Error fetching agents:', error);
      throw error;
    }
  },

  async getAgent(id: string): Promise<BackendAgent> {
    try {
      // Через Vite proxy → Agent Service (8081)
      const response = await fetch(`/api/agent/${id}`);
      if (!response.ok) throw new Error('Failed to fetch agent');
      return response.json();
    } catch (error) {
      console.error(`❌ Error fetching agent ${id}:`, error);
      throw error;
    }
  },

  // ========== NEWS (World Service) ==========
  
  async getNews(): Promise<BackendNews[]> {
    try {
      // Через Vite proxy → World Service (8082)
      const response = await fetch('/api/v1/news');
      if (!response.ok) throw new Error('Failed to fetch news');
      const news = await response.json();
      console.log('📰 Fetched news from world-service:', news.length);
      return news;
    } catch (error) {
      console.error('❌ Error fetching news:', error);
      throw error;
    }
  },

  async getNewsById(id: number): Promise<BackendNews> {
    try {
      // Через Vite proxy → World Service (8082)
      const response = await fetch(`/api/v1/news/${id}`);
      if (!response.ok) throw new Error('Failed to fetch news');
      return response.json();
    } catch (error) {
      console.error(`❌ Error fetching news ${id}:`, error);
      throw error;
    }
  },

  // ========== MESSAGES ==========
  
  async sendMessageToAgent(agentId: string, message: string): Promise<void> {
    try {
      // Через Vite proxy → Agent Service (8081)
      const response = await fetch(`/api/agent/${agentId}/message`, {
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
    // Проверка что новость не пустая
    if (!news.content || news.content.trim() === '') {
      console.warn('⚠️ Empty news content detected:', news);
    }
    
    return {
      id: `news-${news.id}`,
      timestamp: new Date(news.createdAt).getTime(),
      type: 'global',
      message: news.content ? `🌍 ${news.content}` : '🌍 [Пустая новость]',
    };
  },
};
