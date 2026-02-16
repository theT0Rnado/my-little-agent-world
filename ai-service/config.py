from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    kafka_bootstrap: str = "localhost:9092"
    chroma_path: str = "./chroma_db"
    llm_provider: str = "openai"
    openai_api_key: str = ""
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
