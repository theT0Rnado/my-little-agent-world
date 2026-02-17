from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    rabbitmq_host: str = "localhost"
    rabbitmq_port: int = 5672
    rabbitmq_user: str = "guest"
    rabbitmq_password: str = "guest"
    rabbitmq_queue: str = "agent_actions"
    chroma_path: str = "./chroma_db"
    llm_provider: str = "ionet"
    ionet_api_keys: str = ""  # Comma-separated list of API keys
    ionet_base_url: str = "https://api.intelligence.io.solutions/api/v1/"
    ionet_model: str = "zai-org/GLM-4.7"
    
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
