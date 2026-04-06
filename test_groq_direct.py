#!/usr/bin/env python3

import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/backend/.env')

GROQ_API_KEY = os.environ.get('GROQ_API_KEY', '')

def test_groq_api():
    """Test Groq API directly"""
    print(f"🔑 Using API Key: {GROQ_API_KEY[:20]}..." if GROQ_API_KEY else "❌ No API Key found")
    
    if not GROQ_API_KEY:
        print("❌ GROQ_API_KEY not found in environment")
        return False
    
    messages = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Tell me a very short story about a dragon."}
    ]
    
    payload = {
        "model": "openai/gpt-oss-20b",
        "messages": messages,
        "max_tokens": 100,
        "temperature": 0.85,
        "top_p": 0.95
    }
    
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    try:
        print("🚀 Making request to Groq API...")
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=30
        )
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📋 Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"📝 Full Response: {json.dumps(data, indent=2)}")
            
            if 'choices' in data and len(data['choices']) > 0:
                content = data['choices'][0]['message']['content']
                print(f"✅ Content: '{content}'")
                print(f"📏 Content Length: {len(content)}")
                return len(content) > 0
            else:
                print("❌ No choices in response")
                return False
        else:
            print(f"❌ Error Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Exception: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_groq_api()
    print(f"\n🎯 Test Result: {'PASSED' if success else 'FAILED'}")