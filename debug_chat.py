#!/usr/bin/env python3

import requests
import json

def debug_chat_endpoint():
    """Debug the chat endpoint specifically"""
    api_url = "https://completion-engine-1.preview.emergentagent.com/api"
    
    # First create a conversation
    print("🔧 Creating conversation...")
    conv_payload = {
        "title": "Debug Test",
        "genre": "fantasy",
        "mode": "fast"
    }
    conv_response = requests.post(f"{api_url}/conversations", json=conv_payload, timeout=10)
    print(f"Conversation creation status: {conv_response.status_code}")
    
    if conv_response.status_code == 200:
        conv_data = conv_response.json()
        conversation_id = conv_data["id"]
        print(f"Created conversation: {conversation_id}")
        
        # Now test chat
        print("\n🔧 Testing chat endpoint...")
        chat_payload = {
            "conversation_id": conversation_id,
            "message": "Tell me a short fantasy story about a magical forest.",
            "genre": "fantasy",
            "mode": "fast"
        }
        
        chat_response = requests.post(f"{api_url}/chat", json=chat_payload, timeout=60)
        print(f"Chat response status: {chat_response.status_code}")
        
        if chat_response.status_code == 200:
            chat_data = chat_response.json()
            print(f"Full response: {json.dumps(chat_data, indent=2)}")
            
            message = chat_data.get("message", {})
            content = message.get("content", "")
            print(f"\nContent length: {len(content)}")
            print(f"Content preview: {content[:200]}...")
            
            if len(content) > 50:
                print("✅ Chat endpoint working correctly!")
            else:
                print("❌ Chat endpoint returning empty/short content")
        else:
            print(f"❌ Chat failed: {chat_response.text}")
        
        # Cleanup
        print(f"\n🧹 Cleaning up conversation {conversation_id}")
        requests.delete(f"{api_url}/conversations/{conversation_id}")
    else:
        print(f"❌ Failed to create conversation: {conv_response.text}")

if __name__ == "__main__":
    debug_chat_endpoint()