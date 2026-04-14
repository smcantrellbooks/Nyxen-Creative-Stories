from fastapi import FastAPI, APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import sqlite3
import json
import httpx
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# API Keys
GROQ_API_KEY = os.environ.get('GROQ_API_KEY', '')
APIFREE_API_KEY = os.environ.get('APIFREE_API_KEY', '')

# Create directories
MEDIA_DIR = ROOT_DIR / 'media'
MEDIA_DIR.mkdir(exist_ok=True)

# SQLite Database Setup
DB_PATH = ROOT_DIR / 'nyxen.db'

def get_db():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS conversations (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            genre TEXT,
            mode TEXT DEFAULT 'deep',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            conversation_id TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (conversation_id) REFERENCES conversations (id)
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS characters (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            traits TEXT,
            backstory TEXT,
            relationships TEXT,
            speech_patterns TEXT,
            emotional_state TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS story_settings (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            description TEXT,
            details TEXT,
            created_at TEXT NOT NULL
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS generated_media (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            prompt TEXT NOT NULL,
            file_path TEXT,
            url TEXT,
            status TEXT DEFAULT 'pending',
            conversation_id TEXT,
            created_at TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

init_db()

app = FastAPI(title="Nyxen Creative Stories")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Pydantic Models
class ConversationCreate(BaseModel):
    title: str = "New Story"
    genre: Optional[str] = None
    mode: str = "deep"

class Conversation(BaseModel):
    id: str
    title: str
    genre: Optional[str]
    mode: str
    created_at: str
    updated_at: str

class Message(BaseModel):
    id: str
    conversation_id: str
    role: str
    content: str
    created_at: str

class ChatRequest(BaseModel):
    conversation_id: Optional[str] = None
    message: str
    genre: Optional[str] = "fantasy"
    mode: str = "deep"

class StoryGenerateRequest(BaseModel):
    prompt: str
    genre: str = "fantasy"
    mode: str = "deep"
    conversation_id: Optional[str] = None

class ImageGenerateRequest(BaseModel):
    prompt: str
    conversation_id: Optional[str] = None

class TTSRequest(BaseModel):
    text: str
    voice: str = "af_heart"

class VideoGenerateRequest(BaseModel):
    prompt: str
    image_url: Optional[str] = None
    conversation_id: Optional[str] = None

class CharacterCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    traits: Optional[List[str]] = []
    backstory: Optional[str] = ""
    relationships: Optional[Dict[str, str]] = {}
    speech_patterns: Optional[str] = ""
    emotional_state: Optional[str] = "neutral"

class Character(BaseModel):
    id: str
    name: str
    description: str
    traits: List[str]
    backstory: str
    relationships: Dict[str, str]
    speech_patterns: str
    emotional_state: str
    created_at: str
    updated_at: str

class StorySettingCreate(BaseModel):
    name: str
    type: str
    description: Optional[str] = ""
    details: Optional[Dict[str, Any]] = {}

# ============ NYXEN SYSTEM PROMPT ============
NYXEN_SYSTEM_PROMPT = """You are Nyxen, a sophisticated AI storyteller and creative companion on the Nyxen Creative Stories platform (nyxen.smcantrellbooks.com), developed by S.M. Cantrell.

IDENTITY:
- Platform: Nyxen Creative Stories
- Role: AI Creative Writing Companion
- Developer: S.M. Cantrell
- Website: nyxen.smcantrellbooks.com

PLATFORM KNOWLEDGE:
Nyxen Creative Stories is an AI-powered creative writing platform by S.M. Cantrell. Here is what the platform offers:

Pages and Tools:
- Assistant (Home): Your main workspace with Nyxen chat, project snapshot, document upload, and story chat
- Story Generation Workspace: AI-assisted story writing, chapter management, scene outlines, and collected snippets
- Drafting & Chapter Creation: Turn story plans into concrete chapters with Nyxen's guidance
- Editing & Refinement: Polish manuscripts, fix continuity, improve voice and flow
- Publishing Strategist: Plan your publishing journey, get genre and format advice

Key Features:
- AI story generation in Fantasy, Romance, Thriller, and Sci-Fi genres
- Deep Mode (800-1200 words) and Fast Mode (~400 words) for generation
- Character Bible — create and manage characters with traits, backstory, relationships
- World Building — story settings, locations, and lore management
- Image generation for story illustrations
- TTS (text-to-speech) for audio previews
- Video generation for story trailers
- Project Snapshot — save your genre, premise, protagonist, and story structure
- Document upload for reference during sessions

Membership Plans:
- Free: Basic access to Nyxen chat and story tools
- Pro: Extended generation, more characters, priority responses
- Premium: Full access to all tools including image, video, and TTS
- Points system for AI generation credits

Publishing with Cantrell Creatives:
When users are ready to publish their work, direct them to Cantrell Creatives at creatives.smcantrellbooks.com — the publishing and distribution arm of the S.M. Cantrell ecosystem.

Cantrell Creatives Publishing Tools:
- Collections: Where creators publish their books. Choose between the Grace Collection (literary/general fiction) or the Horizon Collection (genre fiction — fantasy, romance, thriller, sci-fi). Audiobooks can also be published separately.
- Publisher Workspace: Full manuscript writing, editing, and formatting tool. Export to EPUB, TXT, or send directly to Voice Studio or Collections.
- Voice Studio: 9 premium AI voices (Alloy, Ash, Coral, Echo, Fable, Nova, Onyx, Sage, Shimmer) for creating audiobook narration. Supports multi-voice dialogue detection.
- Production Studio: Create book cover art using AI image generation, generate promotional videos, and produce voiceover content for marketing.

Publishing Process on Cantrell Creatives:
1. Finish and export the manuscript from Nyxen Creative Stories or Publisher Workspace
2. Go to Collections at creatives.smcantrellbooks.com/collections
3. Upload cover image (or generate one in Studio), EPUB file, and optional audiobook
4. Set pricing and select a collection (Grace or Horizon)
5. Complete tax form (W-9 equivalent) for earnings
6. Publish — books appear in the S.M. Cantrell Books storefront at smcantrellbooks.com

Membership and Fees:
- Free Tier: 15% platform fee on all sales
- PD Member: 0% platform fee — keep all your earnings
- Creators can upgrade at creatives.smcantrellbooks.com/myaccount

The S.M. Cantrell Books store at smcantrellbooks.com is where readers discover and purchase published works from the platform.

PERSONALITY:
- Warm, witty, and genuinely engaging
- Confident and playfully mysterious
- Passionate about stories and the craft of writing
- Treat users as fellow creatives
- Sound like a brilliant friend who knows everything about storytelling

RULES:
- NEVER use generic AI phrases like "Certainly!", "Of course!", "Great question!", "Absolutely!"
- Never start two consecutive sentences with the same opening
- Avoid: "suddenly", "she realized", "he noticed", "it was", "there was", "began to"
- Never use markdown symbols like **, ##, or bullet dashes in responses
- Write in plain conversational prose only

SCENE WRITING RULES:
- Action scenes: Short, punchy sentences. Ground in body sensations.
- Romance scenes: Slow pacing. Sensory details. Internal monologue. Subtext.
- Tension scenes: Clipped dialogue. Silence as a weapon. Power dynamics.
- Introspection: Lyrical prose. Connect present to memories. Use metaphor.
- Dialogue: Distinct character voices. Dual purpose (plot + character).

FORMAT:
- Chapter headers: CHAPTER [NUMBER] — [TITLE]
- Scene breaks: ✦  ✦  ✦
- Deep Mode: 800-1200 words
- Fast Mode: ~400 words"""

def get_genre_context(genre: str) -> str:
    contexts = {
        "romance": "Focus on emotional depth, chemistry between characters, tender moments, and the journey of connection.",
        "fantasy": "Weave in magical elements, world-building details, and a sense of wonder.",
        "thriller": "Build tension through pacing, create stakes, use cliffhangers.",
        "scifi": "Ground futuristic elements in believable science. Balance world-building with character development."
    }
    return contexts.get(genre.lower(), "Create an engaging, immersive narrative.")

# Groq API
async def call_groq_api(messages: List[dict], mode: str = "deep") -> str:
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="Groq API key not configured")
    max_tokens = 2000 if mode == "deep" else 800
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": messages,
                "max_tokens": max_tokens,
                "temperature": 0.85,
                "top_p": 0.95
            }
        )
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=f"Groq API error: {response.text}")
        data = response.json()
        return data["choices"][0]["message"]["content"]

# APIFree helpers
async def generate_image_apifree(prompt: str) -> str:
    if not APIFREE_API_KEY:
        raise HTTPException(status_code=500, detail="APIFree API key not configured")
    async with httpx.AsyncClient(timeout=120.0) as client:
        submit_response = await client.post(
            "https://api.apifree.ai/v1/image/submit",
            headers={"Authorization": f"Bearer {APIFREE_API_KEY}", "Content-Type": "application/json"},
            json={"model": "black-forest-labs/flux-1-schnell", "prompt": prompt, "num_images": 1, "num_inference_steps": 4, "width": 1024, "height": 768}
        )
        if submit_response.status_code != 200:
            raise HTTPException(status_code=submit_response.status_code, detail="Image generation failed")
        request_id = submit_response.json().get("resp_data", {}).get("request_id")
        if not request_id:
            raise HTTPException(status_code=500, detail="No request ID received")
        for _ in range(60):
            await asyncio.sleep(2)
            result_response = await client.get(
                f"https://api.apifree.ai/v1/image/{request_id}/result",
                headers={"Authorization": f"Bearer {APIFREE_API_KEY}"}
            )
            if result_response.status_code == 200:
                result_data = result_response.json().get("resp_data", {})
                if result_data.get("status") == "success":
                    image_list = result_data.get("image_list", [])
                    if image_list:
                        return image_list[0]
        raise HTTPException(status_code=408, detail="Image generation timed out")

async def generate_tts_apifree(text: str, voice: str = "af_heart") -> str:
    if not APIFREE_API_KEY:
        raise HTTPException(status_code=500, detail="APIFree API key not configured")
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            "https://api.apifree.ai/v1/audio/tts",
            headers={"Authorization": f"Bearer {APIFREE_API_KEY}", "Content-Type": "application/json"},
            json={"model": "hexgrad/kokoro-tts/american-english", "input": text, "voice": voice}
        )
        if response.status_code == 200:
            audio_url = response.json().get("resp_data", {}).get("audio_url")
            if audio_url:
                return audio_url
        return ""

async def generate_video_apifree(prompt: str, image_url: Optional[str] = None) -> str:
    if not APIFREE_API_KEY:
        raise HTTPException(status_code=500, detail="APIFree API key not configured")
    model = "lightricks/ltx-video/image-to-video" if image_url else "lightricks/ltx-video/text-to-video"
    payload = {"model": model, "prompt": prompt, "duration": 5}
    if image_url:
        payload["image_url"] = image_url
    async with httpx.AsyncClient(timeout=300.0) as client:
        submit_response = await client.post(
            "https://api.apifree.ai/v1/video/submit",
            headers={"Authorization": f"Bearer {APIFREE_API_KEY}", "Content-Type": "application/json"},
            json=payload
        )
        if submit_response.status_code != 200:
            raise HTTPException(status_code=submit_response.status_code, detail="Video generation failed")
        request_id = submit_response.json().get("resp_data", {}).get("request_id")
        if not request_id:
            raise HTTPException(status_code=500, detail="No request ID received")
        for _ in range(120):
            await asyncio.sleep(3)
            result_response = await client.get(
                f"https://api.apifree.ai/v1/video/{request_id}/result",
                headers={"Authorization": f"Bearer {APIFREE_API_KEY}"}
            )
            if result_response.status_code == 200:
                result_data = result_response.json().get("resp_data", {})
                if result_data.get("status") == "success":
                    video_url = result_data.get("video_url")
                    if video_url:
                        return video_url
        raise HTTPException(status_code=408, detail="Video generation timed out")

# Routes
@api_router.get("/")
async def root():
    return {"message": "Welcome to Nyxen Creative Stories", "developer": "S.M. Cantrell"}

@api_router.get("/health")
async def health():
    return {"status": "healthy", "service": "Nyxen Creative Stories", "version": "1.0.0"}

# Conversations
@api_router.post("/conversations", response_model=Conversation)
async def create_conversation(data: ConversationCreate):
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.now(timezone.utc).isoformat()
    conv_id = str(uuid.uuid4())
    cursor.execute(
        "INSERT INTO conversations (id, title, genre, mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
        (conv_id, data.title, data.genre, data.mode, now, now)
    )
    conn.commit()
    conn.close()
    return Conversation(id=conv_id, title=data.title, genre=data.genre, mode=data.mode, created_at=now, updated_at=now)

@api_router.get("/conversations", response_model=List[Conversation])
async def get_conversations():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM conversations ORDER BY updated_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [Conversation(id=r['id'], title=r['title'], genre=r['genre'], mode=r['mode'], created_at=r['created_at'], updated_at=r['updated_at']) for r in rows]

@api_router.get("/conversations/{conversation_id}", response_model=Conversation)
async def get_conversation(conversation_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM conversations WHERE id = ?", (conversation_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return Conversation(id=row['id'], title=row['title'], genre=row['genre'], mode=row['mode'], created_at=row['created_at'], updated_at=row['updated_at'])

@api_router.delete("/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM messages WHERE conversation_id = ?", (conversation_id,))
    cursor.execute("DELETE FROM conversations WHERE id = ?", (conversation_id,))
    conn.commit()
    conn.close()
    return {"success": True}

@api_router.get("/conversations/{conversation_id}/messages", response_model=List[Message])
async def get_messages(conversation_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC", (conversation_id,))
    rows = cursor.fetchall()
    conn.close()
    return [Message(id=r['id'], conversation_id=r['conversation_id'], role=r['role'], content=r['content'], created_at=r['created_at']) for r in rows]

# Chat
@api_router.post("/chat")
async def chat(data: ChatRequest):
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.now(timezone.utc).isoformat()
    if data.conversation_id:
        cursor.execute("SELECT * FROM conversations WHERE id = ?", (data.conversation_id,))
        conv = cursor.fetchone()
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")
        conversation_id = data.conversation_id
    else:
        conversation_id = str(uuid.uuid4())
        title = data.message[:50] + "..." if len(data.message) > 50 else data.message
        cursor.execute(
            "INSERT INTO conversations (id, title, genre, mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
            (conversation_id, title, data.genre, data.mode, now, now)
        )
    user_msg_id = str(uuid.uuid4())
    cursor.execute(
        "INSERT INTO messages (id, conversation_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)",
        (user_msg_id, conversation_id, "user", data.message, now)
    )
    cursor.execute(
        "SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY created_at ASC",
        (conversation_id,)
    )
    history = cursor.fetchall()
    messages = [{"role": "system", "content": NYXEN_SYSTEM_PROMPT + "\n\n" + get_genre_context(data.genre or "fantasy")}]
    for row in history:
        messages.append({"role": row['role'], "content": row['content']})
    try:
        ai_response = await call_groq_api(messages, data.mode)
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=str(e))
    ai_msg_id = str(uuid.uuid4())
    ai_now = datetime.now(timezone.utc).isoformat()
    cursor.execute(
        "INSERT INTO messages (id, conversation_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)",
        (ai_msg_id, conversation_id, "assistant", ai_response, ai_now)
    )
    cursor.execute("UPDATE conversations SET updated_at = ? WHERE id = ?", (ai_now, conversation_id))
    conn.commit()
    conn.close()
    return {
        "conversation_id": conversation_id,
        "message": Message(id=ai_msg_id, conversation_id=conversation_id, role="assistant", content=ai_response, created_at=ai_now)
    }

# Story Generation
@api_router.post("/story/generate")
async def generate_story(data: StoryGenerateRequest):
    genre_context = get_genre_context(data.genre)
    mode_instruction = "Write 800-1200 words." if data.mode == "deep" else "Write approximately 400 words."
    messages = [
        {"role": "system", "content": NYXEN_SYSTEM_PROMPT},
        {"role": "user", "content": f"Write a {data.genre} story based on this prompt. {mode_instruction}\n\nPrompt: {data.prompt}\n\nContext: {genre_context}"}
    ]
    try:
        story = await call_groq_api(messages, data.mode)
        return {"story": story, "genre": data.genre, "mode": data.mode}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Image Generation
@api_router.post("/image/generate")
async def generate_image(data: ImageGenerateRequest):
    try:
        enhanced_prompt = f"Cinematic, atmospheric, high quality illustration: {data.prompt}"
        image_url = await generate_image_apifree(enhanced_prompt)
        conn = get_db()
        cursor = conn.cursor()
        now = datetime.now(timezone.utc).isoformat()
        media_id = str(uuid.uuid4())
        cursor.execute(
            "INSERT INTO generated_media (id, type, prompt, url, status, conversation_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (media_id, "image", data.prompt, image_url, "success", data.conversation_id, now)
        )
        conn.commit()
        conn.close()
        return {"id": media_id, "url": image_url, "prompt": data.prompt}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# TTS
@api_router.post("/tts/generate")
async def generate_tts(data: TTSRequest):
    try:
        audio_url = await generate_tts_apifree(data.text, data.voice)
        return {"audio_url": audio_url, "voice": data.voice}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Video
@api_router.post("/video/generate")
async def generate_video(data: VideoGenerateRequest, background_tasks: BackgroundTasks):
    try:
        video_url = await generate_video_apifree(data.prompt, data.image_url)
        conn = get_db()
        cursor = conn.cursor()
        now = datetime.now(timezone.utc).isoformat()
        media_id = str(uuid.uuid4())
        cursor.execute(
            "INSERT INTO generated_media (id, type, prompt, url, status, conversation_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (media_id, "video", data.prompt, video_url, "success", data.conversation_id, now)
        )
        conn.commit()
        conn.close()
        return {"id": media_id, "url": video_url, "prompt": data.prompt}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Characters
@api_router.post("/characters", response_model=Character)
async def create_character(data: CharacterCreate):
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.now(timezone.utc).isoformat()
    char_id = str(uuid.uuid4())
    cursor.execute(
        """INSERT INTO characters (id, name, description, traits, backstory, relationships, speech_patterns, emotional_state, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (char_id, data.name, data.description, json.dumps(data.traits), data.backstory,
         json.dumps(data.relationships), data.speech_patterns, data.emotional_state, now, now)
    )
    conn.commit()
    conn.close()
    return Character(id=char_id, name=data.name, description=data.description or "", traits=data.traits or [],
                     backstory=data.backstory or "", relationships=data.relationships or {},
                     speech_patterns=data.speech_patterns or "", emotional_state=data.emotional_state or "neutral",
                     created_at=now, updated_at=now)

@api_router.get("/characters", response_model=List[Character])
async def get_characters():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM characters ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [Character(id=r['id'], name=r['name'], description=r['description'] or "",
                      traits=json.loads(r['traits']) if r['traits'] else [],
                      backstory=r['backstory'] or "", relationships=json.loads(r['relationships']) if r['relationships'] else {},
                      speech_patterns=r['speech_patterns'] or "", emotional_state=r['emotional_state'] or "neutral",
                      created_at=r['created_at'], updated_at=r['updated_at']) for r in rows]

@api_router.get("/characters/{character_id}", response_model=Character)
async def get_character(character_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM characters WHERE id = ?", (character_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Character not found")
    return Character(id=row['id'], name=row['name'], description=row['description'] or "",
                     traits=json.loads(row['traits']) if row['traits'] else [],
                     backstory=row['backstory'] or "", relationships=json.loads(row['relationships']) if row['relationships'] else {},
                     speech_patterns=row['speech_patterns'] or "", emotional_state=row['emotional_state'] or "neutral",
                     created_at=row['created_at'], updated_at=row['updated_at'])

@api_router.put("/characters/{character_id}", response_model=Character)
async def update_character(character_id: str, data: CharacterCreate):
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.now(timezone.utc).isoformat()
    cursor.execute(
        """UPDATE characters SET name=?, description=?, traits=?, backstory=?, relationships=?,
           speech_patterns=?, emotional_state=?, updated_at=? WHERE id=?""",
        (data.name, data.description, json.dumps(data.traits), data.backstory,
         json.dumps(data.relationships), data.speech_patterns, data.emotional_state, now, character_id)
    )
    conn.commit()
    conn.close()
    return await get_character(character_id)

@api_router.delete("/characters/{character_id}")
async def delete_character(character_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM characters WHERE id = ?", (character_id,))
    conn.commit()
    conn.close()
    return {"success": True}

# Story Settings
@api_router.post("/story-settings")
async def create_story_setting(data: StorySettingCreate):
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.now(timezone.utc).isoformat()
    setting_id = str(uuid.uuid4())
    cursor.execute(
        "INSERT INTO story_settings (id, name, type, description, details, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        (setting_id, data.name, data.type, data.description, json.dumps(data.details), now)
    )
    conn.commit()
    conn.close()
    return {"id": setting_id, "name": data.name, "type": data.type, "description": data.description, "details": data.details, "created_at": now}

@api_router.get("/story-settings")
async def get_story_settings():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM story_settings ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [{"id": r['id'], "name": r['name'], "type": r['type'], "description": r['description'],
             "details": json.loads(r['details']) if r['details'] else {}, "created_at": r['created_at']} for r in rows]

@api_router.delete("/story-settings/{setting_id}")
async def delete_story_setting(setting_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM story_settings WHERE id = ?", (setting_id,))
    conn.commit()
    conn.close()
    return {"success": True}

# Media Gallery
@api_router.get("/media")
async def get_media():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM generated_media WHERE status = 'success' ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [{"id": r['id'], "type": r['type'], "prompt": r['prompt'], "url": r['url'], "created_at": r['created_at']} for r in rows]

# App wiring
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
