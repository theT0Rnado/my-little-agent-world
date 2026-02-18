from openai import AsyncOpenAI, RateLimitError
from config import settings
import logging
import re

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
                
                response = await self.client.chat.completions.create(
                    model=self.model,
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=max_tokens,
                    temperature=0.7
                )
                
                if not response.choices:
                    logger.error("Response has no choices")
                    return "Error: API returned empty choices"
                
                message = response.choices[0].message
                content = message.content
                
                # Для reasoning моделей (GLM-4.7-Flash, DeepSeek-R1)
                if not content or len(content.strip()) == 0:
                    # Проверяем reasoning_details
                    if hasattr(message, 'reasoning_details') and message.reasoning_details:
                        reasoning_parts = []
                        for detail in message.reasoning_details:
                            if isinstance(detail, dict) and 'text' in detail:
                                reasoning_parts.append(detail['text'])
                        if reasoning_parts:
                            content = '\n'.join(reasoning_parts)
                            logger.info(f"Using reasoning_details: {len(content)} characters")
                
                if not content:
                    logger.error("Both content and reasoning_details are empty")
                    return "Error: API returned empty content"
                
                # Извлекаем финальный ответ
                result = self._extract_final_answer(content)
                
                logger.info(f"Generated response: {len(result)} characters")
                
                if len(result) == 0:
                    logger.warning("API returned empty string after processing")
                    return "Error: API returned empty content"
                
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
    
    def _extract_final_answer(self, content: str) -> str:
        """
        Извлекает финальный ответ из content.
        Убирает <think>...</think> блоки и reasoning.
        """
        result = content.strip()
        
        # 1. Убираем <think>...</think> блоки
        result = re.sub(r'<think>.*?</think>', '', result, flags=re.DOTALL)
        
        # 2. Убираем reasoning блоки (всё до последней пустой строки или маркера)
        lines = result.split('\n')
        
        # Ищем последний блок текста (после пустых строк или маркеров)
        final_lines = []
        found_separator = False
        
        for i in range(len(lines) - 1, -1, -1):
            line = lines[i].strip()
            
            # Пропускаем пустые строки в конце
            if not line and not final_lines:
                continue
            
            # Если нашли пустую строку и уже есть текст - это разделитель
            if not line and final_lines:
                found_separator = True
                break
            
            # Если строка содержит технические слова - это reasoning
            if any(keyword in line.lower() for keyword in [
                'plan:', 'step', 'analyze', 'brainstorm', 'concept', 
                'idea', 'draft', 'selecting', 'must be', 'breakdown',
                'анализ:', 'план:', 'шаг', 'идея', 'концепция'
            ]):
                found_separator = True
                break
            
            final_lines.insert(0, line)
        
        if final_lines:
            result = '\n'.join(final_lines).strip()
        
        # 3. Если всё ещё много текста - берём только последнее предложение/строку
        if len(result) > 300:
            sentences = result.split('.')
            # Берём последние 1-2 предложения
            result = '.'.join(sentences[-2:]).strip()
            if not result.endswith('.'):
                result += '.'
        
        return result.strip()

llm_client = LLMClient()
