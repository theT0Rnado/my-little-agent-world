"""
Скрипт для быстрой диагностики интеграции AI Service → Backend
"""
import asyncio
import aiohttp
import aio_pika
from config import settings
import sys

async def check_agent_service():
    """Проверка доступности Agent Service"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(
                settings.agent_service_url,
                timeout=aiohttp.ClientTimeout(total=5)
            ) as response:
                if response.status == 200:
                    agents = await response.json()
                    print(f"✅ Agent Service доступен: {len(agents)} агентов в БД")
                    return True, len(agents)
                else:
                    print(f"⚠️ Agent Service вернул статус {response.status}")
                    return False, 0
    except Exception as e:
        print(f"❌ Agent Service недоступен: {e}")
        return False, 0

async def check_rabbitmq():
    """Проверка подключения к RabbitMQ"""
    try:
        connection = await aio_pika.connect_robust(
            host=settings.rabbitmq_host,
            port=settings.rabbitmq_port,
            login=settings.rabbitmq_user,
            password=settings.rabbitmq_password,
            timeout=5
        )
        
        async with connection:
            channel = await connection.channel()
            
            # Проверяем exchange
            try:
                exchange = await channel.get_exchange(settings.rabbitmq_agent_exchange)
                print(f"✅ RabbitMQ доступен, exchange '{settings.rabbitmq_agent_exchange}' существует")
            except Exception:
                print(f"⚠️ Exchange '{settings.rabbitmq_agent_exchange}' не найден")
                return False
            
            # Проверяем очередь
            try:
                queue = await channel.get_queue(settings.rabbitmq_agent_all_data_from_ai_queue)
                queue_info = await queue.declare(passive=True)
                print(f"✅ Очередь '{settings.rabbitmq_agent_all_data_from_ai_queue}' существует")
                print(f"   📊 Сообщений в очереди: {queue_info.message_count}")
                print(f"   👥 Подписчиков: {queue_info.consumer_count}")
                
                if queue_info.consumer_count == 0:
                    print(f"   ⚠️ Нет подписчиков! Agent Service не слушает очередь")
                    return False
                
            except Exception as e:
                print(f"⚠️ Очередь '{settings.rabbitmq_agent_all_data_from_ai_queue}' не найдена: {e}")
                return False
            
            return True
            
    except Exception as e:
        print(f"❌ RabbitMQ недоступен: {e}")
        return False

async def check_configuration():
    """Проверка конфигурации"""
    print("\n📋 Конфигурация AI Service:")
    print(f"   RabbitMQ Host: {settings.rabbitmq_host}:{settings.rabbitmq_port}")
    print(f"   Exchange: {settings.rabbitmq_agent_exchange}")
    print(f"   Queue: {settings.rabbitmq_agent_all_data_from_ai_queue}")
    print(f"   Routing Key: {settings.rabbitmq_agent_all_data_from_ai_routing_key}")
    print(f"   Agent Service URL: {settings.agent_service_url}")
    print(f"   LLM Provider: {settings.llm_provider}")
    print(f"   LLM Model: {settings.ionet_model}")
    print(f"   API Keys: {len(settings.api_keys_list)} шт")
    
    if not settings.api_keys_list:
        print("   ❌ API ключи не настроены!")
        return False
    
    return True

async def main():
    """Главная функция диагностики"""
    print("🔍 Диагностика интеграции AI Service → Backend\n")
    print("=" * 60)
    
    # 1. Проверка конфигурации
    print("\n1️⃣ Проверка конфигурации...")
    config_ok = await check_configuration()
    
    # 2. Проверка Agent Service
    print("\n2️⃣ Проверка Agent Service...")
    agent_service_ok, agents_count = await check_agent_service()
    
    # 3. Проверка RabbitMQ
    print("\n3️⃣ Проверка RabbitMQ...")
    rabbitmq_ok = await check_rabbitmq()
    
    # Итоги
    print("\n" + "=" * 60)
    print("\n📊 Результаты диагностики:\n")
    
    all_ok = config_ok and agent_service_ok and rabbitmq_ok
    
    if all_ok:
        print("✅ Все проверки пройдены успешно!")
        print("\n🎯 Система готова к работе:")
        print(f"   • Agent Service работает ({agents_count} агентов)")
        print("   • RabbitMQ подключен и настроен")
        print("   • Конфигурация корректна")
        
        if agents_count == 0:
            print("\n💡 Рекомендация: Запустите AI Service для создания начальных агентов")
            print("   python main.py")
        else:
            print("\n💡 Можно запускать AI Service:")
            print("   python main.py")
        
        return 0
    else:
        print("❌ Обнаружены проблемы:\n")
        
        if not config_ok:
            print("   • Проверьте файл .env")
        
        if not agent_service_ok:
            print("   • Запустите Agent Service (порт 8081)")
            print("     cd agent-service")
            print("     mvnw spring-boot:run")
        
        if not rabbitmq_ok:
            print("   • Запустите RabbitMQ")
            print("     rabbitmq-server")
            print("   • Проверьте что Agent Service создал очереди")
        
        print("\n📚 Подробная инструкция: INTEGRATION_CHECKLIST.md")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
