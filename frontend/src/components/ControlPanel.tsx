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
    <Card className="bg-slate-900/80 border-slate-700 backdrop-blur-sm">
      <div className="p-4 flex items-center gap-4">
        {/* Play/Pause */}
        <Button
          size="icon"
          variant={isRunning ? 'default' : 'outline'}
          onClick={() => setRunning(!isRunning)}
          className={isRunning ? 'bg-cyan-500 hover:bg-cyan-600' : ''}
        >
          {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>

        {/* Speed Control */}
        <div className="flex items-center gap-2 w-32">
          <Zap className="h-4 w-4 text-cyan-400" />
          <Slider
            value={[speed]}
            onValueChange={handleSpeedChange}
            min={0.5}
            max={3}
            step={0.5}
            className="flex-1"
          />
          <span className="text-xs text-slate-400 w-8">{speed}x</span>
        </div>

        {/* Message Input */}
        <div className="flex-1 flex items-center gap-2">
          <Input
            placeholder={selectedAgent ? `Сообщение от ${selectedAgent.name}...` : 'Выберите агента'}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={!selectedAgent}
            className="bg-slate-800 border-slate-700"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!selectedAgent || !message.trim()}
            className="bg-cyan-500 hover:bg-cyan-600"
          >
            Отправить
          </Button>
        </div>

        {/* Random Action */}
        <Button
          onClick={handleRandomAction}
          variant="outline"
          className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Случайное
        </Button>

        {/* Global Event */}
        <Button
          onClick={handleGlobalEvent}
          variant="outline"
          className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10"
        >
          <Globe className="h-4 w-4 mr-2" />
          Событие
        </Button>
      </div>
    </Card>
  );
}
