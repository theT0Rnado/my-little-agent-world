import { useCallback, useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  useNodesState,
  type NodeTypes,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSimulationStore } from '@/stores/simulationStore';
import { getMoodColor, getMoodEmoji } from '@/lib/utils';
import { Link, Link2Off } from 'lucide-react';

// Custom Node Component
function AgentNode({ data }: { data: any }) {
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.label}`;
  const hasMessage = data.currentMessage && data.messageTimestamp && (Date.now() - data.messageTimestamp < 3000);
  
  return (
    <div className="relative">
      {/* Message bubble above agent with AnimatePresence for exit animation */}
      <AnimatePresence>
        {hasMessage && (
          <motion.div
            key="message-bubble"
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10"
          >
            <div className="bg-gray-800 text-gray-200 text-xs px-2 py-1 rounded-lg shadow-lg max-w-[150px] text-center border border-gray-700">
              {data.currentMessage}
            </div>
            {/* Arrow pointing down */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-700"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div
        animate={hasMessage ? { y: [0, -5, 0] } : {}}
        transition={{ duration: 0.3 }}
        className="cursor-pointer hover:scale-110 transition-transform"
      >
        {/* Handles for connections from all sides with unique IDs */}
        <Handle type="target" position={Position.Top} id="top" style={{ opacity: 0 }} />
        <Handle type="target" position={Position.Bottom} id="bottom" style={{ opacity: 0 }} />
        <Handle type="target" position={Position.Left} id="left" style={{ opacity: 0 }} />
        <Handle type="target" position={Position.Right} id="right" style={{ opacity: 0 }} />
        <Handle type="source" position={Position.Top} id="top-source" style={{ opacity: 0 }} />
        <Handle type="source" position={Position.Bottom} id="bottom-source" style={{ opacity: 0 }} />
        <Handle type="source" position={Position.Left} id="left-source" style={{ opacity: 0 }} />
        <Handle type="source" position={Position.Right} id="right-source" style={{ opacity: 0 }} />
        
        <div className={`w-16 h-16 rounded-full border-3 ${getMoodColor(data.mood)} bg-gray-900 overflow-hidden`}>
          <img src={avatarUrl} alt={data.label} className="w-full h-full object-cover" />
        </div>
        <div className="absolute -bottom-1 -right-1 text-xl bg-gray-900 rounded-full border-2 border-gray-800">
          {getMoodEmoji(data.mood)}
        </div>
      </motion.div>
    </div>
  );
}

const nodeTypes: NodeTypes = {
  agent: AgentNode,
};

export function RelationshipGraph() {
  const [showRelations, setShowRelations] = useState(true);
  const { agents, relations, selectAgent, updateAgentPosition } = useSimulationStore();

  // Convert agents to nodes
  const nodes: Node[] = useMemo(() => agents.map((agent) => ({
    id: agent.id,
    type: 'agent',
    position: agent.position,
    data: {
      label: agent.name,
      mood: agent.mood,
      currentMessage: agent.currentMessage,
      messageTimestamp: agent.messageTimestamp,
    },
  })), [agents]);

  const [internalNodes, setInternalNodes, onNodesChange] = useNodesState(nodes);

  // Update internal nodes when agents change (for messages, mood, etc.)
  useEffect(() => {
    setInternalNodes((nds) =>
      nds.map((node) => {
        const agent = agents.find((a) => a.id === node.id);
        if (agent) {
          return {
            ...node,
            data: {
              ...node.data,
              mood: agent.mood,
              currentMessage: agent.currentMessage,
              messageTimestamp: agent.messageTimestamp,
            },
          };
        }
        return node;
      })
    );
  }, [agents, setInternalNodes]);

  // Convert relations to edges with color gradient - use internalNodes for validation
  const edges: Edge[] = useMemo(() => {
    if (!showRelations) return [];
    
    // Create a set of valid node IDs for quick lookup
    const nodeIds = new Set(internalNodes.map(n => n.id));
    
    // Helper function to determine handle positions based on node positions
    const getHandlePositions = (sourceId: string, targetId: string) => {
      const sourceNode = internalNodes.find(n => n.id === sourceId);
      const targetNode = internalNodes.find(n => n.id === targetId);
      
      if (!sourceNode || !targetNode) return { sourceHandle: 'right-source', targetHandle: 'left' };
      
      const dx = targetNode.position.x - sourceNode.position.x;
      const dy = targetNode.position.y - sourceNode.position.y;
      
      // Determine source handle based on direction
      let sourceHandle = 'right-source';
      if (Math.abs(dx) > Math.abs(dy)) {
        sourceHandle = dx > 0 ? 'right-source' : 'left-source';
      } else {
        sourceHandle = dy > 0 ? 'bottom-source' : 'top-source';
      }
      
      // Determine target handle (opposite direction)
      let targetHandle = 'left';
      if (Math.abs(dx) > Math.abs(dy)) {
        targetHandle = dx > 0 ? 'left' : 'right';
      } else {
        targetHandle = dy > 0 ? 'top' : 'bottom';
      }
      
      return { sourceHandle, targetHandle };
    };
    
    return relations
      .filter(rel => nodeIds.has(rel.source) && nodeIds.has(rel.target)) // Only create edges for existing nodes
      .map((rel) => {
        // Color based on relationship value: red (negative) to green (positive)
        const value = rel.value;
        let color: string;
        
        if (value > 0.5) {
          color = '#10b981'; // green-500
        } else if (value > 0) {
          color = '#84cc16'; // lime-500
        } else if (value > -0.5) {
          color = '#f59e0b'; // amber-500
        } else {
          color = '#ef4444'; // red-500
        }
        
        const opacity = Math.abs(value);
        const percentage = Math.round(value * 100);
        
        const { sourceHandle, targetHandle } = getHandlePositions(rel.source, rel.target);
        
        return {
          id: rel.id,
          source: rel.source,
          target: rel.target,
          sourceHandle,
          targetHandle,
          type: 'default', // Use default bezier curves for smooth connections
          animated: true,
          style: {
            stroke: color,
            strokeWidth: Math.abs(value) * 4 + 2,
            opacity: opacity * 0.7 + 0.3,
          },
          label: `${percentage > 0 ? '+' : ''}${percentage}%`,
          labelStyle: {
            fill: color,
            fontWeight: 600,
            fontSize: 12,
          },
          labelBgStyle: {
            fill: '#1f1f1f',
            fillOpacity: 0.9,
          },
        };
      });
  }, [relations, showRelations, internalNodes]);

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
    <Card className="h-full bg-gray-950 border-gray-800 overflow-hidden p-0">
      <div className="px-3 py-2 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-200">Relationship Graph</h2>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowRelations(!showRelations)}
          className="h-7 px-2 text-xs"
        >
          {showRelations ? (
            <>
              <Link className="h-3 w-3 mr-1" />
              Скрыть связи
            </>
          ) : (
            <>
              <Link2Off className="h-3 w-3 mr-1" />
              Показать связи
            </>
          )}
        </Button>
      </div>
      
      <div className="h-[calc(100%-2.5rem)]">
        <ReactFlow
          nodes={internalNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onNodeClick={onNodeClick}
          onNodeDragStop={onNodeDragStop}
          nodeTypes={nodeTypes}
          fitView
          className="bg-black"
          proOptions={{ hideAttribution: true }}
          panOnDrag={[1, 2]} // Allow panning with left mouse button and touch
          panOnScroll={true}
          zoomOnScroll={true}
          zoomOnPinch={true}
          panOnScrollMode="free"
          zoomOnDoubleClick={false}
          preventScrolling={true}
          nodesDraggable={true}
          elementsSelectable={true}
        >
          <Background color="#1f1f1f" gap={16} />
          <Controls 
            className="bg-gray-900 border-gray-800"
          />
        </ReactFlow>
      </div>
    </Card>
  );
}
