import { useState } from 'react';
import type { ReactNode } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { AgentCard } from './AgentCard';
import { ControlPanel } from './ControlPanel';
import { useSimulationStore } from '@/stores/simulationStore';
import { Activity, Menu, X } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { agents, selectedAgentId, selectAgent, isRunning, speed } = useSimulationStore();

  return (
    <div className="h-screen flex flex-col bg-black">
      {/* Header */}
      <header className="h-14 md:h-16 border-b border-gray-900 bg-gray-950 backdrop-blur-sm flex items-center px-4 md:px-6 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden mr-2"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        
        <div className="flex items-center gap-2 md:gap-3">
          <Activity className="h-5 w-5 md:h-6 md:w-6 text-gray-400" />
          <h1 className="text-lg md:text-xl font-bold text-white">Agent World</h1>
        </div>
        
        <div className="ml-auto flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`} />
            <span className="text-xs md:text-sm text-gray-400">
              {isRunning ? 'Running' : 'Paused'} • {speed}x
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Sidebar - Agent List */}
        <aside className={`
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          fixed md:relative
          z-40
          w-72 md:w-80
          h-[calc(100vh-3.5rem)] md:h-auto
          border-r border-gray-900 bg-gray-950
          transition-transform duration-300
        `}>
          <div className="px-3 py-2 bg-gray-800 border-b border-gray-700">
            <h2 className="text-sm font-semibold text-gray-200">Agents</h2>
            <p className="text-xs text-gray-500 mt-0.5">{agents.length} active</p>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2">
              {agents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onClick={() => {
                    selectAgent(agent.id);
                    setIsSidebarOpen(false);
                  }}
                  isSelected={selectedAgentId === agent.id}
                />
              ))}
            </div>
          </ScrollArea>
        </aside>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Area */}
        <main className="flex-1 flex flex-col min-w-0">
          {children}
        </main>
      </div>

      {/* Bottom Control Panel */}
      <footer className="border-t border-gray-900 shrink-0">
        <ControlPanel />
      </footer>
    </div>
  );
}
