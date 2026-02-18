"""
Скрипт для инициализации агентов
Запускается вручную или автоматически при старте AI Service
"""
import asyncio
import logging
from tasks.agent_generator import _check_and_initialize_agents

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

async def main():
    """Запуск инициализации агентов"""
    logger.info("=" * 60)
    logger.info("🚀 Starting agent initialization...")
    logger.info("=" * 60)
    
    result = await _check_and_initialize_agents()
    
    logger.info("=" * 60)
    logger.info(f"📊 Result: {result['status']}")
    
    if result['status'] == 'completed':
        logger.info(f"✅ Created {result['created']} agents")
        logger.info(f"📝 Agent names: {', '.join(result['agent_names'])}")
        if result['failed'] > 0:
            logger.warning(f"⚠️ Failed: {result['failed']} agents")
    elif result['status'] == 'skipped':
        logger.info(f"ℹ️ Reason: {result['reason']}")
    else:
        logger.error(f"❌ Error: {result.get('error', 'Unknown error')}")
    
    logger.info("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())
