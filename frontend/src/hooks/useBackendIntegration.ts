import { useEffect } from 'react';
import { wsService } from '@/services/websocket';
import { api, mappers } from '@/services/api';
import { useSimulationStore } from '@/stores/simulationStore';

/**
 * Хук для интеграции с Backend
 * 
 * ИСПОЛЬЗОВАНИЕ:
 * 1. Раскомментировать вызов в main.tsx
 * 2. Убедиться что Backend запущен
 * 3. Всё заработает автоматически!
 */
export function useBackendIntegration() {
  const { addEvent, updateAgent, setAgents } = useSimulationStore();

  useEffect(() => {
    console.log('🔌 Backend integration hook mounted (disabled for now)');

    // ========== РАСКОММЕНТИРОВАТЬ ДЛЯ ПОДКЛЮЧЕНИЯ К BACKEND ==========
    
    /*
    // 1. Подключить WebSocket
    wsService.connect();

    // 2. Подписаться на события
    const handleNews = (news: any) => {
      addEvent({
        type: 'global',
        message: news.content || news.text,
      });
    };

    const handleAgentsData = (agents: any[]) => {
      const mappedAgents = agents.map(mappers.mapAgent);
      setAgents(mappedAgents);
    };

    const handleAgentMessage = (data: any) => {
      addEvent({
        type: 'message',
        agentId: data.agentId,
        agentName: data.agentName,
        message: data.message,
      });
    };

    wsService.on('raw-news', handleNews);
    wsService.on('agents-data', handleAgentsData);
    wsService.on('agent-message', handleAgentMessage);

    // 3. Загрузить начальные данные
    api.getAgents()
      .then(agents => {
        const mappedAgents = agents.map(mappers.mapAgent);
        setAgents(mappedAgents);
        console.log('✅ Initial agents loaded:', mappedAgents.length);
      })
      .catch(error => {
        console.error('❌ Failed to load initial agents:', error);
      });

    // 4. Cleanup при размонтировании
    return () => {
      wsService.off('raw-news', handleNews);
      wsService.off('agents-data', handleAgentsData);
      wsService.off('agent-message', handleAgentMessage);
      wsService.disconnect();
    };
    */

    // Пока используем моки - ничего не делаем
    return () => {
      console.log('🔌 Backend integration hook unmounted');
    };
  }, [addEvent, updateAgent, setAgents]);
}
