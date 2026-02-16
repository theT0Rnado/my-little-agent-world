import chromadb
from chromadb.config import Settings as ChromaSettings
from config import settings
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class ChromaService:
    def __init__(self):
        self.client = chromadb.PersistentClient(
            path=settings.chroma_path,
            settings=ChromaSettings(anonymized_telemetry=False)
        )
        self.collection_name = "agent_memories"
        self.collection = None
    
    async def init_collection(self):
        """Initialize collection if not exists"""
        try:
            self.collection = self.client.get_or_create_collection(
                name=self.collection_name,
                metadata={"description": "Agent memories and experiences"}
            )
            logger.info(f"Initialized collection: {self.collection_name}")
        except Exception as e:
            logger.error(f"Error initializing collection: {e}")
    
    async def add_memory(self, agent_id: str, text: str):
        """Add memory for agent"""
        try:
            doc_id = f"{agent_id}_{datetime.now().timestamp()}"
            
            self.collection.add(
                documents=[text],
                metadatas=[{"agent_id": agent_id, "timestamp": datetime.now().isoformat()}],
                ids=[doc_id]
            )
            logger.info(f"Added memory for agent {agent_id}")
        except Exception as e:
            logger.error(f"Error adding memory: {e}")
    
    async def retrieve_memories(self, agent_id: str, query_text: str, limit: int = 10) -> list[str]:
        """Retrieve relevant memories for agent"""
        try:
            results = self.collection.query(
                query_texts=[query_text],
                n_results=limit,
                where={"agent_id": agent_id}
            )
            
            if results and results['documents']:
                return results['documents'][0]
            return []
        except Exception as e:
            logger.error(f"Error retrieving memories: {e}")
            return []

chroma_service = ChromaService()
