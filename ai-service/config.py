from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # RabbitMQ основные настройки
    rabbitmq_host: str = "localhost"
    rabbitmq_port: int = 5672
    rabbitmq_user: str = "guest"
    rabbitmq_password: str = "guest"
    
    # RabbitMQ Exchanges
    rabbitmq_agent_exchange: str = "agent.exchange"
    rabbitmq_news_exchange: str = "news.exchange"
    
    # RabbitMQ Queues (для отправки в Agent Service)
    rabbitmq_agent_all_data_from_ai_queue: str = "agent.all.agent.data.from.ai.queue"
    rabbitmq_agent_message_from_ai_queue: str = "agent.message.from.ai.queue"
    
    # RabbitMQ Queues (для отправки в World Service)
    rabbitmq_news_from_ai_queue: str = "news.from.ai.queue"
    
    # RabbitMQ Routing Keys
    rabbitmq_agent_all_data_from_ai_routing_key: str = "agent.all.agent.data.from.ai"
    rabbitmq_agent_message_from_ai_routing_key: str = "agent.message.from.ai"
    rabbitmq_news_from_ai_routing_key: str = "news.from.ai"
    
    # Agent Service URL
    agent_service_url: str = "http://localhost:8081/api/agent"
    
    # LLM настройки
    llm_provider: str = "ionet"
    ionet_api_keys: str = ""  # Comma-separated list of API keys
    ionet_base_url: str = "https://api.intelligence.io.solutions/api/v1/"
    ionet_model: str = "deepseek-ai/DeepSeek-V3.2"
    
    class Config:
        env_file = ".env"
        case_sensitive = False
    
    @property
    def api_keys_list(self) -> List[str]:
        """Parse comma-separated API keys into a list"""
        if not self.ionet_api_keys:
            return []
        return [key.strip() for key in self.ionet_api_keys.split(',') if key.strip()]

settings = Settings()
