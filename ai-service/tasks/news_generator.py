import logging
import json
import re
from datetime import datetime
from celery_app import celery_app
from llm.client import llm_client
from llm.prompts import GLOBAL_NEWS_PROMPT
import aio_pika
import asyncio
from config import settings

logger = logging.getLogger(__name__)

@celery_app.task(name='tasks.news_generator.generate_periodic_news')
def generate_periodic_news():
    """
    Периодическая задача: генерация глобальной новости каждую минуту
    """
    try:
        logger.info("🔄 Starting periodic news generation...")
        
        # Запускаем асинхронную функцию
        loop = asyncio.get_event_loop()
        if loop.is_closed():
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        
        result = loop.run_until_complete(_generate_and_send_news())
        
        logger.info(f"✅ Periodic news generated: {result}")
        return result
        
    except Exception as e:
        logger.error(f"❌ Error in periodic news generation: {e}")
        raise

async def _generate_and_send_news():
    """
    Генерация новости и отправка в RabbitMQ
    """
    try:
        # 1. Получаем контекст предыдущих новостей (последние 5)
        recent_news = await _get_recent_news()
        
        # 2. Формируем промпт с контекстом
        if recent_news:
            context = "Предыдущие новости:\n" + "\n".join([f"- {news}" for news in recent_news])
            prompt = f"{context}\n\n{GLOBAL_NEWS_PROMPT}"
        else:
            prompt = GLOBAL_NEWS_PROMPT
        
        # 3. Генерация новости через LLM (короткий max_tokens чтобы не было лишнего)
        news_text = await llm_client.generate(prompt, max_tokens=100)
        
        # 4. Очистка от лишнего
        news_text = news_text.strip().strip('"').strip("'")
        
        # Убираем технические префиксы построчно
        lines = news_text.split('\n')
        cleaned_lines = []
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Убираем маркеры списков и префиксы
            line = re.sub(r'^[\*\-•]\s*', '', line)  # Убираем *, -, •
            line = re.sub(r'^Draft\s*\d*[\s:]*', '', line, flags=re.IGNORECASE)
            line = re.sub(r'^Idea\s*\d*[\s:]*', '', line, flags=re.IGNORECASE)
            line = re.sub(r'^Concept\s*\d*[\s:]*', '', line, flags=re.IGNORECASE)
            line = re.sub(r'^Option\s*\d*[\s:]*', '', line, flags=re.IGNORECASE)
            line = re.sub(r'^Вариант\s*\d*[\s:]*', '', line, flags=re.IGNORECASE)
            
            # Убираем комментарии в скобках
            line = re.sub(r'\s*\([^)]*\)\s*$', '', line)
            
            if line:
                cleaned_lines.append(line)
        
        # Берём только первую строку (основная новость)
        if cleaned_lines:
            news_text = cleaned_lines[0]
        else:
            news_text = news_text  # Оставляем как есть если ничего не осталось
        
        # Убираем лишние пробелы
        news_text = ' '.join(news_text.split())
        
        # Если новость слишком длинная - берём только первое предложение
        if len(news_text) > 200:
            sentences = news_text.split('.')
            news_text = sentences[0].strip() + '.'
        
        logger.info(f"📰 Generated news: {news_text}")
        
        # 5. Отправка в RabbitMQ (в world-service)
        await _send_news_to_rabbitmq(news_text)
        
        return {
            'status': 'success',
            'news': news_text,
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Error generating news: {e}")
        return {
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }

async def _get_recent_news() -> list[str]:
    """
    Получает последние 5 новостей из World Service для контекста
    """
    try:
        import aiohttp
        
        async with aiohttp.ClientSession() as session:
            async with session.get(
                'http://localhost:8082/api/news',
                timeout=aiohttp.ClientTimeout(total=3)
            ) as response:
                if response.status == 200:
                    news_list = await response.json()
                    # Берём последние 5 новостей
                    recent = [item['content'] for item in news_list[:5] if item.get('content')]
                    return recent
                else:
                    logger.warning(f"Cannot fetch recent news: {response.status}")
                    return []
    except Exception as e:
        logger.debug(f"Cannot fetch recent news (service might be down): {e}")
        return []

async def _send_news_to_rabbitmq(news_text: str):
    """
    Отправка новости в RabbitMQ для world-service
    Использует правильные exchange и routing key из Backend конфигурации
    С retry логикой для надёжности
    """
    max_retries = 3
    retry_delay = 2  # секунды
    
    for attempt in range(max_retries):
        try:
            # Подключение к RabbitMQ
            connection = await aio_pika.connect_robust(
                host=settings.rabbitmq_host,
                port=settings.rabbitmq_port,
                login=settings.rabbitmq_user,
                password=settings.rabbitmq_password,
                timeout=10
            )
            
            async with connection:
                channel = await connection.channel()
                
                # Объявляем exchange (должен совпадать с Backend: news.exchange)
                exchange = await channel.declare_exchange(
                    settings.rabbitmq_news_exchange,
                    aio_pika.ExchangeType.TOPIC,
                    durable=True
                )
                
                # Формат сообщения для world-service (NewsMessage DTO)
                message_body = {
                    "newsId": None,  # World service сам создаст ID
                    "content": news_text  # Поле называется "content" в NewsMessage
                }
                
                # Отправка через exchange с routing key (news.from.ai)
                await exchange.publish(
                    aio_pika.Message(
                        body=json.dumps(message_body).encode('utf-8'),
                        content_type='application/json',
                        delivery_mode=aio_pika.DeliveryMode.PERSISTENT  # Сохранять на диске
                    ),
                    routing_key=settings.rabbitmq_news_from_ai_routing_key
                )
                
                logger.info(f"📤 News sent to RabbitMQ:")
                logger.info(f"   Exchange: {settings.rabbitmq_news_exchange}")
                logger.info(f"   Routing Key: {settings.rabbitmq_news_from_ai_routing_key}")
                logger.info(f"   Content: {news_text[:50]}...")
                return  # Успешно отправлено
        
        except aio_pika.exceptions.AMQPConnectionError as e:
            logger.error(f"❌ RabbitMQ connection error (attempt {attempt + 1}/{max_retries}): {e}")
            if attempt < max_retries - 1:
                logger.info(f"⏳ Retrying in {retry_delay} seconds...")
                await asyncio.sleep(retry_delay)
            else:
                logger.error("❌ All retry attempts failed")
                raise
                
        except Exception as e:
            logger.error(f"❌ Error sending news to RabbitMQ: {e}")
            raise
