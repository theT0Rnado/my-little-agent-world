from pydantic import BaseModel

class ActionRequest(BaseModel):
    agent_id: str
    personality: str
    current_context: str

class ActionResult(BaseModel):
    agent_id: str
    action_text: str
    mood_change: float = 0.0
    target_agent_id: str | None = None
