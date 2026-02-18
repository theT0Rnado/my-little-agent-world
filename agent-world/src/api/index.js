const AI_URL = '/api/v1/conversation'
const WORLD_URL = '/api/v1'

// ─── Agents (заглушка) ────────────────────────────────────
export async function fetchAgents() {
  return [
    { id: 1, name: 'Alpha', personality: 'оптимист', moodLevel: 60, mood: 'NEUTRAL', x: 3, y: 4 },
    { id: 2, name: 'Beta',  personality: 'скептик',  moodLevel: 60, mood: 'NEUTRAL', x: 7, y: 6 },
    { id: 3, name: 'Gamma', personality: 'философ',  moodLevel: 60, mood: 'NEUTRAL', x: 5, y: 8 },
  ]
}

// ─── Topics & Conversation ────────────────────────────────
export async function fetchTopics() {
  const res = await fetch(`${AI_URL}/topics`)
  if (!res.ok) throw new Error(`Topics fetch failed: ${res.status}`)
  return res.json()
}

export async function startConversation(topic) {
  const res = await fetch(`${AI_URL}?topic=${topic}`, {
    method: 'POST',
  })
  if (!res.ok) throw new Error(`Conversation failed: ${res.status}`)
  return res.json()
}

export async function fetchConversations() {
  const res = await fetch(`${WORLD_URL}/conversations`)
  if (!res.ok) throw new Error(`Conversations fetch failed: ${res.status}`)
  return res.json()
}

// ─── React to news (агенты реагируют на текст пользователя) ──
export async function reactToNews(content) {
  const res = await fetch(`${AI_URL}/react-to-news`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  })
  if (!res.ok) throw new Error(`React to news failed: ${res.status}`)
  return res.json()
}

// ─── News ─────────────────────────────────────────────────
export async function fetchNews() {
  const res = await fetch(`${WORLD_URL}/news`)
  if (!res.ok) throw new Error(`News fetch failed: ${res.status}`)
  return res.json()
}

export async function fetchNewsById(id) {
  const res = await fetch(`${WORLD_URL}/news/${id}`)
  if (!res.ok) throw new Error(`News fetch failed: ${res.status}`)
  return res.json()
}

export async function submitNews(content) {
  const res = await fetch(`${WORLD_URL}/news`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  })
  if (!res.ok) throw new Error(`Submit news failed: ${res.status}`)
  return res.json()
}

// ─── Send message (заглушка) ──────────────────────────────
export async function sendMessageToAgent(agentId, message) {
  console.warn('sendMessageToAgent не реализован в этой версии')
  return null
}