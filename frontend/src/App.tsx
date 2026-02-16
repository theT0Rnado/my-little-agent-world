import { Layout } from './components/Layout';
import { EventFeed } from './components/EventFeed';
import { RelationshipGraph } from './components/RelationshipGraph';
import { AgentInspector } from './components/AgentInspector';

function App() {
  return (
    <Layout>
      <div className="flex-1 grid grid-rows-[40%_60%] gap-4 p-4">
        <EventFeed />
        <RelationshipGraph />
      </div>
      <AgentInspector />
    </Layout>
  );
}

export default App;
