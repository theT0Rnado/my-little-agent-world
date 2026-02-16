import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useSimulationStore } from '@/stores/simulationStore';
import { getMoodColor, getMoodEmoji } from '@/lib/utils';
import { Brain, Heart, Target, Users } from 'lucide-react';

export function AgentInspector() {
  const { selectedAgentId, agents, relations, selectAgent } = useSimulationStore();
  const agent = agents.find((a) => a.id === selectedAgentId);

  if (!agent) return null;

  const agentRelations = relations.filter(
    (r) => r.source === agent.id || r.target === agent.id
  );

  return (
    <Drawer open={!!selectedAgentId} onOpenChange={(open) => !open && selectAgent(null)}>
      <DrawerContent className="bg-slate-900 border-slate-700 max-h-[85vh]">
        <DrawerHeader className="border-b border-slate-700">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-cyan-400">
              <AvatarFallback className="bg-slate-800 text-cyan-400 text-xl font-bold">
                {agent.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <DrawerTitle className="text-2xl text-white">{agent.name}</DrawerTitle>
              <Badge className={`${getMoodColor(agent.mood)} mt-2`}>
                {getMoodEmoji(agent.mood)} {agent.mood}
              </Badge>
            </div>
          </div>
        </DrawerHeader>

        <Tabs defaultValue="personality" className="p-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800">
            <TabsTrigger value="personality">
              <Brain className="h-4 w-4 mr-2" />
              Характер
            </TabsTrigger>
            <TabsTrigger value="memories">
              <Heart className="h-4 w-4 mr-2" />
              Память
            </TabsTrigger>
            <TabsTrigger value="plans">
              <Target className="h-4 w-4 mr-2" />
              Планы
            </TabsTrigger>
            <TabsTrigger value="relations">
              <Users className="h-4 w-4 mr-2" />
              Связи
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personality" className="mt-4">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <p className="text-slate-300 leading-relaxed">{agent.personality}</p>
            </div>
          </TabsContent>

          <TabsContent value="memories" className="mt-4">
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {agent.memories.map((memory, i) => (
                  <div
                    key={i}
                    className="bg-slate-800/50 rounded-lg p-3 border border-slate-700"
                  >
                    <p className="text-sm text-slate-300">{memory}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="plans" className="mt-4">
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {agent.plans.map((plan, i) => (
                  <div
                    key={i}
                    className="bg-slate-800/50 rounded-lg p-3 border border-slate-700 flex items-start gap-3"
                  >
                    <span className="text-cyan-400 font-bold">{i + 1}.</span>
                    <p className="text-sm text-slate-300 flex-1">{plan}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="relations" className="mt-4">
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {agentRelations.map((rel) => {
                  const otherAgentId = rel.source === agent.id ? rel.target : rel.source;
                  const otherAgent = agents.find((a) => a.id === otherAgentId);
                  if (!otherAgent) return null;

                  const isPositive = rel.value > 0;
                  const strength = Math.abs(rel.value);

                  return (
                    <div
                      key={rel.id}
                      className="bg-slate-800/50 rounded-lg p-3 border border-slate-700 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-slate-700 text-xs">
                            {otherAgent.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-slate-300">{otherAgent.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 rounded-full ${
                            isPositive ? 'bg-green-400' : 'bg-red-400'
                          }`}
                          style={{ width: `${strength * 60}px` }}
                        />
                        <span className="text-xs text-slate-400">
                          {(rel.value * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DrawerContent>
    </Drawer>
  );
}
