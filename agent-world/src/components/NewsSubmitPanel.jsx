import React, { useState } from 'react'
import { submitNews, reactToNews } from '../api/index.js'

export default function NewsSubmitPanel({ onNewsSubmitted, onConversationResult }) {
    const [content, setContent] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [result, setResult] = useState(null) // 'ok' | 'error'

    async function handleSubmit() {
        const text = content.trim()
        if (!text || submitting) return
        setSubmitting(true)
        setResult(null)
        try {
            // Отправляем новость в world-service
            await submitNews(text)
            // Агенты реагируют на текст
            const conversation = await reactToNews(text)
            onConversationResult?.(conversation)
            setContent('')
            setResult('ok')
            onNewsSubmitted?.()
            setTimeout(() => setResult(null), 3000)
        } catch (e) {
            console.error(e)
            setResult('error')
            setTimeout(() => setResult(null), 3000)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div style={{ padding: '12px 16px' }}>
            <div style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '7px',
                color: 'var(--accent-yellow)',
                letterSpacing: '2px',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
            }}>
                📡 INJECT NEWS EVENT
            </div>

            <textarea
                className="px-input"
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Describe a world event..."
                style={{ minHeight: '72px', fontSize: '15px', marginBottom: '10px' }}
                disabled={submitting}
            />

            <button
                className="px-btn success"
                onClick={handleSubmit}
                disabled={submitting || !content.trim()}
                style={{
                    width: '100%',
                    opacity: (submitting || !content.trim()) ? 0.4 : 1,
                    fontSize: '7px',
                }}
            >
                {submitting ? 'TRANSMITTING...' : '▶ BROADCAST EVENT'}
            </button>

            {result === 'ok' && (
                <div style={{
                    marginTop: '8px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '14px',
                    color: 'var(--accent-green)',
                    animation: 'fadeIn 0.3s ease',
                }}>
                    ✓ Event transmitted — agents reacting!
                </div>
            )}
            {result === 'error' && (
                <div style={{
                    marginTop: '8px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '14px',
                    color: 'var(--accent-pink)',
                    animation: 'fadeIn 0.3s ease',
                }}>
                    ✕ Failed — is world-service running?
                </div>
            )}
        </div>
    )
}