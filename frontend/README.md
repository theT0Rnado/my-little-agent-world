# Agent World - Frontend

Интерактивный дашборд для симуляции мира агентов с AI.

## Технологии

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- shadcn/ui
- Zustand (state management)
- @xyflow/react (граф отношений)
- Framer Motion (анимации)
- Lucide React (иконки)

## Запуск

```bash
npm install
npm run dev
```

Откроется на `http://localhost:5173`

## Возможности

- 📊 Список агентов с настроениями
- 📜 Лента событий в реальном времени
- 🕸️ Интерактивный граф отношений
- 🎛️ Панель управления (сообщения, события, скорость)
- 📱 Drawer с детальной информацией об агенте
- 🎨 Темная sci-fi тема с неоновыми акцентами

## Структура

```
src/
├── components/     # UI компоненты
├── stores/         # Zustand store
├── types/          # TypeScript типы
├── lib/            # Утилиты
└── App.tsx         # Главный компонент
```

## Моковые данные

Все данные сейчас локальные (в `simulationStore.ts`):
- 8 агентов с разными личностями
- События и сообщения
- Граф отношений

Готово к интеграции с бэкендом через WebSocket/HTTP.
