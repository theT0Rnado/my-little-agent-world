"""
Тестовый скрипт для проверки отправки агентов в RabbitMQ
"""
import asyncio
import json
import aio_pika
from config import settings

async def test_send_agents():
    """Тест отправки агентов в правильном формате"""
    
    # Тестовые данные агентов (в точности как Backend ожидает)
    test_agents = [
        {
            "name": "TestAgent1",
            "personality": "Тестовый агент для проверки интеграции",
            "mood": "NEUTRAL",
            "recollections": [
                "Первое воспоминание",
                "Второе воспоминание"
            ],
            "plans": [
                "Первый план",
                "Второй план"
            ],
            "position": {
                "x": 100.0,
                "y": 200.0
            }
        },
        {
            "name": "TestAgent2",
            "personality": "Второй тестовый агент",
            "mood": "HAPPY",
            "recollections": [
                "Воспоминание агента 2"
            ],
            "plans": [
                "План агента 2"
            ],
            "position": {
                "x": 300.0,
                "y": 150.0
            }
        }
    ]
    
    print("🧪 Testing agent sending to RabbitMQ...")
    print(f"📊 Test data: {len(test_agents)} agents")
    print(f"📝 Agent 1: {test_agents[0]['name']} - {test_agents[0]['mood']}")
    print(f"📝 Agent 2: {test_agents[1]['name']} - {test_agents[1]['mood']}")
    
    try:
        # Подключение к RabbitMQ
        connection = await aio_pika.connect_robust(
            host=settings.rabbitmq_host,
            port=settings.rabbitmq_port,
            login=settings.rabbitmq_user,
            password=settings.rabbitmq_password,
            timeout=10
        )
        
        print(f"✅ Connected to RabbitMQ at {settings.rabbitmq_host}:{settings.rabbitmq_port}")
        
        async with connection:
            channel = await connection.channel()
            
            # Объявляем exchange
            exchange = await channel.declare_exchange(
                settings.rabbitmq_agent_exchange,
                aio_pika.ExchangeType.TOPIC,
                durable=True
            )
            
            print(f"✅ Exchange declared: {settings.rabbitmq_agent_exchange}")
            
            # Формат сообщения: AgentListFromAiMessage
            message_body = {
                "agents": test_agents
            }
            
            # Красивый вывод JSON для проверки
            print("\n📤 Sending message:")
            print(json.dumps(message_body, indent=2, ensure_ascii=False))
            
            # Отправка
            await exchange.publish(
                aio_pika.Message(
                    body=json.dumps(message_body).encode('utf-8'),
                    content_type='application/json',
                    delivery_mode=aio_pika.DeliveryMode.PERSISTENT
                ),
                routing_key=settings.rabbitmq_agent_all_data_from_ai_routing_key
            )
            
            print(f"\n✅ Message sent successfully!")
            print(f"   Exchange: {settings.rabbitmq_agent_exchange}")
            print(f"   Routing Key: {settings.rabbitmq_agent_all_data_from_ai_routing_key}")
            print(f"   Queue (expected): {settings.rabbitmq_agent_all_data_from_ai_queue}")
            
            print("\n🔍 Now check:")
            print("   1. RabbitMQ Management UI: http://localhost:15672")
            print(f"   2. Queue '{settings.rabbitmq_agent_all_data_from_ai_queue}' should have 1 message")
            print("   3. Agent Service logs should show: '📨 Получен список агентов от AI: 2 агентов'")
            print("   4. Check agents in database: curl http://localhost:8081/api/agent")
            
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_send_agents())
