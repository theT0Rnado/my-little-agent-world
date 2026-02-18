import React, { useMemo } from 'react'

const MOOD_COLORS = {
  HAPPY:    { body: '#39ff14', eye: '#fff', bg: '#0a2a0a' },
  SAD:      { body: '#4488ff', eye: '#aad', bg: '#0a0a2a' },
  ANGRY:    { body: '#ff2d78', eye: '#fff', bg: '#2a0a0a' },
  NEUTRAL:  { body: '#00f5ff', eye: '#fff', bg: '#0a1a2a' },
  EXCITED:  { body: '#ffe600', eye: '#333', bg: '#2a2a00' },
  TIRED:    { body: '#9966cc', eye: '#ddd', bg: '#1a0a2a' },
}

// Deterministic pixel body from id
function hashStr(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

function getPalette(mood) {
  return MOOD_COLORS[mood] || MOOD_COLORS.NEUTRAL
}

// 8x8 pixel sprite - left half, then mirror
function generateSprite(seed) {
  const rng = (n) => {
    let x = Math.sin(seed + n) * 10000
    return x - Math.floor(x)
  }
  // 8 rows, 4 cols (mirrored to 8)
  const rows = []
  for (let r = 0; r < 8; r++) {
    const row = []
    for (let c = 0; c < 4; c++) {
      row.push(rng(r * 4 + c) > 0.45 ? 1 : 0)
    }
    rows.push([...row, ...row.slice().reverse()])
  }
  return rows
}

export default function PixelAvatar({ agent, size = 40 }) {
  const mood = agent?.mood || 'NEUTRAL'
  const palette = getPalette(mood)
  const seed = useMemo(() => hashStr(String(agent?.id || '0')), [agent?.id])
  const sprite = useMemo(() => generateSprite(seed), [seed])

  const cellSize = size / 8

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 8 8"
      style={{ imageRendering: 'pixelated', flexShrink: 0 }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="8" height="8" fill={palette.bg} />
      {sprite.map((row, r) =>
        row.map((cell, c) =>
          cell ? (
            <rect
              key={`${r}-${c}`}
              x={c}
              y={r}
              width={1}
              height={1}
              fill={palette.body}
            />
          ) : null
        )
      )}
      {/* Eyes at row 2 */}
      <rect x={2} y={2} width={1} height={1} fill={palette.eye} />
      <rect x={5} y={2} width={1} height={1} fill={palette.eye} />
    </svg>
  )
}
