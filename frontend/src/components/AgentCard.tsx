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
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`p-2 cursor-pointer transition-all ${
          isSelected
            ? 'border-gray-500 glow-cyan-strong bg-gray-900'
            : 'border-gray-800 hover:border-gray-600 hover:glow-cyan bg-gray-950'
        }`}
        onClick={onClick}
      >
        <div className="flex items-center gap-2">
          <Avatar className="h-10 w-10 border-2 border-gray-700 shrink-0">
            <AvatarImage src={avatarUrl} alt={agent.name} />
            <AvatarFallback className="bg-gray-800 text-gray-300 text-xs font-bold">
              {agent.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-semibold text-white truncate">{agent.name}</h3>
              <Badge
                variant="outline"
                className={`${getMoodColor(agent.mood)} text-xs shrink-0`}
              >
                {getMoodEmoji(agent.mood)}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 truncate mt-0.5">
              {agent.personality.slice(0, 35)}...
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
