import { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card } from '@/components/ui/card';
import { useSimulationStore } from '@/stores/simulationStore';
import { getMoodColor } from '@/lib/utils';

// Custom Node Component
function AgentNode({ data }: { data: any }) {
  return (
    <div
      className={`px-4 py-2 rounded-lg border-2 bg-slate-900 ${getMoodColor(
        data.mood
      )} cursor-pointer hover:scale-110 transition-transform`}
    >
      <div className="text-sm font-semibold text-white">{data.label}</div>
      <div className="text-xs text-slate-400">{data.mood}</div>
    </div>
  );
}

const nodeTypes: NodeTypes = {
  agent: AgentNode,
};

export function RelationshipGraph() {
  const { agents, relations, selectAgent, updateAgentPosition } = useSimulationStore();

  // Convert agents to nodes
  const initialNodes: Node[] = agents.map((agent) => ({
    id: agent.id,
    type: 'agent',
    position: agent.position,
    data: {
      label: agent.name,
      mood: agent.mood,
    },
  }));

  // Convert relations to edges
  const initialEdges: Edge[] = relations.map((rel) => {
    const color = rel.value > 0 ? '#10b981' : '#ef4444';
    const opacity = Math.abs(rel.value);
    
    return {
      id: rel.id,
      source: rel.source,
      target: rel.target,
      animated: true,
      style: {
        stroke: color,
        strokeWidth: Math.abs(rel.value) * 3 + 1,
        opacity: opacity * 0.8 + 0.2,
      },
      label: rel.value > 0 ? '❤️' : '💔',
    };
  });

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClick = useCallback(
    (_: any, node: Node) => {
      selectAgent(node.id);
    },
    [selectAgent]
  );

  const onNodeDragStop = useCallback(
    (_: any, node: Node) => {
      updateAgentPosition(node.id, node.position);
    },
    [updateAgentPosition]
  );

  return (
    <Card className="h-full bg-slate-900/50 border-slate-700 overflow-hidden">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-cyan-400">Relationship Graph</h2>
      </div>
      
      <div className="h-[calc(100%-4rem)]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onNodeDragStop={onNodeDragStop}
          nodeTypes={nodeTypes}
          fitView
          className="bg-slate-950"
        >
          <Background color="#1e293b" gap={16} />
          <Controls className="bg-slate-800 border-slate-700" />
        </ReactFlow>
      </div>
    </Card>
  );
}
