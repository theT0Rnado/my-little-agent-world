import { Layout } from './components/Layout';
import { EventFeed } from './components/EventFeed';
import { RelationshipGraph } from './components/RelationshipGraph';
import { AgentInspector } from './components/AgentInspector';

function App() {
  return (
    <Layout>
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
