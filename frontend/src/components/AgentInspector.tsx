import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSimulationStore } from '@/stores/simulationStore';
import { getMoodColor, getMoodEmoji } from '@/lib/utils';
import { Brain, Heart, Target, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export function AgentInspector() {
  const { selectedAgentId, agents, relations, selectAgent } = useSimulationStore();
  const agent = agents.find((a) => a.id === selectedAgentId);

  if (!agent) return null;

  const agentRelations = relations.filter(
    (r) => r.source === agent.id || r.target === agent.id
  );

  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${agent.name}`;

  return (
    <Drawer 
      open={!!selectedAgentId} 
      onOpenChange={(open) => !open && selectAgent(null)}
    >
      <DrawerContent className="bg-gray-950 border-gray-800 h-[70vh] transition-transform duration-300 ease-in-out">
        <DrawerHeader className="border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-gray-600">
              <AvatarImage src={avatarUrl} alt={agent.name} />
              <AvatarFallback className="bg-gray-900 text-gray-300 text-xl font-bold">
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

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="personality" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4 bg-gray-900 p-1 mx-6 mt-4 shrink-0">
              <TabsTrigger 
                value="personality"
                className="data-[state=active]:bg-gray-700 data-[state=active]:text-white transition-all duration-200"
              >
                <Brain className="h-4 w-4 mr-2" />
                Характер
              </TabsTrigger>
              <TabsTrigger 
                value="memories"
                className="data-[state=active]:bg-gray-700 data-[state=active]:text-white transition-all duration-200"
              >
                <Heart className="h-4 w-4 mr-2" />
                Память
              </TabsTrigger>
              <TabsTrigger 
                value="plans"
                className="data-[state=active]:bg-gray-700 data-[state=active]:text-white transition-all duration-200"
              >
                <Target className="h-4 w-4 mr-2" />
                Планы
              </TabsTrigger>
              <TabsTrigger 
                value="relations"
                className="data-[state=active]:bg-gray-700 data-[state=active]:text-white transition-all duration-200"
              >
                <Users className="h-4 w-4 mr-2" />
                Связи
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 px-6">
              <TabsContent value="personality" className="mt-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                    <p className="text-gray-300 leading-relaxed">{agent.personality}</p>
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="memories" className="mt-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2"
                >
                  {agent.memories.map((memory, i) => (
                    <div
                      key={i}
                      className="bg-gray-900 rounded-lg p-3 border border-gray-800"
                    >
                      <p className="text-sm text-gray-300">{memory}</p>
                    </div>
                  ))}
                </motion.div>
              </TabsContent>

              <TabsContent value="plans" className="mt-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2"
                >
                  {agent.plans.map((plan, i) => (
                    <div
                      key={i}
                      className="bg-gray-900 rounded-lg p-3 border border-gray-800 flex items-start gap-3"
                    >
                      <span className="text-gray-400 font-bold">{i + 1}.</span>
                      <p className="text-sm text-gray-300 flex-1">{plan}</p>
                    </div>
                  ))}
                </motion.div>
              </TabsContent>

              <TabsContent value="relations" className="mt-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2"
                >
                  {agentRelations.map((rel) => {
                    const otherAgentId = rel.source === agent.id ? rel.target : rel.source;
                    const otherAgent = agents.find((a) => a.id === otherAgentId);
                    if (!otherAgent) return null;

                    const isPositive = rel.value > 0;
                    const strength = Math.abs(rel.value);
                    const otherAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherAgent.name}`;

                    return (
                      <div
                        key={rel.id}
                        className="bg-gray-900 rounded-lg p-3 border border-gray-800 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={otherAvatarUrl} alt={otherAgent.name} />
                            <AvatarFallback className="bg-gray-800 text-xs">
                              {otherAgent.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-300">{otherAgent.name}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-2 rounded-full ${
                              isPositive ? 'bg-green-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${strength * 60}px` }}
                          />
                          <span className="text-xs text-gray-500">
                            {(rel.value * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
