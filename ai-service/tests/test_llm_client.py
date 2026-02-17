import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from openai import RateLimitError, AsyncOpenAI
from llm.client import LLMClient


class TestLLMClient:
    """Tests for LLM client with io.net integration and key rotation"""
    
    @pytest.fixture
    def mock_settings(self):
        """Mock settings with multiple API keys"""
        with patch('llm.client.settings') as mock:
            mock.api_keys_list = ["io-v2-eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJvd25lciI6IjVmNzAwZTczLWI1OGQtNGEwOC04YmIyLWI4NDQ0M2NkNjU0NSIsImV4cCI6NDkyNDk0ODk3NX0.aexWy-XD1mbzeYL1pwOQqgoCnkSXkVTOepM1swBASn1gPmZawbNI87RyI3TidoNv0wpKWFN2VqOuDkUZ777Jsw", "key2", "key3"]
            mock.ionet_base_url = "https://api.intelligence.io.solutions/api/v1/"
            mock.ionet_model = "zai-org/GLM-4.7"
            yield mock
    
    @pytest.fixture
    def mock_async_openai(self):
        """Mock AsyncOpenAI to prevent real client creation"""
        with patch('llm.client.AsyncOpenAI') as mock:
            mock_client = MagicMock()
            mock_client.chat.completions.create = AsyncMock()
            mock.return_value = mock_client
            yield mock
    
    @pytest.fixture
    def llm_client(self, mock_settings, mock_async_openai):
        """Create LLM client instance with mocked settings"""
        return LLMClient()
    
    def test_initialization(self, llm_client, mock_settings):
        """Test client initializes with correct settings"""
        assert llm_client.model == "zai-org/GLM-4.7"
        assert llm_client.base_url == "https://api.intelligence.io.solutions/api/v1/"
        assert len(llm_client.api_keys) == 3
        assert llm_client.current_key_index == 0
    
    def test_initialization_no_keys(self, mock_async_openai):
        """Test client raises error when no API keys provided"""
        with patch('llm.client.settings') as mock:
            mock.api_keys_list = []
            with pytest.raises(ValueError, match="No API keys provided"):
                LLMClient()
    
    @pytest.mark.asyncio
    async def test_generate_success(self, llm_client, mock_async_openai):
        """Test successful text generation"""
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = "Generated text response"
        
        mock_async_openai.return_value.chat.completions.create.return_value = mock_response
        
        result = await llm_client.generate("Test prompt")
        
        assert result == "Generated text response"
        mock_async_openai.return_value.chat.completions.create.assert_called_once()
        call_args = mock_async_openai.return_value.chat.completions.create.call_args
        assert call_args.kwargs['model'] == "zai-org/GLM-4.7"
        assert call_args.kwargs['messages'][0]['content'] == "Test prompt"
    
    @pytest.mark.asyncio
    async def test_generate_with_custom_max_tokens(self, llm_client, mock_async_openai):
        """Test generation with custom max_tokens parameter"""
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = "Response"
        
        mock_async_openai.return_value.chat.completions.create.return_value = mock_response
        
        await llm_client.generate("Test", max_tokens=300)
        
        call_args = mock_async_openai.return_value.chat.completions.create.call_args
        assert call_args.kwargs['max_tokens'] == 300
    
    def test_rotate_key_success(self, llm_client):
        """Test successful key rotation"""
        assert llm_client.current_key_index == 0
        
        result = llm_client._rotate_key()
        
        assert result is True
        assert llm_client.current_key_index == 1
    
    def test_rotate_key_exhausted(self, llm_client):
        """Test key rotation when all keys exhausted"""
        llm_client.current_key_index = 2  # Last key
        
        result = llm_client._rotate_key()
        
        assert result is False
        assert llm_client.current_key_index == 2  # Stays at last key
    
    @pytest.mark.asyncio
    async def test_generate_rate_limit_with_rotation(self, llm_client, mock_async_openai):
        """Test automatic key rotation on rate limit error"""
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = "Success after rotation"
        
        # First call raises RateLimitError, second succeeds
        mock_async_openai.return_value.chat.completions.create.side_effect = [
            RateLimitError("Rate limit exceeded", response=MagicMock(), body=None),
            mock_response
        ]
        
        result = await llm_client.generate("Test prompt")
        
        assert result == "Success after rotation"
        assert llm_client.current_key_index == 1  # Rotated to next key
        assert mock_async_openai.return_value.chat.completions.create.call_count == 2
    
    @pytest.mark.asyncio
    async def test_generate_all_keys_exhausted(self, llm_client, mock_async_openai):
        """Test when all API keys hit rate limit"""
        # All calls raise RateLimitError
        mock_async_openai.return_value.chat.completions.create.side_effect = RateLimitError(
            "Rate limit exceeded", 
            response=MagicMock(), 
            body=None
        )
        
        result = await llm_client.generate("Test prompt")
        
        assert "All API keys exhausted their quota" in result
        assert mock_async_openai.return_value.chat.completions.create.call_count == 3  # Tried all 3 keys
    
    @pytest.mark.asyncio
    async def test_generate_generic_error(self, llm_client, mock_async_openai):
        """Test handling of non-rate-limit errors"""
        mock_async_openai.return_value.chat.completions.create.side_effect = Exception("Network error")
        
        result = await llm_client.generate("Test prompt")
        
        assert "Error: Network error" in result
        assert llm_client.current_key_index == 0  # No rotation on generic error
    
    @pytest.mark.asyncio
    async def test_generate_multiple_rotations(self, llm_client, mock_async_openai):
        """Test multiple key rotations before success"""
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = "Final success"
        
        # First two keys fail, third succeeds
        mock_async_openai.return_value.chat.completions.create.side_effect = [
            RateLimitError("Rate limit", response=MagicMock(), body=None),
            RateLimitError("Rate limit", response=MagicMock(), body=None),
            mock_response
        ]
        
        result = await llm_client.generate("Test prompt")
        
        assert result == "Final success"
        assert llm_client.current_key_index == 2  # Used third key
        assert mock_async_openai.return_value.chat.completions.create.call_count == 3
    
    @pytest.mark.asyncio
    async def test_generate_temperature_parameter(self, llm_client, mock_async_openai):
        """Test that temperature is correctly set"""
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = "Response"
        
        mock_async_openai.return_value.chat.completions.create.return_value = mock_response
        
        await llm_client.generate("Test")
        
        call_args = mock_async_openai.return_value.chat.completions.create.call_args
        assert call_args.kwargs['temperature'] == 0.7
