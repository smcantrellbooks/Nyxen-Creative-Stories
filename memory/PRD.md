# Nyxen Creative Stories - PRD

## Project Overview
**Name**: Nyxen Creative Stories  
**Developer**: S.M. Cantrell  
**Type**: AI-powered creative writing assistant  
**Platform**: Vanilla HTML/CSS/JS monolith for Sitejet hosting  
**Source of truth**: `/app/nyxen-sitejet/index.html`

## Architecture
- **Frontend**: Single monolithic HTML file with inline CSS/JS
- **AI Chat/Story**: Groq API (`openai/gpt-oss-20b`)
- **Image Gen**: APIFree Flux (`black-forest-labs/flux-1-schnell`)
- **Text-to-Video**: APIFree LTX Video (`lightricks/ltx-video/text-to-video`)
- **Image-to-Video**: APIFree LTX Video (`lightricks/ltx-video/image-to-video`)
- **TTS**: APIFree Kokoro (`hexgrad/kokoro-tts/american-english`, voice: `af_heart`) + browser fallback
- **Auth & DB**: Supabase
- **Payments**: Stripe (already wired externally)
- **Chat Agent**: JotForm embedded iframe

## All Pages (10 total)
1. Creatives Assistant (JotForm, mode selector, project snapshot)
2. Story Workspace (AI chat, Act tabs, snippet shelf)
3. Drafting (AI guidance, suggest next, generate art, TTS, manuscript settings)
4. Edit Mode (context save, AI editing chat)
5. Publishing (blurb gen, focus project, snapshot)
6. Image Studio (APIFree Flux gen, gallery, filters, lightbox)
6b. Text-to-Video (APIFree LTX, download warning)
6c. Image-to-Video (APIFree LTX, image upload, download warning)
7. Membership / Storefront (3 tiers + points, Stripe)
8. Disclosures & Policies

## All Buttons Wired
- **Page 1**: Save Snapshot, Choose File, Import Pasted Text, Mode Cards (navigate to pages)
- **Page 2**: Send (Groq AI), Act I/II/III tabs, Snippet drop zone, Logout
- **Page 3**: Draft Guidance (Groq), Suggest Next (Groq), Generate Art (nav), Read Selected (Kokoro TTS), Manuscript Settings modal
- **Page 4**: Update Context (localStorage), Send (Groq), Clear Conversation
- **Page 5**: Focus Project dropdown, Ebook & Audiobook blurb (Groq), Web & Visual Script blurb (Groq)
- **Page 6**: Generate Images (APIFree, 5pts/image), Filter type/recency, Gallery lightbox + download
- **Page 6b**: Generate Text-to-Video (APIFree LTX, 10pts), Download
- **Page 6c**: Generate Image-to-Video (APIFree LTX, 10pts), Image upload, Download
- **Page 7**: Set Active (all 4 projects), Stripe buttons (pre-wired)
- **Page 8**: View Terms, View Privacy (window.open)
- **Side Panel**: Create conversation, Load conversation, Set Active project (syncs dropdowns)
- **Auth**: Login, Sign Up, Google OAuth, Logout, My Account

## Points System
- Story generation: free (Groq)
- Image generation: 5 points per image
- Video generation: 10 points per video
- TTS: free
- Points display syncs with Supabase profiles on login

## Data Persistence
- localStorage: active project, gallery, conversations, snapshot, edit context, manuscript settings, points
- Supabase: auth state, profile (tier/points)

## Remaining Backlog

### P2
- [ ] Full Supabase CRUD for projects/chapters/conversations (currently localStorage)
- [ ] Supabase Storage for manuscripts/images
- [ ] Final WAVE/axe accessibility audit for video pages

### P3
- [ ] Content safety enforcement
- [ ] Export to DOCX/PDF/EPUB
