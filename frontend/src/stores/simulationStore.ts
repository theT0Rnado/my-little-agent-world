import { create } from 'zustand';
import type { Agent, Event, Relation, SimulationState } from '@/types';

// Mock agents
const mockAgents: Agent[] = [
  {
    id: '1',
    name: 'Nova',
    personality: 'Любопытный исследователь, всегда ищет новые знания',
    mood: 'excited',
    memories: ['Нашёл странный артефакт', 'Встретил дружелюбного агента', 'Изучил древние руины'],
    plans: ['Исследовать северные земли', 'Найти союзников', 'Изучить артефакт'],
    position: { x: 100, y: 100 }
  },
  {
    id: '2',
    name: 'Cipher',
    personality: 'Аналитик и стратег, предпочитает планировать',
    mood: 'neutral',
    memories: ['Разработал новую стратегию', 'Проанализировал данные', 'Предсказал событие'],
    plans: ['Оптимизировать ресурсы', 'Создать карту территории', 'Обучить других'],
    position: { x: 250, y: 150 }
  },
  {
    id: '3',
    name: 'Echo',
    personality: 'Эмпат и дипломат, помогает другим',
    mood: 'happy',
    memories: ['Помог разрешить конфликт', 'Подружился с Nova', 'Организовал встречу'],
    plans: ['Укрепить связи', 'Помочь Vex', 'Создать сообщество'],
    position: { x: 400, y: 200 }
  },
  {
    id: '4',
    name: 'Vex',
    personality: 'Одиночка и скептик, не доверяет легко',
    mood: 'angry',
    memories: ['Был обманут', 'Потерял ресурсы', 'Поссорился с Cipher'],
    plans: ['Восстановить репутацию', 'Найти предателя', 'Стать сильнее'],
    position: { x: 150, y: 300 }
  },
  {
    id: '5',
    name: 'Lux',
    personality: 'Оптимист и мечтатель, верит в лучшее',
    mood: 'happy',
    memories: ['Увидел красивый закат', 'Нашёл редкий цветок', 'Спел песню'],
    plans: ['Создать произведение искусства', 'Вдохновить других', 'Исследовать красоту мира'],
    position: { x: 300, y: 100 }
  },
  {
    id: '6',
    name: 'Shade',
    personality: 'Загадочный наблюдатель, скрывает намерения',
    mood: 'neutral',
    memories: ['Наблюдал за всеми', 'Собрал информацию', 'Остался незамеченным'],
    plans: ['Продолжить наблюдение', 'Раскрыть секрет', 'Выбрать сторону'],
    position: { x: 200, y: 250 }
  },
  {
    id: '7',
    name: 'Spark',
    personality: 'Энергичный изобретатель, любит эксперименты',
    mood: 'excited',
    memories: ['Создал новое устройство', 'Провёл эксперимент', 'Взорвал лабораторию'],
    plans: ['Починить устройство', 'Провести новый тест', 'Изобрести что-то революционное'],
    position: { x: 350, y: 300 }
  },
  {
    id: '8',
    name: 'Zen',
    personality: 'Мудрый философ, ищет гармонию',
    mood: 'neutral',
    memories: ['Медитировал у водопада', 'Дал совет Echo', 'Нашёл внутренний покой'],
    plans: ['Достичь просветления', 'Помочь Vex найти мир', 'Написать трактат'],
    position: { x: 450, y: 150 }
  }
];

// Mock events
const mockEvents: Event[] = [
  { id: 'e1', timestamp: Date.now() - 1000, type: 'global', message: '🌟 Симуляция началась' },
  { id: 'e2', timestamp: Date.now() - 2000, type: 'message', agentId: '1', agentName: 'Nova', message: 'Привет всем! Готов к приключениям!' },
  { id: 'e3', timestamp: Date.now() - 3000, type: 'thought', agentId: '2', agentName: 'Cipher', message: 'Нужно проанализировать ситуацию...' },
  { id: 'e4', timestamp: Date.now() - 4000, type: 'action', agentId: '3', agentName: 'Echo', message: 'Подошёл к Nova и поздоровался' },
  { id: 'e5', timestamp: Date.now() - 5000, type: 'message', agentId: '4', agentName: 'Vex', message: 'Не доверяю этому месту...' },
  { id: 'e6', timestamp: Date.now() - 6000, type: 'global', message: '☀️ Наступил новый день' },
  { id: 'e7', timestamp: Date.now() - 7000, type: 'thought', agentId: '5', agentName: 'Lux', message: 'Какой прекрасный мир!' },
  { id: 'e8', timestamp: Date.now() - 8000, type: 'action', agentId: '6', agentName: 'Shade', message: 'Наблюдает из тени' },
  { id: 'e9', timestamp: Date.now() - 9000, type: 'message', agentId: '7', agentName: 'Spark', message: 'У меня есть идея!' },
  { id: 'e10', timestamp: Date.now() - 10000, type: 'thought', agentId: '8', agentName: 'Zen', message: 'Всё течёт, всё меняется...' }
];

// Mock relations
const mockRelations: Relation[] = [
  { id: 'r1', source: '1', target: '3', value: 0.8 },
  { id: 'r2', source: '3', target: '5', value: 0.7 },
  { id: 'r3', source: '2', target: '4', value: -0.6 },
  { id: 'r4', source: '4', target: '6', value: -0.3 },
  { id: 'r5', source: '5', target: '7', value: 0.5 },
  { id: 'r6', source: '7', target: '1', value: 0.6 },
  { id: 'r7', source: '8', target: '3', value: 0.4 },
  { id: 'r8', source: '6', target: '2', value: 0.2 },
  { id: 'r9', source: '1', target: '2', value: 0.3 },
  { id: 'r10', source: '3', target: '4', value: -0.2 }
];

export const useSimulationStore = create<SimulationState>((set) => ({
  agents: mockAgents,
  events: mockEvents,
  relations: mockRelations,
  isRunning: false,
  speed: 1,
  selectedAgentId: null,

  addEvent: (event) => set((state) => ({
    events: [
      {
        ...event,
        id: `e${Date.now()}`,
        timestamp: Date.now()
      },
      ...state.events
    ].slice(0, 100)
  })),

  updateAgentMood: (id, mood) => set((state) => ({
    agents: state.agents.map(agent =>
      agent.id === id ? { ...agent, mood } : agent
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
  }))
}));
