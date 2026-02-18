import React, { useState } from 'react'
import PixelAvatar from './PixelAvatar.jsx'
import NewsSubmitPanel from './NewsSubmitPanel.jsx'
import TopicButtons from './TopicButtons.jsx'

const MOOD_COLOR = {
    HAPPY: '#39ff14', SAD: '#4488ff', ANGRY: '#ff2d78',
    NEUTRAL: '#00f5ff', EXCITED: '#ffe600', TIRED: '#9966cc',
    ECSTATIC: '#ffe600', FURIOUS: '#ff2d78',
}
const MOOD_EMOJI = {
    HAPPY: '😄', SAD: '😢', ANGRY: '😡',
    NEUTRAL: '😐', EXCITED: '🤩', TIRED: '😴',
    ECSTATIC: '🤩', FURIOUS: '🤬',
}

const TABS = [
    { key: 'agents',    label: '👾 AGENTS' },
    { key: 'news',      label: '📰 LOG'    },
    { key: 'topics',    label: '💬 CHAT'   },
    { key: 'broadcast', label: '📡 EVENT'  },
]

export default function Sidebar({ agents, allNews, onAgentClick, onNewsSubmitted, onConversationResult }) {
    const [tab, setTab] = useState('agents')

    return (
        <div style={{
            width: '260px',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg-mid)',
            borderLeft: '2px solid var(--border-color)',
            height: '100%',
        }}>
            {/* ── Вкладки ── */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                borderBottom: '2px solid var(--border-color)',
            }}>
                {TABS.map(t => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        style={{
                            padding: '10px 2px',
                            background: tab === t.key ? 'rgba(0,245,255,0.08)' : 'transparent',
                            border: 'none',
                            borderBottom: tab === t.key ? '2px solid var(--accent-cyan)' : '2px solid transparent',
                            color: tab === t.key ? 'var(--accent-cyan)' : 'var(--text-dim)',
                            fontFamily: 'var(--font-pixel)',
                            fontSize: '4.5px',
                            cursor: 'pointer',
                            letterSpacing: '0.3px',
                            transition: 'all 0.15s',
                            textAlign: 'center',
                            lineHeight: 1.4,
                        }}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ── Контент вкладки ── */}
            <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>

                {tab === 'agents' && (
                    <AgentList agents={agents} onAgentClick={onAgentClick} />
                )}

                {tab === 'news' && (
                    <NewsLog news={allNews} />
                )}

                {tab === 'topics' && (
                    <TopicButtons onConversationResult={onConversationResult} />
                )}

                {tab === 'broadcast' && (
                    <NewsSubmitPanel
                        onNewsSubmitted={onNewsSubmitted}
                        onConversationResult={onConversationResult}
                    />
                )}

            </div>
        </div>
    )
}

// ─── Список агентов ───────────────────────────────────────
function AgentList({ agents, onAgentClick }) {
    if (!agents || agents.length === 0) {
        return (
            <div style={{
                padding: '20px',
                fontFamily: 'var(--font-mono)',
                fontSize: '16px',
                color: 'var(--text-dim)',
                textAlign: 'center',
                lineHeight: 1.8,
            }}>
                <span style={{ animation: 'blink 1.2s infinite', display: 'inline-block' }}>▋</span>
                <br />SCANNING FOR AGENTS...
            </div>
        )
    }

    return (
        <div style={{ padding: '8px' }}>
            {agents.map(agent => {
                const c = MOOD_COLOR[agent.mood] || '#00f5ff'
                return (
                    <button
                        key={agent.id}
                        onClick={() => onAgentClick(agent)}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px',
                            marginBottom: '4px',
                            background: 'transparent',
                            border: `1px solid ${c}22`,
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = `${c}12`
                            e.currentTarget.style.borderColor = `${c}66`
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = 'transparent'
                            e.currentTarget.style.borderColor = `${c}22`
                        }}
                    >
                        <div style={{ filter: `drop-shadow(0 0 4px ${c})` }}>
                            <PixelAvatar agent={agent} size={32} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                                fontFamily: 'var(--font-pixel)',
                                fontSize: '7px',
                                color: c,
                                marginBottom: '3px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}>
                                {agent.name}
                            </div>
                            <div style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '13px',
                                color: 'var(--text-dim)',
                            }}>
                                {MOOD_EMOJI[agent.mood] || '🤖'} {agent.mood}
                            </div>
                        </div>
                    </button>
                )
            })}
        </div>
    )
}

// ─── Лента новостей ───────────────────────────────────────
function NewsLog({ news }) {
    if (!news || news.length === 0) {
        return (
            <div style={{
                padding: '20px',
                fontFamily: 'var(--font-mono)',
                fontSize: '16px',
                color: 'var(--text-dim)',
                textAlign: 'center',
            }}>
                NO EVENTS RECORDED
            </div>
        )
    }

    return (
        <div style={{ padding: '8px' }}>
            {[...news].reverse().map(n => (
                <div key={n.id} style={{
                    marginBottom: '8px',
                    padding: '10px 12px',
                    background: 'rgba(255,230,0,0.04)',
                    border: '1px solid rgba(255,230,0,0.15)',
                    animation: 'fadeIn 0.3s ease',
                }}>
                    <div style={{
                        fontFamily: 'var(--font-pixel)',
                        fontSize: '6px',
                        color: 'var(--accent-yellow)',
                        marginBottom: '5px',
                        display: 'flex',
                        justifyContent: 'space-between',
                    }}>
                        <span>EVENT #{n.id}</span>
                        <span style={{
                            padding: '1px 5px',
                            border: '1px solid rgba(255,230,0,0.3)',
                            fontSize: '5px',
                        }}>
                            {n.status}
                        </span>
                    </div>
                    <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '14px',
                        color: 'var(--text-primary)',
                        lineHeight: 1.4,
                    }}>
                        {n.content}
                    </div>
                    {n.createdAt && (
                        <div style={{
                            marginTop: '4px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '12px',
                            color: 'var(--text-dim)',
                            opacity: 0.6,
                        }}>
                            {new Date(n.createdAt).toLocaleString()}
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}