import { Layout } from './components/Layout';
import { EventFeed } from './components/EventFeed';
import { RelationshipGraph } from './components/RelationshipGraph';
import { AgentInspector } from './components/AgentInspector';
import { useNewsPolling } from './hooks/useNewsPolling';
import { useBackendIntegration } from './hooks/useBackendIntegration';

function App() {
  // Загрузка агентов из Backend при старте
  useBackendIntegration();
  
  // Автоматическая загрузка новостей из World Service каждые 10 секунд
  const { isConnected, hasNews } = useNewsPolling(true, 10000);

  return (
    <Layout>
      {/* Индикатор статуса подключения к World Service */}
      {!isConnected && (
        <div className="mx-2 mt-2 p-2 bg-yellow-900/20 border border-yellow-600/50 rounded-lg text-yellow-400 text-xs">
          ⚠️ Нет подключения к World Service. Проверьте что сервис запущен на порту 8082.
        </div>
      )}
      
      {isConnected && !hasNews && (
        <div className="mx-2 mt-2 p-2 bg-blue-900/20 border border-blue-600/50 rounded-lg text-blue-400 text-xs">
          📭 Новостей пока нет. Ожидание генерации от AI Service...
        </div>
      )}
      
      <div className="flex-1 flex flex-col gap-2 p-2">
        <EventFeed />
        <div className="flex-1 min-h-0">
          <RelationshipGraph />
        </div>
      </div>
      <AgentInspector />
    </Layout>
  );
}

export default App;
