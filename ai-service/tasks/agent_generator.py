import logging
import json
import asyncio
import aiohttp
import aio_pika
from datetime import datetime
from celery_app import celery_app
from llm.client import llm_client
from llm.prompts import (
    GENERATE_AGENT_NAME_PROMPT,
    GENERATE_AGENT_PERSONALITY_PROMPT,
    GENERATE_AGENT_MOOD_PROMPT,
    GENERATE_AGENT_MEMORIES_PROMPT,
    GENERATE_AGENT_PLANS_PROMPT
)
from models import GeneratedAgent, AgentCreationRequest
from config import settings

logger = logging.getLogger(__name__)

# Количество агентов для начальной генерации
INITIAL_AGENTS_COUNT = 4

@celery_app.task(name='tasks.agent_generator.initialize_agents')
def initialize_agents():
    """
    Задача инициализации: проверяет есть ли агенты в Agent Service
    Если нет - создает начальный набор агентов
    """
    try:
        logger.info("🔍 Checking if agents exist in Agent Service...")
        
        # Запускаем асинхронную функцию
        loop = asyncio.get_event_loop()
        if loop.is_closed():
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        
        result = loop.run_until_complete(_check_and_initialize_agents())
        
        logger.info(f"✅ Initialization complete: {result}")
        return result
        
    except Exception as e:
        logger.error(f"❌ Error in agent initialization: {e}")
        raise

async def _check_and_initialize_agents() -> dict:
    """
    Проверяет наличие агентов и создает их если нужно
    """
    try:
        # 1. Проверяем есть ли агенты в Agent Service
        agents_count = await _get_agents_count()
        
        if agents_count is None:
            logger.warning("⚠️ Cannot connect to Agent Service. Skipping initialization.")
            return {
                'status': 'skipped',
                'reason': 'Agent Service not available',
                'timestamp': datetime.now().isoformat()
            }
        
        if agents_count > 0:
            logger.info(f"✅ Agents already exist ({agents_count} agents). Skipping initialization.")
            return {
                'status': 'skipped',
                'reason': f'Agents already exist ({agents_count} agents)',
                'timestamp': datetime.now().isoformat()
            }
        
        # 2. Агентов нет - создаем начальный набор ПАРАЛЛЕЛЬНО
        logger.info(f"📝 No agents found. Creating {INITIAL_AGENTS_COUNT} initial agents in parallel...")
        
        # Генерируем всех агентов ПАРАЛЛЕЛЬНО
        tasks = [_generate_single_agent() for _ in range(INITIAL_AGENTS_COUNT)]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Фильтруем успешные результаты
        generated_agents = []
        failed_count = 0
        
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logger.error(f"❌ Failed to generate agent {i+1}: {result}")
                failed_count += 1
            elif result is None:
                logger.error(f"❌ Failed to generate agent {i+1}: returned None")
                failed_count += 1
            else:
                generated_agents.append(result)
                logger.info(f"✅ Agent '{result['name']}' generated successfully")
        
        if not generated_agents:
            logger.error("❌ No agents were generated successfully")
            return {
                'status': 'error',
                'error': 'Failed to generate any agents',
                'timestamp': datetime.now().isoformat()
            }
        
        # 3. Отправляем ВСЕХ агентов одним сообщением
        logger.info(f"📤 Sending {len(generated_agents)} agents to Agent Service...")
        success = await _send_agents_batch_to_service(generated_agents)
        
        if success:
            agent_names = [a['name'] for a in generated_agents]
            logger.info(f"✅ Successfully sent {len(generated_agents)} agents to Agent Service")
            return {
                'status': 'completed',
                'created': len(generated_agents),
                'failed': failed_count,
                'agent_names': agent_names,
                'timestamp': datetime.now().isoformat()
            }
        else:
            return {
                'status': 'error',
                'error': 'Failed to send agents to Agent Service',
                'created': 0,
                'failed': len(generated_agents) + failed_count,
                'timestamp': datetime.now().isoformat()
            }
        
    except Exception as e:
        logger.error(f"❌ Error in initialization: {e}")
        return {
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }

async def _get_agents_count() -> int | None:
    """
    Получает количество агентов из Agent Service
    Возвращает None если сервис недоступен
    """
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(
                settings.agent_service_url,
                timeout=aiohttp.ClientTimeout(total=5)
            ) as response:
                if response.status == 200:
                    agents = await response.json()
                    return len(agents)
                else:
                    logger.warning(f"⚠️ Agent Service returned status {response.status}")
                    return None
    except aiohttp.ClientError as e:
        logger.warning(f"⚠️ Cannot connect to Agent Service: {e}")
        return None
    except Exception as e:
        logger.error(f"❌ Error checking agents: {e}")
        return None

async def _generate_single_agent() -> dict | None:
    """
    Генерация одного агента через LLM
    Возвращает dict с данными агента или None при ошибке
    """
    try:
        logger.info("🎲 Generating agent attributes...")
        
        # 1. Генерация имени
        name = await llm_client.generate(
            GENERATE_AGENT_NAME_PROMPT,
            max_tokens=50
        )
        name = name.strip()
        logger.info(f"📝 Generated name: {name}")
        
        # 2. Генерация личности
        personality = await llm_client.generate(
            GENERATE_AGENT_PERSONALITY_PROMPT.format(name=name),
            max_tokens=200
        )
        personality = personality.strip()
        logger.info(f"🧠 Generated personality: {personality[:50]}...")
        
        # 3. Генерация настроения
        mood = await llm_client.generate(
            GENERATE_AGENT_MOOD_PROMPT.format(personality=personality),
            max_tokens=50
        )
        mood = mood.strip().upper()
        # Валидация настроения
        valid_moods = ["HAPPY", "SAD", "ANGRY", "NEUTRAL", "EXCITED", "TIRED"]
        if mood not in valid_moods:
            mood = "NEUTRAL"
        logger.info(f"😊 Generated mood: {mood}")
        
        # 4. Генерация воспоминаний
        memories_text = await llm_client.generate(
            GENERATE_AGENT_MEMORIES_PROMPT.format(name=name, personality=personality),
            max_tokens=400
        )
        memories = [m.strip() for m in memories_text.strip().split('\n') if m.strip()]
        logger.info(f"💭 Generated {len(memories)} memories")
        
        # 5. Генерация планов
        plans_text = await llm_client.generate(
            GENERATE_AGENT_PLANS_PROMPT.format(name=name, personality=personality),
            max_tokens=300
        )
        plans = [p.strip() for p in plans_text.strip().split('\n') if p.strip()]
        logger.info(f"📋 Generated {len(plans)} plans")
        
        # 6. Генерация позиции (рандомная)
        import random
        position_x = random.uniform(50, 450)
        position_y = random.uniform(50, 450)
        logger.info(f"📍 Generated random position: ({position_x:.1f}, {position_y:.1f})")
        
        # 7. Формирование DTO для Agent Service
        agent_dto = {
            "name": name,
            "personality": personality,
            "mood": mood,
            "recollections": memories,
            "plans": plans,
            "position": {
                "x": position_x,
                "y": position_y
            }
        }
        
        return agent_dto
        
    except Exception as e:
        logger.error(f"❌ Error generating agent: {e}")
        return None

async def _send_agents_batch_to_service(agents: list[dict]) -> bool:
    """
    Отправка батча агентов в Agent Service через RabbitMQ
    Формат: AgentListFromAiMessage с массивом агентов
    С retry логикой для надёжности
    """
    max_retries = 3
    retry_delay = 2  # секунды
    
    for attempt in range(max_retries):
        try:
            # Отправка через RabbitMQ
            connection = await aio_pika.connect_robust(
                host=settings.rabbitmq_host,
                port=settings.rabbitmq_port,
                login=settings.rabbitmq_user,
                password=settings.rabbitmq_password,
                timeout=10
            )
            
            async with connection:
                channel = await connection.channel()
                
                # Объявляем exchange (durable=True для сохранения при перезапуске)
                exchange = await channel.declare_exchange(
                    settings.rabbitmq_agent_exchange,
                    aio_pika.ExchangeType.TOPIC,
                    durable=True
                )
                
                # Формат: AgentListFromAiMessage с массивом агентов
                message_body = {
                    "agents": agents
                }
                
                # Отправка через exchange с routing key
                await exchange.publish(
                    aio_pika.Message(
                        body=json.dumps(message_body).encode('utf-8'),
                        content_type='application/json',
                        delivery_mode=aio_pika.DeliveryMode.PERSISTENT  # Сохранять сообщение на диске
                    ),
                    routing_key=settings.rabbitmq_agent_all_data_from_ai_routing_key
                )
                
                logger.info(f"✅ Sent {len(agents)} agents to RabbitMQ:")
                logger.info(f"   Exchange: {settings.rabbitmq_agent_exchange}")
                logger.info(f"   Routing Key: {settings.rabbitmq_agent_all_data_from_ai_routing_key}")
                logger.info(f"   Agents: {', '.join([a['name'] for a in agents])}")
                return True
        
        except aio_pika.exceptions.AMQPConnectionError as e:
            logger.error(f"❌ RabbitMQ connection error (attempt {attempt + 1}/{max_retries}): {e}")
            if attempt < max_retries - 1:
                logger.info(f"⏳ Retrying in {retry_delay} seconds...")
                await asyncio.sleep(retry_delay)
            else:
                logger.error("❌ All retry attempts failed")
                return False
                
        except Exception as e:
            logger.error(f"❌ Error sending agents batch to RabbitMQ: {e}")
            return False
    
    return False

# Функция для ручного тестирования
async def test_generate_agents():
    """Тестовая функция для генерации батча агентов"""
    logger.info("🧪 Testing agent generation...")
    
    # Генерируем 2 тестовых агента
    agents = []
    for i in range(2):
        logger.info(f"Generating test agent {i+1}/2...")
        agent = await _generate_single_agent()
        if agent:
            agents.append(agent)
    
    if agents:
        logger.info(f"✅ Generated {len(agents)} agents")
        logger.info(f"Sending to Agent Service...")
        success = await _send_agents_batch_to_service(agents)
        
        if success:
            logger.info("✅ Test successful!")
            return {'status': 'success', 'agents': agents}
        else:
            logger.error("❌ Failed to send agents")
            return {'status': 'failed', 'agents': agents}
    else:
        logger.error("❌ Failed to generate agents")
        return {'status': 'error'}

if __name__ == "__main__":
    # Для тестирования: python -m tasks.agent_generator
    asyncio.run(test_generate_agents())
