#!/usr/bin/env python3

import requests
import json

def test_chat_endpoint():
    """Test the chat endpoint directly"""
    base_url = "https://completion-engine-1.preview.emergentagent.com"
    api_url = f"{base_url}/api"
    
    payload = {
        "conversation_id": None,
        "message": "Tell me a very short story about a dragon.",
        "genre": "fantasy",
        "mode": "fast"
    }
    
    print("🚀 Testing chat endpoint...")
    print(f"📤 Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(f"{api_url}/chat", json=payload, timeout=60)
        print(f"📊 Status Code: {response.status_code}")
        print(f"📋 Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"📝 Response Keys: {list(data.keys())}")
            print(f"📝 Full Response: {json.dumps(data, indent=2)}")
            
            if 'message' in data:
                message = data['message']
                content = message.get('content', '')
                print(f"✅ Message Content Length: {len(content)}")
                print(f"📖 Content: '{content}'")
                return len(content) > 0
            else:
                print("❌ No message in response")
                return False
        else:
            print(f"❌ Error Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Exception: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_chat_endpoint()
    print(f"\n🎯 Test Result: {'PASSED' if success else 'FAILED'}")