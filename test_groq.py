#!/usr/bin/env python3

import requests
import json

# Test Groq API directly
GROQ_API_KEY = "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"

def test_groq_models():
    """Test different Groq models"""
    models_to_test = [
        "openai/gpt-oss-20b",
        "llama3-8b-8192",
        "llama3-70b-8192",
        "mixtral-8x7b-32768",
        "gemma-7b-it"
    ]
    
    test_messages = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Tell me a very short story about a dragon."}
    ]
    
    for model in models_to_test:
        print(f"\n🧪 Testing model: {model}")
        try:
            response = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": model,
                    "messages": test_messages,
                    "max_tokens": 200,
                    "temperature": 0.7
                },
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                if content:
                    print(f"✅ {model} - SUCCESS")
                    print(f"   Response: {content[:100]}...")
                else:
                    print(f"❌ {model} - Empty response")
                    print(f"   Full response: {data}")
            else:
                print(f"❌ {model} - HTTP {response.status_code}")
                print(f"   Error: {response.text}")
                
        except Exception as e:
            print(f"❌ {model} - Exception: {str(e)}")

if __name__ == "__main__":
    test_groq_models()