# Nyxen AI Storyteller - PRD

## Project Overview
**Name**: Nyxen
**Developer**: S.M. Cantrell
**Type**: AI Storyteller & Creative Companion Platform

## Original Problem Statement
Build a sophisticated AI Storyteller and Creative Companion platform with:
- AI-powered chat and story generation (Groq API)
- Image generation (APIFree Flux)
- TTS voice generation (Kokoro)
- Video generation (LTX-Video)
- Story Bible for character/world management
- NO MongoDB - use SQLite instead

## Architecture
- **Frontend**: React + Tailwind CSS + Shadcn UI
- **Backend**: FastAPI + SQLite
- **AI Services**: 
  - Groq (openai/gpt-oss-20b) for chat/stories
  - APIFree Flux for images
  - APIFree Kokoro for TTS
  - APIFree LTX-Video for videos

## Core Requirements (Static)
1. ✅ Chat interface with AI storytelling
2. ✅ Story generator with Deep/Fast modes
3. ✅ Genre selection (Fantasy, Romance, Thriller, Sci-Fi)
4. ✅ Story Bible (characters, world-building)
5. ✅ Media Gallery (images, videos)
6. ✅ Nyxen personality per specifications
7. ✅ Anti-repetition rules in AI output
8. ✅ Scene-specific writing styles

## User Personas
1. **Writers**: Need help overcoming writer's block, developing ideas
2. **Storytellers**: Want original stories across genres
3. **Worldbuilders**: Track characters, settings, timelines
4. **Visual Creators**: Generate images/videos for stories

## What's Been Implemented (Jan 2026)
- ✅ Full chat interface with Groq AI integration
- ✅ Story generator with Deep/Fast modes
- ✅ Genre cards with visual selection
- ✅ Story Bible with character CRUD
- ✅ World-building settings management
- ✅ Media gallery with image generation
- ✅ Video generation support
- ✅ Elegant Jewel & Luxury dark theme
- ✅ Playfair Display + Outfit typography
- ✅ Glass morphism UI elements
- ✅ SQLite database (no MongoDB)
- ✅ All API integrations working

## Prioritized Backlog

### P0 - Critical (Done)
- ✅ Core chat functionality
- ✅ AI integration
- ✅ Basic CRUD operations

### P1 - Important
- [ ] TTS playback for story narration
- [ ] Export stories to PDF/EPUB
- [ ] User accounts and authentication
- [ ] Story version history

### P2 - Nice to Have
- [ ] Character relationship graph
- [ ] Timeline visualization
- [ ] Collaborative writing
- [ ] Custom voice selection for TTS
- [ ] Image-to-video conversion
- [ ] Story sharing/publishing

## Next Tasks
1. Add TTS playback UI with audio controls
2. Implement story export functionality
3. Add user authentication if needed
4. Build character relationship visualization
5. Add story versioning/history
