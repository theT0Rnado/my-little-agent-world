import React, { useState, useEffect } from 'react'

export default function StatusBar({ agentCount, newsCount, error }) {
  const [time, setTime] = useState(new Date())
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const t = setInterval(() => {
      setTime(new Date())
      setTick(p => (p + 1) % 3)
    }, 1000)
    return () => clearInterval(t)
  }, [])

  const dots = '.'.repeat(tick + 1)

  return (
    <div style={{
      height: '44px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      background: 'var(--bg-mid)',
      borderBottom: '2px solid var(--border-color)',
      flexShrink: 0,
      gap: '16px',
    }}>
      {/* Title */}
      <div style={{
        fontFamily: 'var(--font-pixel)',
        fontSize: '9px',
        color: 'var(--accent-cyan)',
        letterSpacing: '2px',
        textShadow: '0 0 10px var(--accent-cyan)',
        animation: 'pulse-glow 3s ease-in-out infinite',
        whiteSpace: 'nowrap',
      }}>
        MY LITTLE AGENT WORLD
      </div>

      {/* Status indicators */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Stat label="AGENTS" value={agentCount ?? '—'} color="var(--accent-green)" />
        <Stat label="EVENTS" value={newsCount ?? '—'} color="var(--accent-yellow)" />

        {error ? (
          <div style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '6px',
            color: 'var(--accent-pink)',
            animation: 'blink 0.8s infinite',
          }}>
            ⚠ SERVICE OFFLINE
          </div>
        ) : (
          <div style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '6px',
            color: 'var(--accent-green)',
          }}>
            <span style={{ animation: 'blink 1s infinite', display: 'inline-block' }}>●</span>
            {' '}LIVE{dots}
          </div>
        )}
      </div>

      {/* Clock */}
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '18px',
        color: 'var(--text-dim)',
        letterSpacing: '2px',
        whiteSpace: 'nowrap',
      }}>
        {time.toLocaleTimeString()}
      </div>
    </div>
  )
}

function Stat({ label, value, color }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
      <span style={{
        fontFamily: 'var(--font-pixel)',
        fontSize: '5px',
        color: 'var(--text-dim)',
        letterSpacing: '1px',
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '20px',
        color,
        lineHeight: 1,
      }}>
        {value}
      </span>
    </div>
  )
}
