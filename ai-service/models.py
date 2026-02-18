from pydantic import BaseModel
from typing import List, Optional

class ActionRequest(BaseModel):
    agent_id: str
    personality: str
    current_context: str

class ActionResult(BaseModel):
    agent_id: str
    action_text: str
    mood_change: float = 0.0
    target_agent_id: Optional[str] = None

# ========== МОДЕЛИ ДЛЯ ГЕНЕРАЦИИ АГЕНТОВ ==========

class GeneratedAgent(BaseModel):
    """Сгенерированный агент для отправки в Agent Service"""
    name: str
    personality: str
    mood: str  # HAPPY, SAD, ANGRY, NEUTRAL, EXCITED, TIRED
    memories: List[str]
    plans: List[str]
    position_x: float
    position_y: float

class AgentCreationRequest(BaseModel):
    """Запрос на создание агента в Agent Service"""
    name: str
    personality: str
    mood: str
    recollections: List[str]  # Agent Service ожидает recollections
    plans: List[str]
    position: dict  # {"x": float, "y": float}
