import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatTimestamp, getEventIcon } from '@/lib/utils';
import { useSimulationStore } from '@/stores/simulationStore';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function EventFeed() {
  const [isExpanded, setIsExpanded] = useState(false);
  const events = useSimulationStore((state) => state.events);
  const latestEvent = events[0]; // Get the most recent event

  return (
    <Card className="bg-gray-950 border-gray-800 flex flex-col p-0 overflow-hidden">
      <div 
        className="px-3 py-1.5 bg-gray-800 border-b border-gray-700 flex items-center justify-between cursor-pointer hover:bg-gray-750 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-gray-200">Event Feed</h2>
          <span className="text-xs text-gray-500">({events.length})</span>
        </div>
        <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
          {isExpanded ? (
            <ChevronDown className="h-3 w-3 text-gray-400" />
          ) : (
            <ChevronUp className="h-3 w-3 text-gray-400" />
          )}
        </Button>
      </div>
      
      {/* Preview of latest event when collapsed */}
      {!isExpanded && latestEvent && (
        <div className="px-2 pb-1.5">
          <Card className="p-1.5 bg-gray-900 border-gray-800">
            <div className="flex items-start gap-1.5">
              <span className="text-base">{getEventIcon(latestEvent.type)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  {latestEvent.agentName && (
                    <span className="text-xs font-medium text-gray-300">
                      {latestEvent.agentName}
                    </span>
                  )}
                  <span className="text-xs text-gray-600">
                    {formatTimestamp(latestEvent.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-gray-400 line-clamp-1">{latestEvent.message}</p>
              </div>
            </div>
          </Card>
        </div>
      )}
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <ScrollArea className="h-64">
              <div className="p-2 space-y-1.5">
                {events.slice(0, 10).map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                  >
                    <Card className="p-1.5 bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors">
                      <div className="flex items-start gap-1.5">
                        <span className="text-base">{getEventIcon(event.type)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            {event.agentName && (
                              <span className="text-xs font-medium text-gray-300">
                                {event.agentName}
                              </span>
                            )}
                            <span className="text-xs text-gray-600">
                              {formatTimestamp(event.timestamp)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 line-clamp-2">{event.message}</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
