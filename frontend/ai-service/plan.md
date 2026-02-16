# Подробный план реализации ai-service на FastAPI

**Цель**: Создать сервис, который обрабатывает действия агентов (рефлексия → план → действие) с использованием LLM, векторной памяти (Qdrant) и интеграцией через Kafka (основной вариант) или HTTP (fallback).

**Общий стек**:
- Python 3.11+
- FastAPI
- aiokafka (для Kafka)
- qdrant-client
- openai / google-generativeai / yandex-gpt (выберите один LLM)
- pydantic, asyncio

**Время**: 16–18 февраля 2026 (хакатон). Разделим по дням.

## День 1 (16 февраля, сегодня) — База и подключения

- [ ] **Создать проект и окружение**
  - Создай папку `ai Crouch ai-service
  - `python -m venv venv`
  - `source venv/bin/activate`
  - `pip install fastapi uvicorn aiokafka qdrant-client openai pydantic python-dotenv`

- [ ] **Запустить Qdrant в Docker**
  - `docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant`
  - Проверь http://localhost:6333/dashboard

- [ ] **Создать структуру проекта**
  ```
  ai-service/
  ├── main.py
  ├── config.py
  ├── models.py
  ├── llm/
  │   ├── client.py
  │   └── prompts.py
  ├── memory/
  │   └── qdrant_service.py
  ├── kafka/
  │   └── consumer.py
  └── .env
  ```

- [ ] **Настроить .env**
  ```env
  KAFKA_BOOTSTRAP=localhost:9092
  QDRANT_URL=http://localhost:6333
  LLM_PROVIDER=openai  # или gemini / yandex
  OPENAI_API_KEY=sk-...
  ```

- [ ] **Базовый FastAPI app (main.py)**
  ```python
  from fastapi import FastAPI
  app = FastAPI(title="AI Service")

  @app.get("/")
  async def root():
      return {"status": "AI Service ready"}
  ```
  - Запусти: `uvicorn main.py:app --reload`
  - Проверь http://localhost:8000

- [ ] **Тестовый вызов LLM**
  - В llm/client.py простой вызов выбранного LLM с "Hello, world!" промптом.

## День 2 (17 февраля) — Основная логика и Kafka

### Этап 1: Модели и промпты
- [ ] **models.py** — Pydantic модели запросов/ответов
  ```python
  from pydantic import BaseModel

  class ActionRequest(BaseModel):
      agent_id: str
      personality: str
      current_context: str

  class ActionResult(BaseModel):
      agent_id: str
      action_text: str
      mood_change: float = 0.0
      target_agent_id: str | None = None
  ```

- [ ] **prompts.py** — Шаблоны промптов
  ```python
  REFLECTION_PROMPT = """Ты — агент с личностью: {personality}.
  Текущий контекст: {context}
  Воспоминания: {memories}
  Что ты думаешь об этом? Кратко."""

  PLAN_PROMPT = """На основе рефлексии: {reflection}
  Составь план действий на ближайшее время."""

  ACTION_PROMPT = """Выполни план: {plan}
  Сгенерируй конкретное действие (сообщение или мысль)."""
  ```

### Этап 2: Работа с памятью (Qdrant)
- [ ] **qdrant_service.py**
  - Инициализация коллекции (если нет — создать)
  - add_memory(agent_id, text)
  - retrieve_memories(agent_id, query_text, limit=10)
  - summarize_old_memories() — если > лимита контекста

### Этап 3: Основная функция обработки
- [ ] **process_agent_action(request: ActionRequest) → ActionResult**
  - retrieve memories
  - reflection = llm(REFLECTION_PROMPT)
  - plan = llm(PLAN_PROMPT)
  - action = llm(ACTION_PROMPT)
  - add new memory
  - return result

### Этап 4: Kafka интеграция
- [ ] **kafka/consumer.py**
  ```python
  async def start_kafka_consumer():
      consumer = AIOKafkaConsumer(
          "agent.action.requested",
          bootstrap_servers=config.KAFKA_BOOTSTRAP
      )
      producer = AIOKafkaProducer(bootstrap_servers=config.KAFKA_BOOTSTRAP)
      await consumer.start()
      await producer.start()
      try:
          async for msg in consumer:
              request = ActionRequest(**json.loads(msg.value))
              result = await process_agent_action(request)
              await producer.send_and_wait(
                  "agent.action.result",
                  json.dumps(result.dict()).encode()
              )
      finally:
          await consumer.stop()
          await producer.stop()
  ```

- [ ] **main.py → startup**
  ```python
  @app.on_event("startup")
  async def startup_event():
      asyncio.create_task(start_kafka_consumer())
  ```

## День 3 (18 февраля, утро) — Fallback, тесты, полировка

- [ ] **Fallback HTTP эндпоинт (если Kafka не работает)**
  ```python
  @app.post("/process-action")
  async def http_process(request: ActionRequest):
      return await process_agent_action(request)
  ```

- [ ] **Суммаризация памяти**
  - При переполнении: LLM summarize старые → новый memory

- [ ] **Логирование и ошибки**
  - Добавь logging
  - Обработку исключений (retry для LLM)

- [ ] **Тестирование**
  - Отправь тестовое сообщение в Kafka топик (kafka-console-producer)
  - Проверь результат в agent.action.result
  - Или POST на /process-action через curl/Postman

- [ ] **Документация**
  - README.md с описанием топиков, форматов, как запустить

## Чек-лист выполнения (общий)

- [ ] Проект создан и запускается
- [ ] Qdrant подключён и работает
- [ ] LLM вызовы работают
- [ ] Retrieval и добавление памяти
- [ ] Базовая цепочка (reflection → plan → action)
- [ ] Kafka consumer/producer (или HTTP fallback)
- [ ] Обработка хотя бы 1 полного цикла с agent-service
- [ ] Суммаризация памяти (nice-to-have)
- [ ] README и примеры

**Советы**:
- Начинай с HTTP fallback — быстрее запустишь цикл.
- Потом добавь Kafka.
- Тестируй с 2–3 агентами.
- Если LLM медленный — добавь кэш или лимит токенов.

Этот план реальный за 2.5 дня. Отмечай галочки по мере выполнения. Удачи — это будет самая сложная и крутая часть проекта! 🚀