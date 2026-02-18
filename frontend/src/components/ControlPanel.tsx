import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Play, Pause, Zap, Globe, Sparkles, User } from 'lucide-react';
import { useSimulationStore } from '@/stores/simulationStore';
import { getMoodEmoji } from '@/lib/utils';

const randomMessages = [
  'Исследую окрестности...',
  'Нашёл что-то интересное!',
  'Размышляю о смысле жизни',
  'Пытаюсь понять других агентов',
  'Создаю новый план действий',
  'Отдыхаю и набираюсь сил',
  'Делюсь своими мыслями',
  'Наблюдаю за происходящим'
];

const randomGlobalEvents = [
  '🌟 Найден древний артефакт!',
  '🌧️ Начался дождь',
  '☀️ Наступил новый день',
  '🎉 Праздник в деревне!',
  '⚠️ Приближается буря',
  '🌙 Наступила ночь',
  '🎨 Кто-то создал произведение искусства',
  '💫 Падающая звезда пролетела по небу',
  '🔥 Разожжён костёр для собрания',
  '🎵 Слышна музыка вдалеке'
];

export function ControlPanel() {
  const [message, setMessage] = useState('');
  const { isRunning, speed, selectedAgentId, agents, setRunning, setSpeed, addEvent, selectAgent } = useSimulationStore();
  
  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  const handleSendMessage = () => {
    if (!message.trim() || !selectedAgent) return;
    
    addEvent({
      type: 'message',
      agentId: selectedAgent.id,
      agentName: selectedAgent.name,
      message: message.trim()
    });
    
    setMessage('');
  };

  const handleAgentSelect = (agentId: string) => {
    selectAgent(agentId); // Update global selection
  };

  const handleGlobalEvent = () => {
    const randomEvent = randomGlobalEvents[Math.floor(Math.random() * randomGlobalEvents.length)];
    addEvent({
      type: 'global',
      message: randomEvent
    });
  };

  const handleRandomAction = () => {
    const randomAgent = agents[Math.floor(Math.random() * agents.length)];
    const randomMessage = randomMessages[Math.floor(Math.random() * randomMessages.length)];
    
    addEvent({
      type: Math.random() > 0.5 ? 'thought' : 'action',
      agentId: randomAgent.id,
      agentName: randomAgent.name,
      message: randomMessage
    });
  };

  const handleSpeedChange = (value: number[]) => {
    setSpeed(value[0]);
    addEvent({
      type: 'global',
      message: `⚡ Скорость изменена на ${value[0]}x`
    });
  };

  return (
    <Card className="bg-gray-950 border-gray-800 backdrop-blur-sm">
      <div className="p-2 md:p-4 flex flex-col gap-2">
        {/* Top Row: Play/Pause & Speed */}
        <div className="flex items-center gap-2 md:gap-4">
          <Button
            size="sm"
            variant={isRunning ? 'default' : 'outline'}
            onClick={() => setRunning(!isRunning)}
            className={`h-8 w-8 md:h-10 md:w-10 ${isRunning ? 'bg-gray-700 hover:bg-gray-600' : 'border-gray-700'}`}
          >
            {isRunning ? <Pause className="h-3 w-3 md:h-4 md:w-4" /> : <Play className="h-3 w-3 md:h-4 md:w-4" />}
          </Button>

          {/* Speed Control */}
          <div className="flex items-center gap-2 flex-1 md:w-32 md:flex-none">
            <Zap className="h-3 w-3 md:h-4 md:w-4 text-gray-400" />
            <Slider
              value={[speed]}
              onValueChange={handleSpeedChange}
              min={0.5}
              max={3}
              step={0.5}
              className="flex-1"
            />
            <span className="text-xs text-gray-500 w-8">{speed}x</span>
          </div>

          {/* Action Buttons - Desktop */}
          <div className="hidden md:flex items-center gap-2 ml-auto">
            <Button
              onClick={handleRandomAction}
              variant="outline"
              size="sm"
              className="border-gray-700 text-gray-400 hover:bg-gray-900 text-xs"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Случайное
            </Button>

            <Button
              onClick={handleGlobalEvent}
              variant="outline"
              size="sm"
              className="border-gray-700 text-gray-400 hover:bg-gray-900 text-xs"
            >
              <Globe className="h-4 w-4 mr-2" />
              Событие
            </Button>
          </div>
        </div>

        {/* Bottom Row: Agent Select + Message Input */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
          {/* Agent Selector */}
          <Select value={selectedAgentId || ''} onValueChange={handleAgentSelect}>
            <SelectTrigger className="w-full md:w-48 bg-gray-900 border-gray-800 text-sm hover:border-cyan-500/50 transition-colors">
              <SelectValue placeholder="Выберите агента">
                {selectedAgent && (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarImage 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedAgent.name}`} 
                        alt={selectedAgent.name} 
                      />
                      <AvatarFallback className="text-xs">
                        {selectedAgent.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">{selectedAgent.name}</span>
                    <span className="text-xs">{getMoodEmoji(selectedAgent.mood)}</span>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-800 max-h-80">
              {agents.map((agent) => (
                <SelectItem 
                  key={agent.id} 
                  value={agent.id}
                  className="text-gray-200 focus:bg-gray-800 focus:text-white cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${agent.name}`} 
                        alt={agent.name} 
                      />
                      <AvatarFallback className="text-xs bg-gray-800">
                        {agent.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{agent.name}</span>
                    <span className="text-xs ml-auto">{getMoodEmoji(agent.mood)}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Message Input */}
          <div className="flex-1 flex items-center gap-2">
            <Input
              placeholder={selectedAgent ? `Сообщение от ${selectedAgent.name}...` : 'Сначала выберите агента'}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={!selectedAgent}
              className="bg-gray-900 border-gray-800 text-sm"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!selectedAgent || !message.trim()}
              className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs md:text-sm px-3 md:px-4 shadow-lg shadow-cyan-500/20"
              size="sm"
            >
              <span className="hidden md:inline">Отправить</span>
              <span className="md:hidden">→</span>
            </Button>
          </div>

          {/* Action Buttons - Mobile */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              onClick={handleRandomAction}
              variant="outline"
              size="sm"
              className="border-gray-700 text-gray-400 hover:bg-gray-900 text-xs flex-1"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Случайное
            </Button>

            <Button
              onClick={handleGlobalEvent}
              variant="outline"
              size="sm"
              className="border-gray-700 text-gray-400 hover:bg-gray-900 text-xs flex-1"
            >
              <Globe className="h-3 w-3 mr-1" />
              Событие
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
