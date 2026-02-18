import { useEffect, useRef, useState } from 'react';
import { api, mappers } from '@/services/api';
import { useSimulationStore } from '@/stores/simulationStore';

/**
 * Хук для автоматической загрузки новостей из World Service
 * Опрашивает сервер каждые 10 секунд
 */
export function useNewsPolling(enabled: boolean = true, intervalMs: number = 10000) {
  const { addEvent } = useSimulationStore();
  const lastNewsIdRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [hasNews, setHasNews] = useState<boolean>(false);

  useEffect(() => {
    if (!enabled) {
      console.log('📰 News polling disabled');
      return;
    }

    console.log('📰 Starting news polling...');

    const fetchNews = async () => {
      try {
        const news = await api.getNews();
        
        // Успешное подключение
        if (!isConnected) {
          setIsConnected(true);
          console.log('✅ Connected to World Service');
        }
        
        // Проверяем есть ли новости вообще
        if (news.length === 0) {
          if (!hasNews) {
            console.log('📭 No news available yet. Waiting for AI to generate...');
            setHasNews(false);
          }
          return;
        }
        
        if (!hasNews) {
          setHasNews(true);
          console.log(`📰 Found ${news.length} total news items in database`);
        }
        
        // Фильтруем только новые новости (с ID больше последнего)
        const newNews = news
          .filter(n => n.id > lastNewsIdRef.current)
          .filter(n => n.content && n.content.trim() !== ''); // Фильтруем пустые новости
        
        if (newNews.length > 0) {
          console.log(`📰 Found ${newNews.length} new news items`);
          
          // Сортируем по ID (старые первыми)
          newNews.sort((a, b) => a.id - b.id);
          
          // Добавляем каждую новость как событие с небольшой задержкой
          // чтобы избежать дубликатов ID
          newNews.forEach((newsItem, index) => {
            setTimeout(() => {
              const event = mappers.mapNewsToEvent(newsItem);
              addEvent(event);
              console.log(`📰 Added news: ${newsItem.content.substring(0, 50)}...`);
            }, index * 10); // 10ms задержка между событиями
          });
          
          // Обновляем последний ID
          lastNewsIdRef.current = Math.max(...newNews.map(n => n.id));
        }
      } catch (error) {
        if (isConnected) {
          setIsConnected(false);
          console.error('❌ Lost connection to World Service:', error);
        } else {
          console.error('❌ Cannot connect to World Service:', error);
        }
      }
    };

    // Первая загрузка сразу
    fetchNews();

    // Затем каждые N секунд
    intervalRef.current = setInterval(fetchNews, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        console.log('📰 News polling stopped');
      }
    };
  }, [enabled, intervalMs, addEvent, isConnected, hasNews]);

  return { isConnected, hasNews };
}
