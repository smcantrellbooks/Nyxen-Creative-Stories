# Nyxen Creative Stories - PRD

## Project Overview
**Name**: Nyxen Creative Stories  
**Developer**: S.M. Cantrell  
**Type**: AI-powered creative writing assistant  
**Platform**: Vanilla HTML/CSS/JS monolith for Sitejet  
**Source**: `/app/nyxen-sitejet/index.html`

## Architecture
- Single monolithic HTML file (inline CSS/JS)
- Groq API (`openai/gpt-oss-20b`) for AI text
- APIFree Flux for image generation
- APIFree LTX Video for text-to-video and image-to-video
- APIFree Kokoro TTS with browser fallback
- Supabase Auth + DB (conversations, gallery, snapshots, profiles)
- Stripe (externally wired)
- JotForm embedded iframe
- jsPDF for PDF export

## All 10 Pages
1. Creatives Assistant (JotForm, mode selector, snapshot)
2. Story Workspace (AI chat, Act tabs, snippets)
3. Drafting (AI guidance, suggest next, art, TTS, export, manuscript settings)
4. Edit Mode (context, AI editing chat)
5. Publishing (blurb gen, focus project)
6. Image Studio (Flux gen, gallery, filters, lightbox)
6b. Text-to-Video (LTX Video, download warning)
6c. Image-to-Video (LTX Video, image upload, download warning)
7. Membership / Storefront (Stripe)
8. Disclosures & Policies

## Completed Features
- All buttons wired across 10 pages (28+ core functions)
- Supabase Auth (email/password + Google OAuth)
- Supabase CRUD sync (conversations, gallery, snapshots) with localStorage fallback
- Points system (5/image, 10/video) synced to Supabase + localStorage
- Content safety filter on all generation prompts
- PDF and TXT export from Drafting page
- Kokoro TTS via APIFree with browser speechSynthesis fallback
- Full ADA accessibility (ARIA roles, labels, live regions, focus management)
- Video pages with "not saved" warnings

## Supabase Setup Required
User must run `/app/nyxen-sitejet/supabase-schema.sql` in Supabase SQL Editor to create:
- `conversations` table
- `gallery` table
- `snapshots` table
- RLS policies

## No remaining P0/P1/P2/P3 tasks — all implemented.
