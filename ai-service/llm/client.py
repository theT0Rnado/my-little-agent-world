from openai import AsyncOpenAI, RateLimitError
from config import settings
import logging

logger = logging.getLogger(__name__)

class LLMClient:
    def __init__(self):
        self.api_keys = settings.api_keys_list
        self.current_key_index = 0
        self.base_url = settings.ionet_base_url
        self.model = settings.ionet_model
        
        if not self.api_keys:
            raise ValueError("No API keys provided in IONET_API_KEYS")
        
        self.client = self._create_client()
        logger.info(f"Initialized LLM client with {len(self.api_keys)} API keys")
    
    def _create_client(self) -> AsyncOpenAI:
        """Create OpenAI client with current API key"""
        return AsyncOpenAI(
            api_key=self.api_keys[self.current_key_index],
            base_url=self.base_url
        )
    
    def _rotate_key(self) -> bool:
        """Rotate to next API key. Returns True if rotation successful, False if no more keys"""
        if self.current_key_index >= len(self.api_keys) - 1:
            logger.error("All API keys exhausted")
            return False
        
        self.current_key_index += 1
        self.client = self._create_client()
        logger.info(f"Rotated to API key #{self.current_key_index + 1}")
        return True
    
    async def generate(self, prompt: str, max_tokens: int = 150) -> str:
        """Generate text using LLM with automatic key rotation on quota errors"""
        attempts = 0
        max_attempts = len(self.api_keys)
        
        while attempts < max_attempts:
            try:
                logger.info(f"Sending request to {self.model} (attempt {attempts + 1}/{max_attempts})")
                logger.debug(f"Prompt: {prompt[:100]}...")
                
                response = await self.client.chat.completions.create(
                    model=self.model,
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=max_tokens,
                    temperature=0.7
                )
                
                logger.debug(f"Response object: {response}")
                
                if not response.choices:
                    logger.error("Response has no choices")
                    return "Error: API returned empty choices"
                
                content = response.choices[0].message.content
                
                if content is None:
                    logger.error("Response content is None")
                    return "Error: API returned None content"
                
                result = content.strip()
                logger.info(f"Generated response: {len(result)} characters")
                
                return result
            
            except RateLimitError as e:
                logger.warning(f"Rate limit hit on key #{self.current_key_index + 1}: {e}")
                attempts += 1
                
                if not self._rotate_key():
                    return f"Error: All API keys exhausted their quota"
                
                logger.info(f"Retrying with new key (attempt {attempts + 1}/{max_attempts})")
                continue
            
            except Exception as e:
                logger.error(f"LLM generation error: {type(e).__name__}: {e}")
                return f"Error: {str(e)}"
        
        return "Error: Failed to generate response after trying all API keys"

llm_client = LLMClient()
