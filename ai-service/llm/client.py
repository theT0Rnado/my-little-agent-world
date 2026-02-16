from openai import AsyncOpenAI
from config import settings
import logging

logger = logging.getLogger(__name__)

class LLMClient:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)
        self.model = "gpt-4o-mini"
    
    async def generate(self, prompt: str, max_tokens: int = 150) -> str:
        """Generate text using LLM"""
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=max_tokens,
                temperature=0.7
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"LLM generation error: {e}")
            return f"Error: {str(e)}"

llm_client = LLMClient()
