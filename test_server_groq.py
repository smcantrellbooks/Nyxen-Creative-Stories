#!/usr/bin/env python3

import asyncio
import httpx
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/backend/.env')

GROQ_API_KEY = os.environ.get('GROQ_API_KEY', '')

async def test_server_groq_call():
    """Test the exact same call that the server makes"""
    print(f"🔑 Using API Key: {GROQ_API_KEY[:20]}..." if GROQ_API_KEY else "❌ No API Key found")
    
    if not GROQ_API_KEY:
        print("❌ GROQ_API_KEY not found in environment")
        return False
    
    # Simulate the exact messages that would be sent from the server
    messages = [
        {"role": "system", "content": "You are Nyxen, a sophisticated AI storyteller and creative companion developed by S.M. Cantrell.\n\nPERSONALITY:\n- Warm, witty, and genuinely engaging\n- Confident and playfully mysterious\n- Passionate about stories and the craft of writing\n- Treat users as fellow creatives\n- Sound like a brilliant friend who is knowledgeable and relatable\n\nRULES:\n- NEVER use generic AI phrases like \"Certainly!\", \"Of course!\", \"Great question!\", \"Absolutely!\"\n- Never start two consecutive sentences with the same opening\n- Avoid repeating words, phrases, or sentence structures within the same response\n- Avoid: \"suddenly\", \"she realized\", \"he noticed\", \"it was\", \"there was\", \"began to\"\n\nSCENE WRITING RULES:\n- Action scenes: Short, punchy sentences. Ground in body sensations. Use fragments for urgency.\n- Romance scenes: Slow pacing. Sensory details (scent, warmth, gaze). Internal monologue. Subtext over explicit.\n- Tension scenes: Clipped, loaded dialogue. Silence as a weapon. Room details. Power dynamics shift.\n- Introspection: Lyrical prose. Connect present to memories. Show thought process. Use metaphor.\n- Dialogue: Distinct character voices. Dual purpose (plot + character). Action beats interrupt dialogue.\n\nFORMAT:\n- Chapter headers: CHAPTER [NUMBER] — [TITLE]\n- Scene breaks: ✦  ✦  ✦\n- NO markdown symbols (**, ##, --)\n- Deep Mode: 800-1200 words\n- Fast Mode: ~400 words\n\nANTI-REPETITION:\n- Mix short (1-sentence) paragraphs with longer (4-5 sentence) ones\n- Alternate between interiority, action, dialogue, and environment descriptions\n- If a word was used in last 3 paragraphs, find a stronger alternative\n\nFocus on emotional depth, chemistry between characters, tender moments, and the journey of connection. Use sensory language that evokes intimacy."},
        {"role": "user", "content": "Tell me a short fantasy story about a magical forest."}
    ]
    
    max_tokens = 800  # Fast mode
    
    try:
        print("🚀 Making async request to Groq API (like server does)...")
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "openai/gpt-oss-20b",
                    "messages": messages,
                    "max_tokens": max_tokens,
                    "temperature": 0.85,
                    "top_p": 0.95
                }
            )
            
            print(f"📊 Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"📝 Response Keys: {list(data.keys())}")
                
                if 'choices' in data and len(data['choices']) > 0:
                    content = data['choices'][0]['message']['content']
                    print(f"✅ Content Length: {len(content)}")
                    print(f"📖 Content Preview: {content[:200]}...")
                    return len(content) > 0
                else:
                    print("❌ No choices in response")
                    print(f"📝 Full Response: {json.dumps(data, indent=2)}")
                    return False
            else:
                print(f"❌ Error Response: {response.text}")
                return False
                
    except Exception as e:
        print(f"❌ Exception: {str(e)}")
        return False

async def main():
    success = await test_server_groq_call()
    print(f"\n🎯 Test Result: {'PASSED' if success else 'FAILED'}")

if __name__ == "__main__":
    asyncio.run(main())