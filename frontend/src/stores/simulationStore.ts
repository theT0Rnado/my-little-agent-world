import { create } from 'zustand';
import type { Agent, Event, Relation, SimulationState } from '@/types';

// Начальное состояние - пустое, данные загрузятся из Backend
const initialAgents: Agent[] = [];
const initialEvents: Event[] = [
  { 
    id: 'e-init', 
    timestamp: Date.now(), 
    type: 'global', 
    message: '🚀 Система запускается... Загрузка данных из Backend...' 
  }
];
const initialRelations: Relation[] = [];

export const useSimulationStore = create<SimulationState>((set, get) => ({
  agents: initialAgents,
  events: initialEvents,
  relations: initialRelations,
  isRunning: false,
  speed: 1,
  selectedAgentId: null,

  addEvent: (event) => set((state) => {
    // Генерируем уникальный ID с использованием timestamp + случайного числа
    const uniqueId = `e${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      events: [
        {
          ...event,
          id: uniqueId,
          timestamp: event.timestamp || Date.now()
        },
        ...state.events
      ].slice(0, 100)
    };
  }),

  updateAgentMood: (id, mood) => set((state) => ({
    agents: state.agents.map(agent =>
      agent.id === id ? { ...agent, mood } : agent
    )
  })),

  updateAgentMessage: (id, message) => set((state) => ({
    agents: state.agents.map(agent =>
      agent.id === id ? { ...agent, currentMessage: message, messageTimestamp: Date.now() } : agent
    )
  })),

  clearAgentMessage: (id) => set((state) => ({
    agents: state.agents.map(agent =>
      agent.id === id ? { ...agent, currentMessage: undefined, messageTimestamp: undefined } : agent
    )
  })),

  updateRelation: (source, target, value) => set((state) => ({
    relations: state.relations.map(rel =>
      (rel.source === source && rel.target === target) ||
      (rel.source === target && rel.target === source)
        ? { ...rel, value }
        : rel
    )
  })),

  setSpeed: (speed) => set({ speed }),

  setRunning: (isRunning) => set({ isRunning }),

  selectAgent: (selectedAgentId) => set({ selectedAgentId }),

  updateAgentPosition: (id, position) => set((state) => ({
    agents: state.agents.map(agent =>
      agent.id === id ? { ...agent, position } : agent
    )
  })),

  // ========== BACKEND INTEGRATION METHODS ==========
  // Эти методы готовы для подключения к Backend
  // Пока используются моки, но инфраструктура готова

  // Заменить всех агентов (из Backend)
  setAgents: (agents: Agent[]) => {
    // Генерируем связи между агентами
    const relations: Relation[] = [];
    
    for (let i = 0; i < agents.length; i++) {
      for (let j = i + 1; j < agents.length; j++) {
        // Создаём связь между каждой парой агентов
        // Значение от -1 до 1 (случайное для начала)
        const value = Math.random() * 2 - 1; // от -1 до 1
        
        relations.push({
          id: `r-${agents[i].id}-${agents[j].id}`,
          source: agents[i].id,
          target: agents[j].id,
          value: parseFloat(value.toFixed(2))
        });
      }
    }
    
    set({ agents, relations });
    console.log(`✅ Set ${agents.length} agents with ${relations.length} relations`);
  },

  // Обновить одного агента (из WebSocket)
  updateAgent: (agent: Agent) => set((state) => ({
    agents: state.agents.map(a => a.id === agent.id ? agent : a)
  })),

  // Добавить агента (если придёт новый)
  addAgent: (agent: Agent) => set((state) => ({
    agents: [...state.agents, agent]
  })),

  // Удалить агента
  removeAgent: (id: string) => set((state) => ({
    agents: state.agents.filter(a => a.id !== id)
  })),

  // Синхронизация с Backend (вызывается при старте)
  syncWithBackend: async () => {
    try {
      // Пока закомментировано - используем моки
      // const backendAgents = await api.getAgents();
      // const mappedAgents = backendAgents.map(mappers.mapAgent);
      // set({ agents: mappedAgents });
      
      console.log('🔄 Backend sync ready (using mocks for now)');
    } catch (error) {
      console.error('❌ Failed to sync with backend:', error);
    }
  },
}));
