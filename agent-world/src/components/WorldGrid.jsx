import React, { useCallback } from 'react'
import PixelAvatar from './PixelAvatar.jsx'

const GRID_COLS = 16
const GRID_ROWS = 10

const MOOD_GLOW = {
  HAPPY:    '#39ff14',
  SAD:      '#4488ff',
  ANGRY:    '#ff2d78',
  NEUTRAL:  '#00f5ff',
  EXCITED:  '#ffe600',
  TIRED:    '#9966cc',
}

const TERRAIN = (() => {
  // Pseudo-random terrain tiles (mountain, water, plains, forest)
  const types = ['plain','plain','plain','plain','plain','forest','forest','mountain','water','water']
  const grid = []
  let seed = 42
  const rng = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff
    return (seed >>> 0) / 0xffffffff
  }
  for (let r = 0; r < GRID_ROWS; r++) {
    const row = []
    for (let c = 0; c < GRID_COLS; c++) {
      row.push(types[Math.floor(rng() * types.length)])
    }
    grid.push(row)
  }
  return grid
})()

const TERRAIN_STYLE = {
  plain:    { bg: '#0d1f2d', border: '#0f2a3a', symbol: null },
  forest:   { bg: '#0a1f10', border: '#0f2a15', symbol: '🌲' },
  mountain: { bg: '#1a1a1a', border: '#252525', symbol: '⛰' },
  water:    { bg: '#071428', border: '#0a1e3a', symbol: '≈' },
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val))
}

export default function WorldGrid({ agents, onAgentClick }) {
  // Map agent position (x,y) from backend to grid cell
  // Backend stores arbitrary x/y; we mod them to grid size
  const agentsByCell = {}
  if (agents) {
    agents.forEach(agent => {
      const x = agent.position?.x != null
        ? clamp(Math.round(agent.position.x) % GRID_COLS, 0, GRID_COLS - 1)
        : (hashId(agent.id) % GRID_COLS)
      const y = agent.position?.y != null
        ? clamp(Math.round(agent.position.y) % GRID_ROWS, 0, GRID_ROWS - 1)
        : (hashId(agent.id * 17) % GRID_ROWS)
      const key = `${x}-${y}`
      if (!agentsByCell[key]) agentsByCell[key] = []
      agentsByCell[key].push(agent)
    })
  }

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'auto', padding: '4px' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
        gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
        gap: '1px',
        width: '100%',
        height: '100%',
        minWidth: '640px',
        minHeight: '400px',
      }}>
        {TERRAIN.map((row, r) =>
          row.map((terrain, c) => {
            const key = `${c}-${r}`
            const cellAgents = agentsByCell[key] || []
            const ts = TERRAIN_STYLE[terrain]

            return (
              <div
                key={key}
                style={{
                  background: ts.bg,
                  border: `1px solid ${ts.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  minWidth: 0,
                  minHeight: 0,
                  overflow: 'visible',
                }}
              >
                {/* Terrain symbol */}
                {ts.symbol && cellAgents.length === 0 && (
                  <span style={{
                    fontSize: '10px',
                    opacity: 0.25,
                    pointerEvents: 'none',
                    userSelect: 'none',
                  }}>
                    {ts.symbol}
                  </span>
                )}

                {/* Grid coordinates (subtle) */}
                <span style={{
                  position: 'absolute',
                  bottom: '1px',
                  right: '2px',
                  fontSize: '5px',
                  color: 'rgba(255,255,255,0.05)',
                  fontFamily: 'monospace',
                  pointerEvents: 'none',
                  lineHeight: 1,
                }}>
                  {c},{r}
                </span>

                {/* Agents in this cell */}
                {cellAgents.map((agent, i) => (
                  <AgentToken
                    key={agent.id}
                    agent={agent}
                    offset={i}
                    onClick={() => onAgentClick(agent)}
                  />
                ))}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

function AgentToken({ agent, offset, onClick }) {
  const glowColor = MOOD_GLOW[agent.mood] || '#00f5ff'
  return (
    <button
      onClick={onClick}
      title={`${agent.name} [${agent.mood}]`}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(calc(-50% + ${offset * 8}px), -50%)`,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        zIndex: 2,
        animation: 'float 2.5s ease-in-out infinite',
        animationDelay: `${(agent.id % 10) * 0.3}s`,
        filter: `drop-shadow(0 0 4px ${glowColor})`,
        transition: 'filter 0.2s, transform 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.filter = `drop-shadow(0 0 10px ${glowColor})`
        e.currentTarget.style.zIndex = '10'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.filter = `drop-shadow(0 0 4px ${glowColor})`
        e.currentTarget.style.zIndex = '2'
      }}
    >
      <PixelAvatar agent={agent} size={28} />
    </button>
  )
}

function hashId(id) {
  return Math.abs(Math.round(id * 2654435761) % 10000)
}
