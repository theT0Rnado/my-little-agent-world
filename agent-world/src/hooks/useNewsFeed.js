import { useState, useEffect, useRef, useCallback } from 'react'
import { fetchNews } from '../api/index.js'

export function useNewsFeed(intervalMs = 10000) {
  const [allNews, setAllNews] = useState([])
  const [notifications, setNotifications] = useState([]) // queue of popups
  const seenIds = useRef(new Set())
  const initialized = useRef(false)

  const dismissNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const load = useCallback(async () => {
    try {
      const data = await fetchNews()
      if (!Array.isArray(data)) return

      setAllNews(data)

      if (!initialized.current) {
        // First load: mark all as seen, don't notify
        data.forEach(n => seenIds.current.add(n.id))
        initialized.current = true
        return
      }

      // Subsequent loads: find new ones
      const newItems = data.filter(n => !seenIds.current.has(n.id))
      newItems.forEach(n => seenIds.current.add(n.id))

      if (newItems.length > 0) {
        setNotifications(prev => [
          ...prev,
          ...newItems.map(n => ({ ...n, _notifKey: `${n.id}-${Date.now()}` }))
        ])
      }
    } catch (e) {
      console.error('News feed error:', e)
    }
  }, [])

  useEffect(() => {
    load()
    const timer = setInterval(load, intervalMs)
    return () => clearInterval(timer)
  }, [load, intervalMs])

  return { allNews, notifications, dismissNotification, refreshNews: load }
}
