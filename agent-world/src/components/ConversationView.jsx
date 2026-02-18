import React from 'react'

const MOOD_COLOR = {
    ECSTATIC: '#ffe600',
    HAPPY:    '#39ff14',
    NEUTRAL:  '#00f5ff',
    ANGRY:    '#ff6b35',
    FURIOUS:  '#ff2d78',
}

const AGENT_COLORS = {
    Alpha: '#39ff14',
    Beta:  '#00f5ff',
    Gamma: '#b44fff',
}

export default function ConversationView({ conversation, onClose }) {
    if (!conversation) return null
    console.log('conversation data:', conversation)
    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(2px)',
        }}
             onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div style={{
                width: '600px',
                maxWidth: '95vw',
                maxHeight: '85vh',
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--bg-mid)',
                border: '2px solid var(--accent-cyan)',
                boxShadow: '0 0 30px rgba(0,245,255,0.3)',
                overflow: 'hidden',
            }}>
                {/* Header */}
                <div style={{
                    padding: '14px 20px',
                    borderBottom: '2px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(0,245,255,0.05)',
                }}>
                    <div>
                        <div style={{
                            fontFamily: 'var(--font-pixel)',
                            fontSize: '8px',
                            color: 'var(--accent-cyan)',
                            letterSpacing: '2px',
                            marginBottom: '6px',
                        }}>
                            💬 {conversation.topicDisplayName?.toUpperCase()}
                        </div>
                        <MoodBar label="Alpha" value={conversation.alphaFinalMood} color={AGENT_COLORS.Alpha} />
                        <MoodBar label="Beta"  value={conversation.betaFinalMood}  color={AGENT_COLORS.Beta} />
                        <MoodBar label="Gamma" value={conversation.gammaFinalMood} color={AGENT_COLORS.Gamma} />
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

                {/* Messages */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '16px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                }}>
                    {conversation.messages?.map((msg, i) => {
                        const agentColor = AGENT_COLORS[msg.agentName] || '#00f5ff'
                        const moodColor = MOOD_COLOR[msg.mood] || '#00f5ff'
                        return (
                            <div
                                key={i}
                                style={{
                                    display: 'flex',
                                    gap: '12px',
                                    animation: `fadeIn 0.3s ease ${i * 0.1}s both`,
                                }}
                            >
                                {/* Avatar */}
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    flexShrink: 0,
                                    border: `2px solid ${agentColor}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: `${agentColor}11`,
                                    fontFamily: 'var(--font-pixel)',
                                    fontSize: '6px',
                                    color: agentColor,
                                }}>
                                    {msg.agentName?.[0]}
                                </div>

                                {/* Bubble */}
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        marginBottom: '4px',
                                    }}>
                    <span style={{
                        fontFamily: 'var(--font-pixel)',
                        fontSize: '6px',
                        color: agentColor,
                    }}>
                      {msg.agentName?.toUpperCase()}
                    </span>
                                        <span style={{ fontSize: '14px' }}>{msg.moodEmoji}</span>
                                        <span style={{
                                            fontFamily: 'var(--font-pixel)',
                                            fontSize: '5px',
                                            color: moodColor,
                                            opacity: 0.7,
                                        }}>
                      {msg.mood} ({msg.moodLevel})
                    </span>
                                    </div>
                                    <div style={{
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '18px',
                                        color: 'var(--text-primary)',
                                        lineHeight: 1.5,
                                        padding: '10px 14px',
                                        background: `${agentColor}08`,
                                        border: `1px solid ${agentColor}33`,
                                    }}>
                                        {msg.text}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

function MoodBar({ label, value, color }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
      <span style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '5px',
          color: color,
          width: '36px',
      }}>
        {label}
      </span>
            <div style={{
                width: '120px',
                height: '6px',
                background: 'rgba(255,255,255,0.1)',
                border: `1px solid ${color}44`,
            }}>
                <div style={{
                    width: `${value}%`,
                    height: '100%',
                    background: color,
                    transition: 'width 0.5s ease',
                    boxShadow: `0 0 4px ${color}`,
                }} />
            </div>
            <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '14px',
                color: color,
            }}>
        {value}
      </span>
        </div>
    )
}