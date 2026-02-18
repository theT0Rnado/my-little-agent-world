import React, { useState, useEffect } from 'react'
import { fetchTopics, startConversation } from '../api/index.js'

const TOPIC_EMOJI = {
    KINDNESS: '💝',
    FRIENDSHIP: '🤝',
    SUCCESS: '🏆',
    WEATHER: '🌤',
    CONFLICT: '⚔️',
    BETRAYAL: '🗡️',
    FAILURE: '💔',
}

export default function TopicButtons({ onConversationResult }) {
    const [topics, setTopics] = useState([])
    const [loading, setLoading] = useState(false)
    const [activeTopic, setActiveTopic] = useState(null)

    useEffect(() => {
        fetchTopics().then(setTopics).catch(console.error)
    }, [])

    async function handleTopicClick(topic) {
        if (loading) return
        setLoading(true)
        setActiveTopic(topic.key)
        try {
            const result = await startConversation(topic.key)
            onConversationResult?.(result)
        } catch (e) {
            console.error('Conversation error:', e)
        } finally {
            setLoading(false)
            setActiveTopic(null)
        }
    }

    const positive = topics.filter(t => t.moodEffect > 0)
    const neutral   = topics.filter(t => t.moodEffect === 0)
    const negative  = topics.filter(t => t.moodEffect < 0)

    return (
        <div style={{ padding: '12px 16px' }}>
            <div style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '7px',
                color: 'var(--accent-cyan)',
                letterSpacing: '2px',
                marginBottom: '12px',
            }}>
                💬 CHOOSE TOPIC
            </div>

            <TopicGroup
                label="POSITIVE" color="var(--accent-green)"
                topics={positive} activeTopic={activeTopic}
                loading={loading} onClick={handleTopicClick}
            />
            <TopicGroup
                label="NEUTRAL" color="var(--accent-yellow)"
                topics={neutral} activeTopic={activeTopic}
                loading={loading} onClick={handleTopicClick}
            />
            <TopicGroup
                label="NEGATIVE" color="var(--accent-pink)"
                topics={negative} activeTopic={activeTopic}
                loading={loading} onClick={handleTopicClick}
            />
        </div>
    )
}

function TopicGroup({ label, color, topics, activeTopic, loading, onClick }) {
    if (!topics.length) return null
    return (
        <div style={{ marginBottom: '12px' }}>
            <div style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '5px',
                color: color,
                letterSpacing: '1px',
                marginBottom: '6px',
                opacity: 0.7,
            }}>
                ▸ {label}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {topics.map(t => (
                    <button
                        key={t.key}
                        onClick={() => onClick(t)}
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '8px 10px',
                            background: activeTopic === t.key ? `${color}22` : 'transparent',
                            border: `1px solid ${activeTopic === t.key ? color : color + '44'}`,
                            color: color,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '16px',
                            textAlign: 'left',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            opacity: loading && activeTopic !== t.key ? 0.4 : 1,
                            transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => {
                            if (!loading) e.currentTarget.style.background = `${color}15`
                        }}
                        onMouseLeave={e => {
                            if (activeTopic !== t.key) e.currentTarget.style.background = 'transparent'
                        }}
                    >
                        <span>{TOPIC_EMOJI[t.key] || '💬'}</span>
                        <span>{t.displayName}</span>
                        {activeTopic === t.key && (
                            <span style={{
                                marginLeft: 'auto',
                                fontFamily: 'var(--font-pixel)',
                                fontSize: '5px',
                                animation: 'blink 0.7s infinite',
                            }}>
                ...
              </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    )
}