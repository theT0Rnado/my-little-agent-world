// Test file to simulate agent messages
import { useSimulationStore } from './stores/simulationStore';

export function testAgentMessages() {
  // Test messages for different agents
  const testMessages = [
    { agentId: '1', message: 'Привет всем! 👋' },
    { agentId: '2', message: 'Анализирую данные...' },
    { agentId: '3', message: 'Как дела?' },
    { agentId: '4', message: 'Не доверяю этому' },
    { agentId: '5', message: 'Прекрасный день! ☀️' },
  ];
  
  let index = 0;
  
  // Send a message every 4 seconds
  const interval = setInterval(() => {
    const testMsg = testMessages[index % testMessages.length];
    const { agents, updateAgentMessage, clearAgentMessage, addEvent } = useSimulationStore.getState();
    const agent = agents.find(a => a.id === testMsg.agentId);
    
    if (agent) {
      console.log(`Sending message from ${agent.name}: ${testMsg.message}`);
      
      // Update agent with message
      updateAgentMessage(testMsg.agentId, testMsg.message);
      
      // Add event to feed
      addEvent({
        type: 'message',
        agentId: agent.id,
        agentName: agent.name,
        message: testMsg.message,
      });
      
      // Clear message after 3 seconds
      setTimeout(() => {
        console.log(`Clearing message from ${agent.name}`);
        clearAgentMessage(testMsg.agentId);
      }, 3000);
    }
    
    index++;
    
    // Stop after 5 messages
    if (index >= 5) {
      clearInterval(interval);
      console.log('✅ Test messages completed');
    }
  }, 4000);
  
  console.log('🚀 Started test messages - will send 5 messages with 4s interval');
  console.log('Messages will appear above agents and in Event Feed');
  return interval;
}

export function testRelationships() {
  // Test relationship changes
  const testRelations = [
    { source: '1', target: '3', value: 0.9, event: 'Nova и Echo стали лучшими друзьями! 💚' },
    { source: '2', target: '4', value: -0.8, event: 'Cipher и Vex поссорились 💔' },
    { source: '5', target: '7', value: 0.7, event: 'Lux и Spark начали сотрудничество ✨' },
    { source: '3', target: '4', value: 0.3, event: 'Echo помог Vex, отношения улучшились 🤝' },
    { source: '1', target: '2', value: -0.2, event: 'Nova разочаровался в Cipher 😔' },
    { source: '6', target: '8', value: 0.6, event: 'Shade и Zen нашли общий язык 🧘' },
  ];
  
  let index = 0;
  
  // Change relationship every 3 seconds
  const interval = setInterval(() => {
    const testRel = testRelations[index % testRelations.length];
    const { updateRelation, addEvent, agents } = useSimulationStore.getState();
    
    const sourceAgent = agents.find(a => a.id === testRel.source);
    const targetAgent = agents.find(a => a.id === testRel.target);
    
    if (sourceAgent && targetAgent) {
      console.log(`Updating relationship: ${sourceAgent.name} -> ${targetAgent.name} = ${testRel.value}`);
      
      // Update relationship
      updateRelation(testRel.source, testRel.target, testRel.value);
      
      // Add event to feed
      addEvent({
        type: 'global',
        message: testRel.event,
      });
    }
    
    index++;
    
    // Stop after all relations tested
    if (index >= testRelations.length) {
      clearInterval(interval);
      console.log('✅ Test relationships completed');
    }
  }, 3000);
  
  console.log('🚀 Started test relationships - will change 6 relationships with 3s interval');
  console.log('Watch the graph edges change colors and Event Feed for updates');
  return interval;
}

// Call this from browser console: testAgentMessages() or testRelationships()
if (typeof window !== 'undefined') {
  (window as any).testAgentMessages = testAgentMessages;
  (window as any).testRelationships = testRelationships;
  console.log('💡 Test functions available:');
  console.log('  - testAgentMessages() - Test message bubbles');
  console.log('  - testRelationships() - Test relationship changes');
}
