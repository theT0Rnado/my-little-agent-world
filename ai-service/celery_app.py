try:
    from celery import Celery
    CELERY_AVAILABLE = True
except ImportError:
    CELERY_AVAILABLE = False
    Celery = None

from config import settings

if CELERY_AVAILABLE:
    # Celery app с RabbitMQ как брокер (без Redis)
    celery_app = Celery(
        'ai_service',
        broker=f'amqp://{settings.rabbitmq_user}:{settings.rabbitmq_password}@{settings.rabbitmq_host}:{settings.rabbitmq_port}//',
        backend='rpc://',  # RPC backend (результаты через RabbitMQ)
        include=['tasks.news_generator', 'tasks.agent_generator']
    )

    # Конфигурация
    celery_app.conf.update(
        task_serializer='json',
        accept_content=['json'],
        result_serializer='json',
        timezone='UTC',
        enable_utc=True,
        task_track_started=True,
        task_time_limit=300,  # 5 минут максимум на задачу
        worker_prefetch_multiplier=1,
    )

    # Периодические задачи
    celery_app.conf.beat_schedule = {
        'generate-news-every-30-seconds': {
            'task': 'tasks.news_generator.generate_periodic_news',
            'schedule': 30.0,  # каждые 30 секунд
        },
        # Генерация агентов убрана из периодических задач
        # Агенты создаются только при старте, если их нет
    }
else:
    celery_app = None
    print("⚠️ Celery not available. Periodic tasks will be disabled.")
