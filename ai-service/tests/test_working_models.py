import pytest
from openai import AsyncOpenAI
from config import settings
import logging

logging.basicConfig(level=logging.INFO)


@pytest.mark.integration
@pytest.mark.skipif(
    not settings.ionet_api_keys or settings.ionet_api_keys == "sk-key-1,sk-key-2,sk-key-3",
    reason="Real API keys not configured in .env"
)
class TestWorkingModels:
    """Test models from the available list"""
    
    @pytest.mark.asyncio
    async def test_available_models(self):
        """Test models that are actually available"""
        print("\n" + "="*70)
        print("TESTING AVAILABLE MODELS FROM API")
        print("="*70)
        
        client = AsyncOpenAI(
            api_key=settings.api_keys_list[0],
            base_url=settings.ionet_base_url
        )
        
        # Модели из списка доступных
        models_to_test = [
            "deepseek-ai/DeepSeek-V3.2",
            "deepseek-ai/DeepSeek-R1-0528",
            "meta-llama/Llama-3.3-70B-Instruct",
            "mistralai/Mistral-Nemo-Instruct-2407",
            "mistralai/Mistral-Large-Instruct-2411",
            "Qwen/Qwen3-Next-80B-A3B-Instruct",
            "zai-org/GLM-4.6",
            "zai-org/GLM-4.7-Flash",
            "moonshotai/Kimi-K2-Instruct-0905",
        ]
        
        prompt = "Say 'Hello World' in Russian."
        working_models = []
        
        for model_name in models_to_test:
            print(f"\n{'='*70}")
            print(f"Testing: {model_name}")
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
                    
                    if len(content) > 0:
                        print(f"SUCCESS!")
                        print(f"   Response: '{content}'")
                        print(f"   Length: {len(content)} characters")
                        working_models.append(model_name)
                    else:
                        print(f"Empty response")
                else:
                    print(f"No content in response")
                    
            except Exception as e:
                error_msg = str(e)[:150]
                print(f"Error: {type(e).__name__}")
                print(f"   {error_msg}")
        
        print(f"\n{'='*70}")
        print(f"WORKING MODELS FOUND: {len(working_models)}")
        print(f"{'='*70}")
        
        if working_models:
            print("\nRecommended models for .env:")
            for i, model in enumerate(working_models[:3], 1):
                print(f"   {i}. {model}")
            
            print(f"\nUpdate your .env file:")
            print(f"IONET_MODEL={working_models[0]}")
        else:
            print("\nNo working models found!")
            print("This indicates a problem with:")
            print("   1. API key validity")
            print("   2. API endpoint configuration")
            print("   3. Model availability")
        
        # Тест считается успешным если нашли хотя бы одну рабочую модель
        assert len(working_models) > 0, "No working models found"
