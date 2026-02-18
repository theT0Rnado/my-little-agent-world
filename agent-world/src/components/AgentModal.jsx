import React, { useState, useRef, useEffect } from 'react'
import PixelAvatar from './PixelAvatar.jsx'
import { sendMessageToAgent } from '../api/index.js'

const MOOD_EMOJI = {
  HAPPY: '😄', SAD: '😢', ANGRY: '😡',
  NEUTRAL: '😐', EXCITED: '🤩', TIRED: '😴',
}
const MOOD_COLOR = {
  HAPPY: '#39ff14', SAD: '#4488ff', ANGRY: '#ff2d78',
  NEUTRAL: '#00f5ff', EXCITED: '#ffe600', TIRED: '#9966cc',
}

export default function AgentModal({ agent, onClose }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState(null)
  const chatEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  async function handleSend() {
    const text = input.trim()
    if (!text || sending) return

    setMessages(prev => [...prev, { role: 'user', text, ts: Date.now() }])
    setInput('')
    setSending(true)
    setSendError(null)

    try {
      const res = await sendMessageToAgent(agent.id, text)
      const reply = res?.content || res?.message || res?.reply || '...'
      setMessages(prev => [...prev, { role: 'agent', text: reply, ts: Date.now() }])
    } catch (e) {
      setSendError('Failed to send message')
      setMessages(prev => [...prev, {
        role: 'system',
        text: '⚠ Could not reach agent. Are services running?',
        ts: Date.now()
      }])
    } finally {
      setSending(false)
    }
  }

  const moodColor = MOOD_COLOR[agent.mood] || '#00f5ff'
  const moodEmoji = MOOD_EMOJI[agent.mood] || '🤖'

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(2px)',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        width: '520px',
        maxWidth: '95vw',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-mid)',
        border: `2px solid ${moodColor}`,
        boxShadow: `0 0 30px ${moodColor}44, 0 0 60px ${moodColor}22`,
        animation: 'slideInRight 0.25s ease',
        position: 'relative',
      }}>
        {/* Header */}
        <div style={{
          borderBottom: `2px solid ${moodColor}44`,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          background: `${moodColor}08`,
        }}>
          <div style={{
            animation: 'float 2s ease-in-out infinite',
            filter: `drop-shadow(0 0 8px ${moodColor})`,
          }}>
            <PixelAvatar agent={agent} size={52} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '10px',
              color: moodColor,
              letterSpacing: '2px',
              marginBottom: '6px',
              textShadow: `0 0 8px ${moodColor}`,
            }}>
              {agent.name?.toUpperCase()}
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '16px',
              color: 'var(--text-dim)',
              marginBottom: '4px',
            }}>
              {moodEmoji} {agent.mood}
              {agent.personality && (
                <span style={{ marginLeft: '12px', color: 'var(--text-dim)', fontSize: '14px' }}>
                  · {agent.personality}
                </span>
              )}
            </div>
            {agent.position && (
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                color: 'var(--text-dim)',
                opacity: 0.6,
              }}>
                📍 x:{agent.position.x} y:{agent.position.y}
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: '2px solid var(--accent-pink)',
              color: 'var(--accent-pink)',
              cursor: 'pointer',
              fontFamily: 'var(--font-pixel)',
              fontSize: '8px',
              padding: '6px 10px',
              alignSelf: 'flex-start',
            }}
          >
            ✕
          </button>
        </div>

        {/* Tabs: Info / Chat */}
        <AgentTabs agent={agent} moodColor={moodColor}
          messages={messages} input={input} setInput={setInput}
          sending={sending} onSend={handleSend} chatEndRef={chatEndRef} inputRef={inputRef}
        />
      </div>
    </div>
  )
}

function AgentTabs({ agent, moodColor, messages, input, setInput, sending, onSend, chatEndRef, inputRef }) {
  const [tab, setTab] = useState('info')

  return (
    <>
      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
        {['info','chat'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              padding: '10px',
              background: tab === t ? `${moodColor}18` : 'transparent',
              border: 'none',
              borderBottom: tab === t ? `2px solid ${moodColor}` : '2px solid transparent',
              color: tab === t ? moodColor : 'var(--text-dim)',
              fontFamily: 'var(--font-pixel)',
              fontSize: '7px',
              cursor: 'pointer',
              letterSpacing: '1px',
              transition: 'all 0.15s',
              textTransform: 'uppercase',
            }}
          >
            {t === 'info' ? '📋 INFO' : '💬 CHAT'}
          </button>
        ))}
      </div>

      {tab === 'info' && <AgentInfo agent={agent} moodColor={moodColor} />}
      {tab === 'chat' && (
        <AgentChat
          agent={agent} moodColor={moodColor}
          messages={messages} input={input} setInput={setInput}
          sending={sending} onSend={onSend}
          chatEndRef={chatEndRef} inputRef={inputRef}
        />
      )}
    </>
  )
}

function AgentInfo({ agent, moodColor }) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
      {agent.personality && (
        <InfoSection title="PERSONALITY" color={moodColor}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', lineHeight: 1.5, color: 'var(--text-primary)' }}>
            {agent.personality}
          </p>
        </InfoSection>
      )}

      {agent.recollections?.length > 0 && (
        <InfoSection title="MEMORIES" color={moodColor}>
          {agent.recollections.map((r, i) => (
            <div key={r.id || i} style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '16px',
              color: 'var(--text-dim)',
              marginBottom: '6px',
              paddingLeft: '8px',
              borderLeft: `2px solid ${moodColor}44`,
            }}>
              › {r.text}
            </div>
          ))}
        </InfoSection>
      )}

      {agent.plans?.length > 0 && (
        <InfoSection title="PLANS" color={moodColor}>
          {agent.plans.map((p, i) => (
            <div key={p.id || i} style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '16px',
              color: 'var(--text-dim)',
              marginBottom: '6px',
              paddingLeft: '8px',
              borderLeft: `2px solid ${moodColor}44`,
            }}>
              ▸ {p.text}
            </div>
          ))}
        </InfoSection>
      )}

      {!agent.personality && !agent.recollections?.length && !agent.plans?.length && (
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '16px',
          color: 'var(--text-dim)',
          textAlign: 'center',
          marginTop: '40px',
        }}>
          [ NO DATA AVAILABLE ]
        </p>
      )}
    </div>
  )
}

function InfoSection({ title, color, children }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{
        fontFamily: 'var(--font-pixel)',
        fontSize: '7px',
        color: color,
        letterSpacing: '2px',
        marginBottom: '10px',
        opacity: 0.8,
      }}>
        ▸ {title}
      </div>
      {children}
    </div>
  )
}

function AgentChat({ agent, moodColor, messages, input, setInput, sending, onSend, chatEndRef, inputRef }) {
  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        {messages.length === 0 && (
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '16px',
            color: 'var(--text-dim)',
            textAlign: 'center',
            marginTop: '30px',
            lineHeight: 1.8,
          }}>
            [ TRANSMISSION CHANNEL OPEN ]<br/>
            <span style={{ fontSize: '13px', opacity: 0.5 }}>Send a message to {agent.name}</span>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            {msg.role !== 'user' && (
              <div style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '6px',
                color: moodColor,
                marginBottom: '4px',
                opacity: 0.7,
              }}>
                {msg.role === 'agent' ? agent.name?.toUpperCase() : 'SYSTEM'}
              </div>
            )}
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '17px',
              lineHeight: 1.5,
              padding: '10px 14px',
              background: msg.role === 'user'
                ? `${moodColor}22`
                : msg.role === 'system'
                ? 'rgba(255,45,120,0.1)'
                : 'rgba(255,255,255,0.05)',
              border: `1px solid ${
                msg.role === 'user' ? `${moodColor}66`
                : msg.role === 'system' ? 'rgba(255,45,120,0.3)'
                : 'rgba(255,255,255,0.1)'
              }`,
              color: msg.role === 'system' ? 'var(--accent-pink)' : 'var(--text-primary)',
            }}>
              {msg.text}
            </div>
          </div>
        ))}

        {sending && (
          <div style={{
            alignSelf: 'flex-start',
            fontFamily: 'var(--font-pixel)',
            fontSize: '7px',
            color: moodColor,
            animation: 'blink 1s infinite',
          }}>
            {agent.name} IS PROCESSING...
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div style={{
        borderTop: '1px solid var(--border-color)',
        padding: '12px 16px',
        display: 'flex',
        gap: '10px',
        background: 'rgba(0,0,0,0.3)',
      }}>
        <input
          ref={inputRef}
          className="px-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={`Message ${agent.name}...`}
          disabled={sending}
          style={{ flex: 1, fontSize: '16px', padding: '8px 12px' }}
        />
        <button
          className="px-btn"
          onClick={onSend}
          disabled={sending || !input.trim()}
          style={{
            borderColor: moodColor,
            color: moodColor,
            opacity: (sending || !input.trim()) ? 0.4 : 1,
          }}
        >
          {sending ? '...' : 'SEND'}
        </button>
      </div>
    </div>
  )
}
