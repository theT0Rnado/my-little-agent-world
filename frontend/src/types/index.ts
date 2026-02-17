export type Mood = 'happy' | 'sad' | 'angry' | 'neutral' | 'excited' | 'tired';

export interface Agent {
  id: string;
  name: string;
  personality: string;
  mood: Mood;
  memories: string[];
  plans: string[];
  position: { x: number; y: number };
  currentMessage?: string; // Current message being displayed
  messageTimestamp?: number; // When the message was set
}

export interface Event {
  id: string;
  timestamp: number;
  type: 'message' | 'global' | 'thought' | 'action';
  agentId?: string;
  agentName?: string;
  message: string;
}

export interface Relation {
  id: string;
  source: string;
  target: string;
  value: number;
}

export interface SimulationState {
  agents: Agent[];
  events: Event[];
  relations: Relation[];
  isRunning: boolean;
  speed: number;
  selectedAgentId: string | null;
  addEvent: (event: Omit<Event, 'id' | 'timestamp'>) => void;
  updateAgentMood: (id: string, mood: Mood) => void;
  updateAgentMessage: (id: string, message: string) => void;
  clearAgentMessage: (id: string) => void;
  updateRelation: (source: string, target: string, value: number) => void;
  setSpeed: (speed: number) => void;
  setRunning: (isRunning: boolean) => void;
  selectAgent: (id: string | null) => void;
  updateAgentPosition: (id: string, position: { x: number; y: number }) => void;
}
