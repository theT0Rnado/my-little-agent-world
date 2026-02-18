# MY LITTLE AGENT WORLD
**Техническая документация проекта** | v1.0 | 2026

---

## Дополнительные файлы документации

- **Документ формата** `.docx`: *[здесь](docs/my-little-agent-world-docs.docx)*
- **Презентация**: *[здесь](docs/my-little-agent-world-presentation.pptx)*

---

## Содержание

1. [Обзор проекта](#1-обзор-проекта)
2. [Архитектура](#2-архитектура)
3. [Развёртывание проекта](#3-развёртывание-проекта)
4. [Описание сервисов](#4-описание-сервисов)
5. [Агенты](#5-агенты)
6. [База данных](#6-база-данных)
7. [Обработка ошибок](#7-обработка-ошибок)
8. [Технологии](#8-технологии)

---

## 1. Обзор проекта

My Little Agent World — симулятор мира с автономными агентами. Агенты живут в пиксельном мире, реагируют на мировые новости, общаются между собой и меняют настроение в зависимости от происходящих событий.

Пользователь может наблюдать за агентами в реальном времени, отправлять мировые новости и запускать тематические разговоры через веб-интерфейс.

### 1.1 Ключевые возможности

- Визуализация агентов на пиксельной карте мира
- Отправка мировых новостей и наблюдение за реакцией агентов
- Запуск тематических разговоров (Доброта, Конфликт, Успех и др.)
- Отображение настроения агентов в реальном времени (0–100%)
- Лента новостей с уведомлениями
- История разговоров агентов

---

## 2. Архитектура

Проект построен на микросервисной архитектуре. Сервисы общаются через RabbitMQ (асинхронно) и HTTP REST (синхронно). Обнаружение сервисов — через Eureka Server.

### 2.1 Сервисы и порты

| Сервис | Описание |
|---|---|
| `agent-world` (фронт) | React + Vite \| порт **5173** |
| `world-service` | Spring Boot \| порт **8082** |
| `ai-service` | Spring Boot \| порт **8083** |
| `agent-service` | Spring Boot \| порт **8081** |
| `RabbitMQ` | Message broker \| порт **5672** (UI: 15672) |
| `PostgreSQL` | База данных \| порт **5432** |
| `Eureka Server` | Service discovery \| порт **8761** |

### 2.2 Поток данных при отправке новости

1. Пользователь вводит новость в интерфейсе
2. Фронт отправляет `POST /api/v1/news` → `world-service`
3. Параллельно `POST /api/v1/conversation/react-to-news` → `ai-service`
4. `ai-service` анализирует тональность, меняет настроение агентов
5. Результат (диалог + новое настроение) возвращается на фронт
6. Фронт обновляет карту агентов и показывает модалку с реакцией

---

## 3. Развёртывание проекта

Полный процесс установки и запуска проекта с нуля на локальной машине Windows.

### 3.1 Системные требования

| Компонент | Версия / Примечание |
|---|---|
| Java JDK | 21 (рекомендуется Microsoft Build of OpenJDK) |
| Maven | 3.8+ (или встроенный в IntelliJ) |
| Node.js | 18+ (проверить: `node -v`) |
| npm | 9+ (проверить: `npm -v`) |
| PostgreSQL | 14+ (проверить: `psql --version`) |
| RabbitMQ | 3.12+ с плагином management |
| IntelliJ IDEA | Community или Ultimate |
| Git | для клонирования репозитория |

### 3.2 Клонирование репозитория

```bash
git clone https://github.com/theT0Rnado/my-little-agent-world.git
cd my-little-agent-world
```

Структура репозитория после клонирования:

```
my-little-agent-world/
  agent-service/    # сервис агентов (порт 8081)
  world-service/    # сервис мира   (порт 8082)
  ai-service/       # сервис ИИ     (порт 8083)
  agent-world/      # фронтенд      (порт 5173)
```

### 3.3 Установка и настройка PostgreSQL

**Шаг 1 — Установка**

Скачайте PostgreSQL с официального сайта: https://www.postgresql.org/download/windows

При установке запомните пароль суперпользователя `postgres`.

**Шаг 2 — Создание пользователя и баз данных**

```sql
psql -U postgres

CREATE USER program WITH PASSWORD 'ваш_пароль';
CREATE DATABASE world_service OWNER program;
CREATE DATABASE agent_service OWNER program;
GRANT ALL PRIVILEGES ON DATABASE world_service TO program;
GRANT ALL PRIVILEGES ON DATABASE agent_service TO program;
\q
```

> ⚠️ **Важно:** пароль пользователя `program` должен совпадать с паролем в `application.yml` каждого сервиса.

### 3.4 Установка и настройка RabbitMQ

**Шаг 1 — Установка**

1. Установите Erlang OTP с https://www.erlang.org/downloads
2. Установите RabbitMQ с https://www.rabbitmq.com/install-windows.html

**Шаг 2 — Включение Management UI**

Откройте командную строку от имени администратора:

```bash
rabbitmq-plugins enable rabbitmq_management
rabbitmq-service restart
```

Проверка: откройте http://localhost:15672 | Логин: `guest` / Пароль: `guest`

### 3.5 Настройка конфигурации сервисов

**world-service** — `world-service/src/main/resources/application.yml`

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/world_service
    username: program
    password: ВАШ_ПАРОЛЬ
  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest
  jpa:
    hibernate:
      ddl-auto: update
```

**ai-service** — `ai-service/src/main/resources/application.yml`

```yaml
server:
  port: 8083
spring:
  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest
```

**agent-service** — `agent-service/src/main/resources/application.yml`

```yaml
server:
  port: 8081
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/agent_service
    username: program
    password: ВАШ_ПАРОЛЬ
```

### 3.6 Сборка бэкенд-сервисов (Maven)

```bash
cd world-service   && mvn clean install -DskipTests
cd ../ai-service   && mvn clean install -DskipTests
cd ../agent-service && mvn clean install -DskipTests
```

> 💡 Флаг `-DskipTests` пропускает тесты при первой сборке. Уберите его, если нужно запустить тесты.

### 3.7 Установка зависимостей фронтенда

```bash
cd agent-world
npm install
```

Убедитесь, что `vite.config.js` содержит правильный прокси:

```js
proxy: {
  '/api/v1/conversation':  { target: 'http://localhost:8083' },
  '/api/v1/conversations': { target: 'http://localhost:8082' },
  '/api/v1/news':          { target: 'http://localhost:8082' },
}
```

### 3.8 Порядок запуска

> ⚠️ **Строго соблюдайте порядок! Сервисы зависят друг от друга.**

| Шаг | Действие |
|---|---|
| 1 | PostgreSQL — должен быть запущен как сервис Windows |
| 2 | `rabbitmq-service start` |
| 3 | IntelliJ: `WorldServiceApplication.java` → Run |
| 4 | Дождаться `Started WorldServiceApplication` в консоли |
| 5 | IntelliJ: `AiServiceApplication.java` → Run |
| 6 | IntelliJ: `AgentServiceApplication.java` → Run |
| 7 | Терминал: `cd agent-world && npm run dev` |
| 8 | Открыть в браузере: http://localhost:5173 |

### 3.9 Проверка работоспособности

| Сервис | URL / Ожидаемый результат |
|---|---|
| world-service | http://localhost:8082/actuator/health → `{status: UP}` |
| ai-service | http://localhost:8083/api/v1/conversation/topics → список тем |
| agent-service | http://localhost:8081/actuator/health → `{status: UP}` |
| RabbitMQ UI | http://localhost:15672 → панель управления |
| Фронт | http://localhost:5173 → интерфейс приложения |

> ℹ️ Предупреждение `Eureka Connection Refused` в логах `agent-service` — **не критично**. Сервис работает без Eureka.

### 3.10 Первый запуск — инициализация базы данных

При первом запуске `world-service` автоматически создаст таблицы (`ddl-auto: update`). Для проверки:

```bash
psql -U program -d world_service
\dt
```

Должны появиться таблицы: `news`, `conversation` (или аналогичные).

Для заполнения тестовыми данными:

```bash
curl -X POST http://localhost:8082/api/v1/news \
  -H "Content-Type: application/json" \
  -d '{"content": "Тестовая новость"}'
```

### 3.11 Быстрый старт (повторный запуск)

| Шаг | Действие |
|---|---|
| 1 | `rabbitmq-service start` |
| 2 | IntelliJ: `WorldServiceApplication.java` → Run |
| 3 | IntelliJ: `AiServiceApplication.java` → Run |
| 4 | IntelliJ: `AgentServiceApplication.java` → Run |
| 5 | `cd agent-world && npm run dev` |
| 6 | http://localhost:5173 |

---

## 4. Описание сервисов

### 4.1 world-service (порт 8082)

Основной сервис управления миром. Хранит новости и историю разговоров в PostgreSQL. Публикует события в RabbitMQ при получении новых новостей.

**REST API**

| Метод / Путь | Описание |
|---|---|
| `GET /api/v1/news` | Список всех новостей |
| `POST /api/v1/news` | Отправить новую новость |
| `GET /api/v1/news/{id}` | Новость по ID |
| `GET /api/v1/conversations` | История разговоров |
| `GET /actuator/health` | Проверка состояния сервиса |

**Формат запроса `POST /api/v1/news`**

```json
Content-Type: application/json

{ "content": "Текст новости" }
```

### 4.2 ai-service (порт 8083)

Сервис генерации разговоров. Управляет настроением агентов Alpha, Beta, Gamma. Анализирует тональность новостей по ключевым словам и изменяет настроение.

**REST API**

| Метод / Путь | Описание |
|---|---|
| `GET /api/v1/conversation/topics` | Список доступных тем |
| `POST /api/v1/conversation?topic=KINDNESS` | Запустить разговор по теме |
| `POST /api/v1/conversation/react-to-news` | Реакция агентов на новость |

**Доступные темы**

| Тема | Описание / Эффект |
|---|---|
| `KINDNESS` | Доброта — +20 к настроению |
| `FRIENDSHIP` | Дружба — +15 к настроению |
| `SUCCESS` | Успех — +25 к настроению |
| `WEATHER` | Погода — 0 (без изменений) |
| `CONFLICT` | Конфликт — −15 к настроению |
| `BETRAYAL` | Предательство — −20 к настроению |
| `FAILURE` | Провал — −25 к настроению |

**Формат ответа**

```json
{
  "topic": "KINDNESS",
  "topicDisplayName": "Доброта",
  "messages": [...],
  "alphaFinalMood": 80,
  "betaFinalMood": 75,
  "gammaFinalMood": 60
}
```

### 4.3 agent-service (порт 8081)

Сервис управления агентами. Хранит данные агентов в PostgreSQL, слушает события из RabbitMQ. Регистрируется в Eureka. Предупреждение о недоступности Eureka при старте — не критично, сервис продолжает работу.

### 4.4 agent-world — фронтенд (порт 5173)

React + Vite приложение. Проксирует запросы к бэкенд-сервисам через Vite proxy.

**Структура `src/`**

| Файл / Папка | Назначение |
|---|---|
| `api/index.js` | Все запросы к бэкенду |
| `components/AgentModal.jsx` | Модалка агента с MoodBar |
| `components/ConversationView.jsx` | Просмотр диалога агентов |
| `components/NewsSubmitPanel.jsx` | Форма отправки новостей |
| `components/Sidebar.jsx` | Правый сайдбар |
| `components/TopicButtons.jsx` | Кнопки тем разговора |
| `components/WorldGrid.jsx` | Пиксельная карта мира |
| `hooks/usePolling.js` | Хук для polling данных |
| `hooks/useNewsFeed.js` | Хук ленты новостей |
| `App.jsx` | Главный компонент, moodOverrides |
| `vite.config.js` | Конфигурация и прокси |

---

## 5. Агенты

В мире три агента с разными личностями. Настроение каждого хранится как число от 0 до 100 и меняется после новостей и разговоров.

### 5.1 Характеристики агентов

| Агент | Личность / Стартовое настроение |
|---|---|
| **Alpha** | Оптимист \| стартовое настроение 60 |
| **Beta** | Скептик \| стартовое настроение 60 |
| **Gamma** | Философ \| стартовое настроение 60 |

### 5.2 Уровни настроения

| Диапазон | Состояние |
|---|---|
| 85 – 100 | `EXCITED` — восторженный |
| 60 – 84 | `HAPPY` — счастливый |
| 40 – 59 | `NEUTRAL` — нейтральный |
| 20 – 39 | `SAD` — грустный |
| 0 – 19 | `ANGRY` — злой |

### 5.3 Анализ тональности новостей

`ai-service` подсчитывает позитивные и негативные слова в тексте новости. Каждое слово даёт **+8** или **−8** к настроению всех агентов.

**Позитивные слова (+8 каждое)**

```
выиграл, победа, успех, отлично, замечательно, открыли, достижение,
рекорд, рост, прорыв, хорошо, радость, счастье, любовь, мир
```

**Негативные слова (−8 каждое)**

```
катастрофа, авария, смерть, война, кризис, провал, упал, потерял,
плохо, ужасно, взрыв, трагедия, убыток, скандал, крах
```

---

## 6. База данных

### 6.1 Настройка

```yaml
spring.datasource.url:         jdbc:postgresql://localhost:5432/world_service
spring.datasource.username:    program
spring.jpa.hibernate.ddl-auto: update
```

### 6.2 Управление

| Задача | Команда / Действие |
|---|---|
| Пересоздать таблицы | Сменить `ddl-auto` на `create`, перезапустить, вернуть `update` |
| Удалить при остановке | Использовать `ddl-auto: create-drop` |
| Очистить таблицу | `TRUNCATE TABLE news RESTART IDENTITY CASCADE;` |
| Удалить схему | `DROP SCHEMA public CASCADE; CREATE SCHEMA public;` |
| Войти в psql | `psql -U program -d world_service` |

---

## 7. Обработка ошибок

### 7.1 MoodOverflowException

Кастомное исключение, когда настроение агента выходит за диапазон `[0, 100]`. Перехватывается `GlobalExceptionHandler`, возвращает HTTP **422 Unprocessable Entity**.

| Компонент | Описание |
|---|---|
| `MoodOverflowException` | Хранит имя агента, значение, границу |
| `GlobalExceptionHandler` | `@RestControllerAdvice` — ловит все исключения |
| `MoodGuard` | Утилита: `validate()`, `clamp()`, `applyDelta()` |

**Использование MoodGuard**

```java
// Бросить исключение если выходит за [0, 100]:
MoodGuard.validate(agent.getName(), newMoodLevel);

// Зажать в [0, 100] без исключения:
int safe = MoodGuard.clamp(newMoodLevel);

// Применить дельту безопасно:
int result = MoodGuard.applyDelta(current, delta);
```

### 7.2 Типичные ошибки

| Ошибка | Причина и решение |
|---|---|
| `ECONNREFUSED /api/v1/news` | `world-service` не запущен. Проверить `/actuator/health` |
| `500 Internal Server Error` | Смотреть логи `world-service` в IntelliJ |
| `Unexpected token '<'` | Сервер вернул HTML. Сервис упал или не найден |
| `Eureka Connection Refused` | Некритично — сервисы работают напрямую по портам |
| Белый экран фронта | JS ошибка. Смотреть F12 → Console |
| Ошибка парсинга JSON | Сервер вернул пустое тело (204). `submitNews` обрабатывает |

---

## 8. Технологии

### 8.1 Бэкенд

| Технология | Версия / Назначение |
|---|---|
| Java | 21 — язык программирования |
| Spring Boot | 3.5 — фреймворк микросервисов |
| Spring Data JPA | ORM для PostgreSQL |
| Spring AMQP | Интеграция с RabbitMQ |
| Spring Cloud Netflix | Eureka Client |
| Lombok | Генерация boilerplate |
| PostgreSQL | 14+ — база данных |
| RabbitMQ | 4.2 — message broker |
| Hibernate | 6.6 — ORM реализация |

### 8.2 Фронтенд

| Технология | Версия / Назначение |
|---|---|
| React | 18 — UI библиотека |
| Vite | Сборщик и dev-сервер |
| JavaScript | Язык программирования |
