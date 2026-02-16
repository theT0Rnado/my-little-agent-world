import type { ReactNode } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AgentCard } from './AgentCard';
import { ControlPanel } from './ControlPanel';
import { useSimulationStore } from '@/stores/simulationStore';
import { Activity } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { agents, selectedAgentId, selectAgent, isRunning, speed } = useSimulationStore();

  return (
    <div className="h-screen flex flex-col bg-slate-950">
      {/* Header */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm flex items-center px-6">
        <div className="flex items-center gap-3">
          <Activity className="h-6 w-6 text-cyan-400" />
          <h1 className="text-xl font-bold text-white">Agent World</h1>
        </div>
        
        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isRunning ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
            <span className="text-sm text-slate-400">
              {isRunning ? 'Running' : 'Paused'} • {speed}x
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Agent List */}
        <aside className="w-80 border-r border-slate-800 bg-slate-900/30">
          <div className="p-4 border-b border-slate-800">
            <h2 className="text-lg font-semibold text-cyan-400">Agents</h2>
            <p className="text-xs text-slate-500 mt-1">{agents.length} active</p>
          </div>
          
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="p-4 space-y-3">
              {agents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onClick={() => selectAgent(agent.id)}
                  isSelected={selectedAgentId === agent.id}
                />
              ))}
            </div>
          </ScrollArea>
        </aside>

        {/* Main Area */}
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </div>

      {/* Bottom Control Panel */}
      <footer className="h-24 border-t border-slate-800">
        <ControlPanel />
      </footer>
    </div>
  );
}
