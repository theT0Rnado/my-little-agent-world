import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { formatTimestamp, getEventIcon } from '@/lib/utils';
import { useSimulationStore } from '@/stores/simulationStore';

export function EventFeed() {
  const events = useSimulationStore((state) => state.events);

  return (
    <Card className="h-full bg-slate-900/50 border-slate-700">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-cyan-400">Event Feed</h2>
      </div>
      
      <ScrollArea className="h-[calc(100%-4rem)]">
        <div className="p-4 space-y-2">
          <AnimatePresence initial={false}>
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="p-3 bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getEventIcon(event.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {event.agentName && (
                          <span className="text-sm font-medium text-cyan-400">
                            {event.agentName}
                          </span>
                        )}
                        <span className="text-xs text-slate-500">
                          {formatTimestamp(event.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300">{event.message}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </Card>
  );
}
