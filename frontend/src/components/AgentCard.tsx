import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getMoodColor, getMoodEmoji } from '@/lib/utils';
import type { Agent } from '@/types';

interface AgentCardProps {
  agent: Agent;
  onClick: () => void;
  isSelected: boolean;
}

export function AgentCard({ agent, onClick, isSelected }: AgentCardProps) {
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${agent.name}`;

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`p-4 cursor-pointer transition-all ${
          isSelected
            ? 'border-cyan-400 glow-cyan-strong bg-slate-900'
            : 'border-slate-700 hover:border-cyan-500 hover:glow-cyan bg-slate-900/50'
        }`}
        onClick={onClick}
      >
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-slate-700">
            <AvatarImage src={avatarUrl} alt={agent.name} />
            <AvatarFallback className="bg-slate-800 text-cyan-400 font-bold">
              {agent.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white truncate">{agent.name}</h3>
              <Badge
                variant="outline"
                className={`${getMoodColor(agent.mood)} text-xs`}
              >
                {getMoodEmoji(agent.mood)}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 truncate mt-1">
              {agent.personality.slice(0, 40)}...
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
