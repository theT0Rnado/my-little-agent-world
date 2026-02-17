import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Zap, Globe, Sparkles } from 'lucide-react';
import { useSimulationStore } from '@/stores/simulationStore';

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
  const { isRunning, speed, selectedAgentId, agents, setRunning, setSpeed, addEvent } = useSimulationStore();
  
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
      <div className="p-2 md:p-4 flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-4">
        {/* Play/Pause & Speed - Always visible */}
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
          <div className="flex items-center gap-2 w-24 md:w-32">
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
        </div>

        {/* Message Input - Full width on mobile */}
        <div className="flex-1 flex items-center gap-2">
          <Input
            placeholder={selectedAgent ? `От ${selectedAgent.name}...` : 'Выберите агента'}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={!selectedAgent}
            className="bg-gray-900 border-gray-800 text-sm"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!selectedAgent || !message.trim()}
            className="bg-gray-700 hover:bg-gray-600 text-xs md:text-sm px-3 md:px-4"
            size="sm"
          >
            <span className="hidden md:inline">Отправить</span>
            <span className="md:hidden">→</span>
          </Button>
        </div>

        {/* Action Buttons - Compact on mobile */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleRandomAction}
            variant="outline"
            size="sm"
            className="border-gray-700 text-gray-400 hover:bg-gray-900 text-xs flex-1 md:flex-none"
          >
            <Sparkles className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
            <span className="hidden md:inline">Случайное</span>
          </Button>

          <Button
            onClick={handleGlobalEvent}
            variant="outline"
            size="sm"
            className="border-gray-700 text-gray-400 hover:bg-gray-900 text-xs flex-1 md:flex-none"
          >
            <Globe className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
            <span className="hidden md:inline">Событие</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}
