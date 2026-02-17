import aio_pika
import json
import logging
from config import settings
from models import ActionRequest, ActionResult
from llm.client import llm_client
from llm.prompts import REFLECTION_PROMPT, PLAN_PROMPT, ACTION_PROMPT
from memory.chroma_service import chroma_service

logger = logging.getLogger(__name__)

class RabbitMQConsumer:
    def __init__(self):
        self.connection = None
        self.channel = None
        self.queue = None
    
    async def connect(self):
        """Connect to RabbitMQ"""
        try:
            self.connection = await aio_pika.connect_robust(
                host=settings.rabbitmq_host,
                port=settings.rabbitmq_port,
                login=settings.rabbitmq_user,
                password=settings.rabbitmq_password
            )
            self.channel = await self.connection.channel()
            await self.channel.set_qos(prefetch_count=1)
            
            self.queue = await self.channel.declare_queue(
                settings.rabbitmq_queue,
                durable=True
            )
            
            logger.info(f"Connected to RabbitMQ: {settings.rabbitmq_host}:{settings.rabbitmq_port}")
        except Exception as e:
            logger.error(f"Failed to connect to RabbitMQ: {e}")
            raise
    
    async def process_message(self, message: aio_pika.IncomingMessage):
        """Process incoming message from RabbitMQ"""
        async with message.process():
            try:
                data = json.loads(message.body.decode())
                request = ActionRequest(**data)
                
                logger.info(f"Processing action for agent: {request.agent_id}")
                
                # Retrieve memories
                memories = await chroma_service.retrieve_memories(
                    request.agent_id, 
                    request.current_context, 
                    limit=5
                )
                memories_text = "\n".join(memories) if memories else "Нет воспоминаний"
                
                # Reflection
                reflection_prompt = REFLECTION_PROMPT.format(
                    personality=request.personality,
                    context=request.current_context,
                    memories=memories_text
                )
                reflection = await llm_client.generate(reflection_prompt, max_tokens=100)
                
                # Plan
                plan_prompt = PLAN_PROMPT.format(reflection=reflection)
                plan = await llm_client.generate(plan_prompt, max_tokens=100)
                
                # Action
                action_prompt = ACTION_PROMPT.format(plan=plan)
                action = await llm_client.generate(action_prompt, max_tokens=150)
                
                # Save to memory
                await chroma_service.add_memory(
                    request.agent_id,
                    f"Context: {request.current_context}. Action: {action}"
                )
                
                result = ActionResult(
                    agent_id=request.agent_id,
                    action_text=action,
                    mood_change=0.1
                )
                
                # Send result back if reply_to is set
                if message.reply_to:
                    await self.channel.default_exchange.publish(
                        aio_pika.Message(
                            body=result.model_dump_json().encode(),
                            correlation_id=message.correlation_id
                        ),
                        routing_key=message.reply_to
                    )
                
                logger.info(f"Processed action for {request.agent_id}: {action}")
                
            except Exception as e:
                logger.error(f"Error processing message: {e}")
    
    async def start_consuming(self):
        """Start consuming messages"""
        await self.connect()
        await self.queue.consume(self.process_message)
        logger.info("Started consuming messages from RabbitMQ")
    
    async def close(self):
        """Close RabbitMQ connection"""
        if self.connection:
            await self.connection.close()
            logger.info("Closed RabbitMQ connection")

rabbitmq_consumer = RabbitMQConsumer()
