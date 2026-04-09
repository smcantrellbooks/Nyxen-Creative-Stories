# Nyxen Creative Stories - PRD

## Project Overview
**Name**: Nyxen Creative Stories
**Developer**: S.M. Cantrell
**Type**: AI-powered creative writing assistant for authors and storytellers
**Platform**: Vanilla HTML/CSS/JS monolith for Sitejet hosting
**Source of truth**: `/app/nyxen-sitejet/index.html`

## Architecture
- **Frontend**: Single monolithic HTML file with inline CSS and JS
- **AI Chat/Story**: Groq API (`openai/gpt-oss-20b`)
- **Image Generation**: APIFree (Flux `black-forest-labs/flux-1-schnell`)
- **Auth & DB**: Supabase
- **Payments**: Stripe (checkout already wired externally)
- **Chat Agent**: JotForm embedded iframe

## What's Been Implemented (Feb 2026)

### UI / Layout
- All 8 pages with Gold/Purple dark theme
- ADA compliance (skip links, ARIA, focus indicators, reduced motion)
- Sticky side panel with Conversations/Projects tabs + Auth block
- Responsive breakpoints (1024px, 768px)

### Auth
- Supabase Auth (Login/Sign Up/Google OAuth/Logout) in Side Panel
- Profile fetch for tier/points display in top bar

### All Buttons Wired (Pages 1-8 + Side Panel)
- **Page 1 (Creatives Assistant)**: Save Snapshot, Choose File, Import Pasted Text, Ask Anything Send
- **Page 2 (Story Workspace)**: Story Chat Send (Groq AI), Act I/II/III tabs, Snippet drop zone, Account links
- **Page 3 (Drafting)**: Draft Guidance (Groq), Suggest Next Chapter (Groq), Generate Art (nav to Image Studio), Read Selected (speechSynthesis), Manuscript Package Settings modal
- **Page 4 (Edit Mode)**: Update Context (localStorage), Send chat (Groq), Clear Conversation
- **Page 5 (Publishing)**: Focus Project dropdown (updates snapshot), Ebook & Audiobook blurb (Groq), Web & Visual Script blurb (Groq)
- **Page 6 (Image Studio)**: Generate Images (APIFree Flux), Filter by type/recency, Gallery with lightbox + download
- **Page 7 (Membership)**: Set Active (all 4 projects), Stripe buttons (already wired)
- **Page 8 (Disclosures)**: View Terms, View Privacy (window.open)
- **Side Panel**: Create conversation, Load conversation, Set Active project (syncs all dropdowns)

### Data Persistence
- localStorage: active project, gallery, conversations, snapshot, edit context, manuscript settings
- Supabase: auth state, profile (tier/points)

## API Keys in Use
- Groq: `gsk_WJTk...` (model: `openai/gpt-oss-20b`)
- APIFree: `sk-peDA...` (Flux image generation)
- Supabase URL + Anon Key

## Remaining / Backlog

### P1
- [ ] TTS via APIFree Kokoro (currently using browser speechSynthesis as fallback)
- [ ] Text-to-Video via APIFree LTX Video
- [ ] Image-to-Video via APIFree LTX Video
- [ ] Video generation UI with "Videos are not saved" warning
- [ ] Points deduction enforcement (currently generates freely)

### P2
- [ ] Full Supabase CRUD for projects/chapters/conversations (currently localStorage)
- [ ] Supabase Storage for manuscripts/images
- [ ] Chapter management CRUD (Act I/II/III content panels)
- [ ] Final WAVE/axe accessibility audit

### P3
- [ ] Content safety enforcement on Groq requests
- [ ] Export stories to DOCX/PDF/EPUB
