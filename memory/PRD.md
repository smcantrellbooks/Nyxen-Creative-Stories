# Nyxen Creative Stories - PRD

## Project Overview
**Name**: Nyxen Creative Stories
**Developer**: S.M. Cantrell
**Type**: AI-powered creative writing assistant for authors and storytellers
**Platform**: Vanilla HTML/CSS/JS monolith for Sitejet hosting

## Original Problem Statement
Build a full-stack AI creative writing app with 8 pages, JotForm chat agent, Gold/Purple dark theme, ADA compliance, Stripe pricing tiers, and Supabase for authentication and database.

**CRITICAL**: Frontend MUST be vanilla HTML/CSS/JS only. No React, no Next.js. Output must be ready to upload directly to Sitejet.

## Architecture
- **Frontend**: Single monolithic HTML file (`nyxen-full.html`) with inline CSS and JS
- **Backend**: External Vercel deployment for Stripe webhooks/APIs
- **Auth & DB**: Supabase (external)
- **AI Services**: Groq, APIFree (Flux, Kokoro, LTX Video)
- **Chat**: JotForm embedded iframe

## Core File
- `/app/frontend/public/nyxen-full.html` — Single source of truth

## 8 Pages Implemented
1. Creatives Assistant (JotForm chat, mode selector, project snapshot)
2. Story Generation Workspace (chapters, scenes, snippets)
3. Drafting & Chapter Creation (mentor, art generator, progress tracker)
4. Edit Mode (project context, editing priorities, readiness check)
5. Publishing Strategist (blurb generator, series positioning, author roster)
6. Image Studio (text-to-image, gallery)
7. Membership / Storefront (3 tiers: Free $0, Pro $5, Premium $10 + A La Carte points)
8. Disclosures & Policies (AI usage, visual creations, publication, terms, privacy)

## External Services
- Supabase URL: `https://recyyhvdvuupxhbxmzal.supabase.co`
- Vercel API: `https://smcantrellbooks-cantrell-creatives-9bpwd3k9e.vercel.app`
- JotForm Agent: `019d3d3c3a537add8379214c3060726a324e`

## DB Schema (Supabase)
- `profiles`: `{id, tier, points}`

## What's Been Implemented

### Completed (Feb 2026)
- All 8 pages with vanilla HTML/CSS/JS
- Gold/Purple "Jewel & Luxury" dark theme (CSS variables)
- ADA compliance (skip links, ARIA labels/roles, focus indicators, reduced motion)
- JotForm chat agent embedded
- Supabase Auth integration (Login/Sign Up/Logout in side panel)
- Dynamic tier/points display from Supabase `profiles` table
- Side panel with Conversations/Projects tabs + Auth block
- Sticky side panel with proper flex layout
- Fixed HTML tag nesting issues (unclosed section tags)

### Bug Fixes Applied
- Fixed page-drafting `<section>` closed with `</div>` instead of `</section>`
- Fixed page-membership `<section>` closed with `</div>` instead of `</section>`
- Fixed side panel flex layout (min-width:0 on main-content, flex-shrink:0 + sticky on side-panel)

## Prioritized Backlog

### P1 - Important
- [ ] Connect Stripe checkout buttons on Membership page to Vercel API endpoints
- [ ] Wire AI generation features to Groq/APIFree APIs (story, image, video)

### P2 - Nice to Have
- [ ] Final WAVE/axe accessibility audit for Auth block
- [ ] Real conversation persistence via Supabase
- [ ] Project management CRUD via Supabase
- [ ] TTS playback for story narration
- [ ] Export stories to PDF/EPUB

## Next Tasks
1. Wire Stripe checkout to Vercel endpoints for membership subscriptions
2. Implement AI generation via Groq for story/chat features
3. Final accessibility audit
