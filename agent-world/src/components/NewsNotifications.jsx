import React, { useEffect } from 'react'

export default function NewsNotifications({ notifications, onDismiss }) {
  return (
    <div style={{
      position: 'fixed',
      top: '70px',
      right: '16px',
      zIndex: 800,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      maxWidth: '320px',
      pointerEvents: 'none',
    }}>
      {notifications.slice(-5).map(n => (
        <NewsPopup key={n._notifKey} news={n} onDismiss={() => onDismiss(n.id)} />
      ))}
    </div>
  )
}

function NewsPopup({ news, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 8000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div style={{
      background: 'var(--bg-mid)',
      border: '2px solid var(--accent-yellow)',
      boxShadow: '0 0 16px rgba(255,230,0,0.3)',
      padding: '12px 14px',
      animation: 'newsSlideIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      pointerEvents: 'all',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Progress bar */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        height: '2px',
        background: 'var(--accent-yellow)',
        animation: 'newsProgress 8s linear forwards',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '7px',
            color: 'var(--accent-yellow)',
            marginBottom: '6px',
            letterSpacing: '2px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <span style={{ animation: 'blink 1s infinite' }}>●</span>
            BREAKING NEWS
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '15px',
            color: 'var(--text-primary)',
            lineHeight: 1.4,
            wordBreak: 'break-word',
          }}>
            {news.content}
          </div>
          {news.status && (
            <div style={{
              marginTop: '6px',
              fontFamily: 'var(--font-pixel)',
              fontSize: '6px',
              color: 'var(--text-dim)',
              letterSpacing: '1px',
            }}>
              STATUS: {news.status}
            </div>
          )}
        </div>
        <button
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-dim)',
            cursor: 'pointer',
            fontSize: '12px',
            flexShrink: 0,
            padding: '0 2px',
          }}
        >
          ✕
        </button>
      </div>

      <style>{`
        @keyframes newsProgress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}
