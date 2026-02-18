import pytest
from openai import AsyncOpenAI
from config import settings
import logging

logging.basicConfig(level=logging.DEBUG)


@pytest.mark.integration
@pytest.mark.skipif(
    not settings.ionet_api_keys or settings.ionet_api_keys == "sk-key-1,sk-key-2,sk-key-3",
    reason="Real API keys not configured in .env"
)
class TestDifferentModels:
    """Test different models to find working one"""
    
    @pytest.mark.asyncio
    async def test_list_models(self):
        """Try to list available models"""
        print("\n" + "="*70)
        print("TRYING TO LIST AVAILABLE MODELS")
        print("="*70)
        
        client = AsyncOpenAI(
            api_key=settings.api_keys_list[0],
            base_url=settings.ionet_base_url
        )
        
        try:
            models = await client.models.list()
            print(f"\n✓ Available models:")
            for model in models.data:
                print(f"   - {model.id}")
        except Exception as e:
            print(f"\n✗ Cannot list models: {e}")
            print("   This API might not support model listing")
    
    @pytest.mark.asyncio
    async def test_alternative_models(self):
        """Test several popular models"""
        print("\n" + "="*70)
        print("TESTING ALTERNATIVE MODELS")
        print("="*70)
        
        client = AsyncOpenAI(
            api_key=settings.api_keys_list[0],
            base_url=settings.ionet_base_url
        )
        
        # Список популярных моделей для тестирования
        models_to_test = [
            "zai-org/GLM-4.7",  # Текущая модель
            "meta-llama/Llama-3.2-3B-Instruct",
            "meta-llama/Meta-Llama-3-8B-Instruct",
            "mistralai/Mistral-7B-Instruct-v0.3",
            "Qwen/Qwen2.5-7B-Instruct",
            "google/gemma-2-9b-it",
        ]
        
        prompt = "Say 'Hello World' in Russian."
        
        for model_name in models_to_test:
            print(f"\n{'='*70}")
            print(f"Testing model: {model_name}")
            print(f"{'='*70}")
            
            try:
                response = await client.chat.completions.create(
                    model=model_name,
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=50,
                    temperature=0.7
                )
                
                if response.choices and response.choices[0].message.content:
                    content = response.choices[0].message.content.strip()
                    print(f"✓ SUCCESS!")
                    print(f"   Response: '{content}'")
                    print(f"   Length: {len(content)} characters")
                    
                    # Если нашли рабочую модель - сохраняем
                    if len(content) > 0:
                        print(f"\n🎉 WORKING MODEL FOUND: {model_name}")
                        print(f"   Update your .env file:")
                        print(f"   IONET_MODEL={model_name}")
                        return
                else:
                    print(f"✗ Empty response")
                    
            except Exception as e:
                print(f"✗ Error: {type(e).__name__}: {str(e)[:100]}")
        
        print(f"\n{'='*70}")
        print("⚠️  No working model found")
        print("   This might indicate:")
        print("   1. API key is invalid or expired")
        print("   2. API endpoint is incorrect")
        print("   3. All tested models are unavailable")
        print(f"{'='*70}")
