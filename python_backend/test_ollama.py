#!/usr/bin/env python3
"""
Test script to verify Ollama connection and models
"""

import sys
import requests
import json

OLLAMA_URL = "http://localhost:11434"

def check_ollama_status():
    """Check if Ollama is running and list available models"""
    try:
        # Check if Ollama is running
        response = requests.get(f"{OLLAMA_URL}/api/tags")
        if response.status_code != 200:
            print(f"❌ Error connecting to Ollama: {response.status_code}")
            return False
        
        # Get available models
        models = response.json().get('models', [])
        if not models:
            print("❌ No models found in Ollama")
            return False
        
        print("✅ Ollama is running")
        print("\nAvailable models:")
        for model in models:
            print(f"  - {model['name']}")
        
        # Check for required models
        required_models = ["phi:mini", "mistral:latest", "nomic-embed-text"]
        missing_models = []
        
        for required in required_models:
            if not any(required in model['name'] for model in models):
                missing_models.append(required)
        
        if missing_models:
            print("\n❌ Missing required models:")
            for model in missing_models:
                print(f"  - {model}")
            print("\nPlease install missing models with:")
            for model in missing_models:
                print(f"  ollama pull {model}")
            return False
        
        print("\n✅ All required models are installed")
        return True
    
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to Ollama. Is it running?")
        print("Start Ollama with: ollama serve")
        return False
    except Exception as e:
        print(f"❌ Error checking Ollama status: {e}")
        return False

def test_model(model_name):
    """Test a model with a simple prompt"""
    try:
        print(f"\nTesting model: {model_name}")
        
        # Simple prompt
        prompt = "Write a short greeting in 10 words or less."
        
        # Call Ollama API
        response = requests.post(
            f"{OLLAMA_URL}/api/generate",
            json={
                "model": model_name,
                "prompt": prompt,
                "stream": False
            }
        )
        
        if response.status_code != 200:
            print(f"❌ Error testing model {model_name}: {response.status_code}")
            return False
        
        # Get response
        result = response.json()
        generated_text = result.get('response', '')
        
        print(f"Prompt: {prompt}")
        print(f"Response: {generated_text}")
        print(f"✅ Model {model_name} is working")
        return True
    
    except Exception as e:
        print(f"❌ Error testing model {model_name}: {e}")
        return False

def main():
    """Main function"""
    print("Testing Ollama connection and models...\n")
    
    if not check_ollama_status():
        return 1
    
    # Test models
    models_to_test = ["phi:mini", "mistral:latest"]
    for model in models_to_test:
        if not test_model(model):
            return 1
    
    print("\n✅ All tests passed! The system is ready to use.")
    return 0

if __name__ == "__main__":
    sys.exit(main())