import logging
import json
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
        # 1. Генерация новости через LLM
        news_text = await llm_client.generate(
            GLOBAL_NEWS_PROMPT,
            max_tokens=150
        )
        
        logger.info(f"📰 Generated news: {news_text[:100]}...")
        
        # 2. Отправка в RabbitMQ (в world-service)
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

async def _send_news_to_rabbitmq(news_text: str):
    """
    Отправка новости в RabbitMQ
    """
    try:
        # Подключение к RabbitMQ
        connection = await aio_pika.connect_robust(
            host=settings.rabbitmq_host,
            port=settings.rabbitmq_port,
            login=settings.rabbitmq_user,
            password=settings.rabbitmq_password
        )
        
        async with connection:
            channel = await connection.channel()
            
            # Формат сообщения для world-service
            message_body = {
                "newsId": None,
                "text": news_text,
                "timestamp": datetime.now().isoformat()
            }
            
            # Отправка в очередь news.from.ai
            await channel.default_exchange.publish(
                aio_pika.Message(
                    body=json.dumps(message_body).encode(),
                    content_type='application/json'
                ),
                routing_key='news.from.ai'
            )
            
            logger.info(f"📤 News sent to RabbitMQ: {news_text[:50]}...")
            
    except Exception as e:
        logger.error(f"❌ Error sending news to RabbitMQ: {e}")
        raise
