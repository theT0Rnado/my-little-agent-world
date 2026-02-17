import pytest
from llm.client import LLMClient
from config import settings
import logging

# Enable logging to see what's happening
logging.basicConfig(level=logging.DEBUG)


@pytest.mark.integration
@pytest.mark.skipif(
    not settings.ionet_api_keys or settings.ionet_api_keys == "sk-key-1,sk-key-2,sk-key-3",
    reason="Real API keys not configured in .env"
)
class TestLLMIntegration:
    """Integration test with real io.net API call"""
    
    @pytest.mark.asyncio
    async def test_real_api_call(self):
        """Test real API call and show request/response"""
        print("\n" + "="*70)
        print("TESTING REAL API CALL TO IO.NET")
        print("="*70)
        
        # Initialize client
        client = LLMClient()
        
        print(f"\n📋 Configuration:")
        print(f"   Base URL: {client.base_url}")
        print(f"   Model: {client.model}")
        print(f"   API Keys: {len(client.api_keys)} configured")
        print(f"   Current Key Index: {client.current_key_index}")
        print(f"   First Key (masked): {client.api_keys[0][:10]}...")
        
        # Prepare prompt
        prompt = "Hello! Please respond with a friendly greeting."
        
        print(f"\n📤 REQUEST:")
        print(f"   Prompt: {prompt}")
        print(f"   Max Tokens: 100")
        print(f"   Temperature: 0.7")
        
        print(f"\n⏳ Sending request to {client.model}...")
        print(f"   (Check logs below for detailed API interaction)")
        
        # Make API call
        try:
            result = await client.generate(prompt, max_tokens=100)
            
            print(f"\n📥 RESPONSE:")
            print(f"   Status: {'✓ Success' if result and not result.startswith('Error:') else '✗ Error'}")
            print(f"   Length: {len(result)} characters")
            print(f"   Content: '{result}'")
            print(f"   Type: {type(result)}")
            
            print("\n" + "="*70)
            
            # Assertions
            assert result is not None, "Response is None"
            assert isinstance(result, str), f"Response is not string: {type(result)}"
            
            if result.startswith("Error:"):
                print(f"\n⚠️  API returned error: {result}")
                pytest.fail(f"API Error: {result}")
            
            if len(result) == 0:
                print(f"\n⚠️  API returned empty string - this might be an API issue")
                print(f"   Check the logs above for more details")
                pytest.fail("Response is empty string - check API configuration and logs")
            
            print("\n✓ Test passed successfully!")
            
        except Exception as e:
            print(f"\n✗ Exception occurred: {type(e).__name__}")
            print(f"   Message: {str(e)}")
            print("\n" + "="*70)
            raise
