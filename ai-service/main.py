from fastapi import FastAPI
from contextlib import asynccontextmanager
import logging
import asyncio
from models import ActionRequest, ActionResult
from llm.client import llm_client
from llm.prompts import REFLECTION_PROMPT, PLAN_PROMPT, ACTION_PROMPT
from memory.chroma_service import chroma_service
from rabbitmq.consumer import rabbitmq_consumer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting AI Service...")
    await chroma_service.init_collection()
    
    # Start RabbitMQ consumer in background
    asyncio.create_task(rabbitmq_consumer.start_consuming())
    
    yield
    
    # Shutdown
    logger.info("Shutting down AI Service...")
    await rabbitmq_consumer.close()

app = FastAPI(title="AI Service", lifespan=lifespan)

async def process_agent_action(request: ActionRequest) -> ActionResult:
    """Main processing pipeline: reflection → plan → action"""
    try:
        # 1. Retrieve memories
        memories = await chroma_service.retrieve_memories(
            request.agent_id, 
            request.current_context, 
            limit=5
        )
        memories_text = "\n".join(memories) if memories else "Нет воспоминаний"
        
        # 2. Reflection
        reflection_prompt = REFLECTION_PROMPT.format(
            personality=request.personality,
            context=request.current_context,
            memories=memories_text
        )
        reflection = await llm_client.generate(reflection_prompt, max_tokens=100)
        logger.info(f"Reflection for {request.agent_id}: {reflection}")
        
        # 3. Plan
        plan_prompt = PLAN_PROMPT.format(reflection=reflection)
        plan = await llm_client.generate(plan_prompt, max_tokens=100)
        logger.info(f"Plan for {request.agent_id}: {plan}")
        
        # 4. Action
        action_prompt = ACTION_PROMPT.format(plan=plan)
        action = await llm_client.generate(action_prompt, max_tokens=150)
        logger.info(f"Action for {request.agent_id}: {action}")
        
        # 5. Save to memory
        await chroma_service.add_memory(
            request.agent_id,
            f"Context: {request.current_context}. Action: {action}"
        )
        
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
