import React, { useState, useCallback } from 'react'
import { fetchAgents } from './api/index.js'
import { usePolling } from './hooks/usePolling.js'
import { useNewsFeed } from './hooks/useNewsFeed.js'
import WorldGrid from './components/WorldGrid.jsx'
import AgentModal from './components/AgentModal.jsx'
import Sidebar from './components/Sidebar.jsx'
import StatusBar from './components/StatusBar.jsx'
import NewsNotifications from './components/NewsNotifications.jsx'
import ConversationView from './components/ConversationView.jsx'

const fetchAgentsFn = () => fetchAgents()

export default function App() {
  const [selectedAgent, setSelectedAgent] = useState(null)

  // Состояние для разговора агентов
  const [conversation, setConversation] = useState(null)

  const {
    data: agents,
    error: agentError,
    loading: agentLoading,
    refresh: refreshAgents,
  } = usePolling(fetchAgentsFn, 10000)

  const {
    allNews,
    notifications,
    dismissNotification,
    refreshNews,
  } = useNewsFeed(10000)

  const handleAgentClick = useCallback((agent) => {
    setSelectedAgent(agent)
  }, [])

  const handleModalClose = useCallback(() => {
    setSelectedAgent(null)
  }, [])

  const handleNewsSubmitted = useCallback(() => {
    refreshNews()
  }, [refreshNews])

  // Когда пришёл результат разговора — показываем модалку
  const handleConversationResult = useCallback((result) => {
    setConversation(result)
  }, [])

  const hasError = agentError

  return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      }}>
        {/* Шапка */}
        <StatusBar
            agentCount={agents?.length}
            newsCount={allNews?.length}
            error={hasError}
        />

        {/* Основной контент */}
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>

          {/* Карта мира */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            {agentLoading && !agents && <LoadingOverlay />}
            {agentError && !agents && (
                <ErrorOverlay error={agentError} onRetry={refreshAgents} />
            )}
            <WorldGrid
                agents={agents || []}
                onAgentClick={handleAgentClick}
            />

            {/* Легенда */}
            <div style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              background: 'rgba(10,10,26,0.85)',
              border: '1px solid var(--border-color)',
              padding: '8px 12px',
              pointerEvents: 'none',
            }}>
              <div style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '5px',
                color: 'var(--text-dim)',
                marginBottom: '6px',
                letterSpacing: '1px',
              }}>
                TERRAIN
              </div>
              {[
                { symbol: '·',  label: 'PLAINS'   },
                { symbol: '🌲', label: 'FOREST'   },
                { symbol: '⛰', label: 'MOUNTAIN' },
                { symbol: '≈',  label: 'WATER'    },
              ].map(t => (
                  <div key={t.label} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '3px',
                  }}>
                    <span style={{ fontSize: '10px' }}>{t.symbol}</span>
                    <span style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '5px',
                      color: 'var(--text-dim)',
                    }}>
                  {t.label}
                </span>
                  </div>
              ))}
            </div>
          </div>

          {/* Правый сайдбар */}
          <Sidebar
              agents={agents}
              allNews={allNews}
              onAgentClick={handleAgentClick}
              onNewsSubmitted={handleNewsSubmitted}
              onConversationResult={handleConversationResult}
          />
        </div>

        {/* Уведомления о новостях */}
        <NewsNotifications
            notifications={notifications}
            onDismiss={dismissNotification}
        />

        {/* Модалка агента */}
        {selectedAgent && (
            <AgentModal
                agent={selectedAgent}
                onClose={handleModalClose}
            />
        )}

        {/* Модалка разговора агентов */}
        {conversation && (
            <ConversationView
                conversation={conversation}
                onClose={() => setConversation(null)}
            />
        )}
      </div>
  )
}

function LoadingOverlay() {
  return (
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-dark)',
        zIndex: 10,
        gap: '20px',
      }}>
        <div style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '10px',
          color: 'var(--accent-cyan)',
          textShadow: '0 0 10px var(--accent-cyan)',
          animation: 'blink 1s infinite',
          letterSpacing: '3px',
        }}>
          LOADING WORLD...
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '16px',
          color: 'var(--text-dim)',
        }}>
          Connecting to agent-service...
        </div>
      </div>
  )
}

function ErrorOverlay({ error, onRetry }) {
  return (
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-dark)',
        zIndex: 10,
        gap: '16px',
      }}>
        <div style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '9px',
          color: 'var(--accent-pink)',
          textShadow: '0 0 10px var(--accent-pink)',
          letterSpacing: '2px',
        }}>
          CONNECTION LOST
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '16px',
          color: 'var(--text-dim)',
          maxWidth: '400px',
          textAlign: 'center',
          lineHeight: 1.5,
        }}>
          {error}
          <br />
          <span style={{ opacity: 0.6 }}>
          Make sure services are running on :8082 and :8083
        </span>
        </div>
        <button className="px-btn" onClick={onRetry}>↺ RETRY</button>
      </div>
  )
}