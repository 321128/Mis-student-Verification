import os
import sys
import logging
import requests
import json
from typing import Dict, Any, List, Optional

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import config

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OllamaClient:
    """Client for interacting with Ollama API"""
    
    def __init__(self, model: str = None):
        """Initialize the Ollama client
        
        Args:
            model: Name of the model to use (default: from config)
        """
        self.base_url = config.OLLAMA_URL.replace('/api/generate', '')
        self.model = model or config.OLLAMA_MODEL
        self.alternative_model = config.OLLAMA_ALTERNATIVE_MODEL
    
    def generate(self, prompt: str, system_prompt: str = None, max_tokens: int = 2048) -> str:
        """Generate text using Ollama
        
        Args:
            prompt: The prompt to generate text from
            system_prompt: Optional system prompt
            max_tokens: Maximum number of tokens to generate
            
        Returns:
            Generated text
        """
        url = f"{self.base_url}/api/generate"
        
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "num_predict": max_tokens,
                "temperature": 0.7,
                "top_p": 0.9,
                "top_k": 40
            }
        }
        
        if system_prompt:
            payload["system"] = system_prompt
        
        try:
            response = requests.post(url, json=payload)
            response.raise_for_status()
            result = response.json()
            return result.get('response', '')
        except requests.exceptions.RequestException as e:
            logger.error(f"Error calling Ollama API with model {self.model}: {e}")
            
            # Try alternative model if primary fails
            if self.model != self.alternative_model:
                logger.info(f"Trying alternative model: {self.alternative_model}")
                backup_model = self.model
                self.model = self.alternative_model
                try:
                    result = self.generate(prompt, system_prompt, max_tokens)
                    self.model = backup_model  # Restore original model
                    return result
                except Exception as e2:
                    logger.error(f"Error with alternative model: {e2}")
                    self.model = backup_model  # Restore original model
            
            return f"Error generating text: {str(e)}"
    
    def get_embedding(self, text: str) -> List[float]:
        """Get embedding for text using Ollama
        
        Args:
            text: Text to embed
            
        Returns:
            List of embedding values
        """
        url = f"{self.base_url}/api/embeddings"
        
        payload = {
            "model": "nomic-embed-text",
            "prompt": text
        }
        
        try:
            response = requests.post(url, json=payload)
            response.raise_for_status()
            result = response.json()
            return result.get('embedding', [])
        except requests.exceptions.RequestException as e:
            logger.error(f"Error getting embedding: {e}")
            return []
    
    def list_models(self) -> List[str]:
        """List available models
        
        Returns:
            List of model names
        """
        url = f"{self.base_url}/api/tags"
        
        try:
            response = requests.get(url)
            response.raise_for_status()
            result = response.json()
            models = [model['name'] for model in result.get('models', [])]
            return models
        except requests.exceptions.RequestException as e:
            logger.error(f"Error listing models: {e}")
            return []