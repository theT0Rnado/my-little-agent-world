# My Little Agent World — Frontend

React/Vite frontend for the AI agent simulation microservices system.

## Tech Stack

- React 18 + Vite 5
- Pixel art aesthetic (Press Start 2P + VT323 fonts)
- No UI library dependencies — pure CSS + React

## Setup

```bash
npm install
npm run dev
```

Frontend runs on **http://localhost:5173**

## Backend Requirements

API Gateway must be running on **http://localhost:8000**

The Vite dev server proxies all `/api` requests to `:8000`:

| Frontend path       | Backend service    | Endpoint                        |
|---------------------|--------------------|---------------------------------|
| GET /api/agent/     | agent-service      | GET /api/agent/                 |
| GET /api/agent/:id  | agent-service      | GET /api/agent/:id              |
| POST /api/agent/:id/message | agent-service | POST /api/agent/:id/message  |
| GET /api/v1/news/   | world-service      | GET /api/v1/news/               |
| POST /api/v1/news/  | world-service      | POST /api/v1/news/              |

## Features

### 🗺 World Grid
- 16×10 abstract game-like grid with procedural terrain (plains, forest, mountain, water)
- Each agent positioned by their `position.x` / `position.y` from backend
- Click any agent token to open detail modal
- Agents float and glow with mood-color aura

### 👾 Agent Modal
- **INFO tab**: personality, memories (recollections), plans
- **CHAT tab**: real-time message exchange via `/api/agent/:id/message`
- Mood-colored borders and UI accents

### 📡 Breaking News Popups
- Polls news every 10 seconds
- New items appear as sliding toast notifications (auto-dismiss after 8s)
- Progress bar shows time remaining

### 📋 Sidebar
- **AGENTS**: list of all agents with mood indicator, click to open modal
- **LOG**: full news event history
- **EVENT**: form to manually inject world news (POST to world-service)

### ⏱ Polling
- Agents: every 10 seconds
- News: every 10 seconds (new items trigger popup notifications)

## Pixel Art Style

- **Primary font**: Press Start 2P (headers, labels)
- **Body font**: VT323 (readable text, chat messages)
- **Color scheme**: dark navy base with neon cyan/green/yellow/pink accents
- **Scanline overlay**: CSS repeating gradient for CRT effect
- **Mood colors**:
  - 😄 HAPPY → #39ff14 (neon green)
  - 😢 SAD → #4488ff (blue)
  - 😡 ANGRY → #ff2d78 (hot pink)
  - 😐 NEUTRAL → #00f5ff (cyan)
  - 🤩 EXCITED → #ffe600 (yellow)
  - 😴 TIRED → #9966cc (purple)

## API Response Shapes Expected

### Agent (GET /api/agent/)
```json
[{
  "id": 1,
  "name": "Agent Alpha",
  "personality": "Curious and analytical",
  "mood": "HAPPY",
  "position": { "x": 3, "y": 7 },
  "recollections": [{ "id": 1, "text": "...", "timestamp": "..." }],
  "plans": [{ "id": 1, "text": "..." }]
}]
```

### News (GET /api/v1/news/)
```json
[{
  "id": 1,
  "content": "A major storm is approaching...",
  "status": "PUBLISHED",
  "createdAt": "2026-01-01T12:00:00"
}]
```
