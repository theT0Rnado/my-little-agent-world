from fastapi import FastAPI
from contextlib import asynccontextmanager
import logging
import asyncio
from models import ActionRequest, ActionResult
from llm.client import llm_client
from llm.prompts import REFLECTION_PROMPT, PLAN_PROMPT, ACTION_PROMPT
from rabbitmq.consumer import rabbitmq_consumer
from tasks.agent_generator import _check_and_initialize_agents

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting AI Service...")
    
    # Start RabbitMQ consumer in background
    asyncio.create_task(rabbitmq_consumer.start_consuming())
    
    # Initialize agents if they don't exist
    logger.info("🤖 Checking agent initialization...")
    try:
        result = await _check_and_initialize_agents()
        if result['status'] == 'completed':
            logger.info(f"✅ Initialized {result['created']} agents: {', '.join(result['agent_names'])}")
        elif result['status'] == 'skipped':
            logger.info(f"ℹ️ Agent initialization skipped: {result['reason']}")
    except Exception as e:
        logger.warning(f"⚠️ Could not initialize agents: {e}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down AI Service...")
    await rabbitmq_consumer.close()

app = FastAPI(title="AI Service", lifespan=lifespan)

async def process_agent_action(request: ActionRequest) -> ActionResult:
    """Main processing pipeline: reflection → plan → action"""
    try:
        # Без ChromaDB - используем пустые воспоминания
        memories_text = "Нет воспоминаний"
        
        # 1. Reflection
        reflection_prompt = REFLECTION_PROMPT.format(
            personality=request.personality,
            context=request.current_context,
            memories=memories_text
        )
        reflection = await llm_client.generate(reflection_prompt, max_tokens=100)
        logger.info(f"Reflection for {request.agent_id}: {reflection}")
        
        # 2. Plan
        plan_prompt = PLAN_PROMPT.format(reflection=reflection)
        plan = await llm_client.generate(plan_prompt, max_tokens=100)
        logger.info(f"Plan for {request.agent_id}: {plan}")
        
        # 3. Action
        action_prompt = ACTION_PROMPT.format(plan=plan)
        action = await llm_client.generate(action_prompt, max_tokens=150)
        logger.info(f"Action for {request.agent_id}: {action}")
        
        return ActionResult(
            agent_id=request.agent_id,
            action_text=action,
            mood_change=0.1
        )
    
    except Exception as e:
        logger.error(f"Error processing action: {e}")
        return ActionResult(
            agent_id=request.agent_id,
            action_text=f"Error: {str(e)}",
            mood_change=0.0
        )

@app.get("/")
async def root():
    return {"status": "AI Service ready"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/process-action", response_model=ActionResult)
async def http_process(request: ActionRequest):
    """HTTP fallback endpoint for processing agent actions"""
    return await process_agent_action(request)
