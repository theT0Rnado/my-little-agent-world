import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Mood } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getMoodColor(mood: Mood): string {
  const colors = {
    happy: 'text-green-400 border-green-400',
    sad: 'text-blue-400 border-blue-400',
    angry: 'text-red-400 border-red-400',
    neutral: 'text-gray-400 border-gray-400',
    excited: 'text-cyan-400 border-cyan-400',
    tired: 'text-purple-400 border-purple-400'
  }
  return colors[mood]
}

export function getMoodEmoji(mood: Mood): string {
  const emojis = {
    happy: '😊',
    sad: '😢',
    angry: '😠',
    neutral: '😐',
    excited: '🤩',
    tired: '😴'
  }
  return emojis[mood]
}

export function formatTimestamp(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ago`
}

export function getEventIcon(type: string): string {
  const icons = {
    message: '💬',
    global: '🌍',
    thought: '💭',
    action: '⚡'
  }
  return icons[type as keyof typeof icons] || '📌'
}
