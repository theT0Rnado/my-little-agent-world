import { useEffect } from 'react';
import { api, mappers } from '@/services/api';
import { useSimulationStore } from '@/stores/simulationStore';

/**
 * Хук для интеграции с Backend
 * Загружает агентов при старте приложения
 */
export function useBackendIntegration() {
  const { setAgents, addEvent } = useSimulationStore();

  useEffect(() => {
    console.log('🔌 Backend integration: Loading initial data...');

    // Загрузить агентов при старте
    const loadAgents = async () => {
      try {
        console.log('📡 Fetching agents from backend...');
        const backendAgents = await api.getAgents();
        
        if (!backendAgents || backendAgents.length === 0) {
          console.warn('⚠️ No agents found in backend');
          addEvent({
            type: 'global',
            message: '⚠️ Нет агентов в системе. Запустите AI Service для генерации агентов.',
          });
          return;
        }
        
        // Маппим агентов из Backend формата в Frontend
        const mappedAgents = backendAgents.map(mappers.mapAgent);
        setAgents(mappedAgents);
        
        console.log(`✅ Loaded ${mappedAgents.length} agents from backend:`, 
          mappedAgents.map(a => a.name).join(', '));
        
        addEvent({
          type: 'global',
          message: `🎉 Загружено ${mappedAgents.length} агентов из системы`,
        });
      } catch (error) {
        console.error('❌ Failed to load agents from backend:', error);
        addEvent({
          type: 'global',
          message: '❌ Ошибка подключения к бэкенду. Проверьте что все сервисы запущены.',
        });
      }
    };

    loadAgents();
  }, [setAgents, addEvent]);
}
