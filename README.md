# StoryForge AI ✦

**10 high-converting promotional videos from your real assets — in under 3 minutes.**

StoryForge is a multi-agent hook variation engine for course creators. It takes your photos, testimonials, and brand assets and produces 10 strategically differentiated short-form videos, each built on a proven marketing hook psychology. No avatars. No stock footage. No generic AI output.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/nama7vijay-6218s-projects/v0-story-forge-ai-generator-ed)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/o5w8damtO7P)

---

## The problem in one sentence

Course creators spend months building products but only 3 hours per week on promotion — because making one good video takes 3 hours.

**The content bottleneck isn't creativity. It's production time.**

Manual editing: ~3 hours per video  
Professional editor: $100–$300 per clip  
Existing AI tools (Sora, Synthesia): generic avatars that erode brand trust

StoryForge solves the **Hook Testing Deficit** — creators can't test which hook resonates because producing even one variation is a full production effort.

---

## How it works

```
Your assets (photos, testimonials, brand color, tone)
                    ↓
        ┌───────────────────────┐
        │   Creative Director   │  Selects best assets for each hook
        │        Agent          │  based on brand feeling + goal
        └───────────┬───────────┘
                    ↓
        ┌───────────────────────┐
        │    Scriptwriter       │  Writes hook-optimized 15s script
        │        Agent          │  per variation using timing psychology
        └───────────┬───────────┘
                    ↓
        ┌───────────────────────┐
        │   Cinematographer     │  Matches assets to scenes,
        │        Agent          │  sequences for max retention
        └───────────┬───────────┘
                    ↓
        ┌───────────────────────┐
        │    Video Renderer     │  Splices assets, applies brand
        │    (Creatomate /      │  overlays + music → .mp4
        │     Shotstack)        │
        └───────────────────────┘
                    ↓
     10 platform-ready .mp4 files — 9:16, 15 seconds each
```

---

## The 10 hook variations

| Hook | Psychology | Opening line approach |
|---|---|---|
| **Pain Point** | Activates recognition of a felt problem | "Struggling with productivity?" |
| **Transformation** | Before/after identity arc | "I went from burnt out to 10x focused" |
| **Social Proof** | Borrowed credibility | "200 students landed their dream job…" |
| **Behind-the-Scenes** | Authenticity and trust | "Here's what actually happens inside…" |
| **Objection Handling** | Pre-empts resistance | "You're probably thinking this won't work for you" |
| **Curiosity Gap** | Pattern interrupt | "There's one thing stopping most creators" |
| **Quick Win** | Low barrier, immediate value | "You can apply this in the next 10 minutes" |
| **Authority** | Credentials + track record | "After coaching 500+ creators…" |
| **Urgency/Scarcity** | FOMO and timing | "Last cohort, 3 spots left" |
| **Story Hook** | Narrative open loop | "Three years ago I was $40k in debt and…" |

---

## North star metrics

| Metric | Target | Why it matters |
|---|---|---|
| **Posted Video Rate (PVR)** | ≥ 60% | % of generated videos creators actually post — the real quality signal |
| **Time-to-First-Video (TTFV)** | < 5 min (95th percentile) | If it's slower than manual, it's not a tool |
| **Hook Performance Variance** | ≥ 3× between top and bottom hook | Proves variation strategy has real value |

---

## Business model

| Tier | Price | Limit | Target user |
|---|---|---|---|
| **Free** | $0 | 5 videos | Proof of value |
| **Creator** | $47/month | Unlimited | Full-time course creator |

**Unit economics (v0.3 with real rendering):**  
AI + rendering cost per 10-video batch: ~$2–5  
At $47/month, 5 batches/month = $10–25 in costs → 47–79% gross margin

---

## Setup

```bash
git clone https://github.com/bnamatherdhala7/v0-story-forge-ai-generator.git
cd v0-story-forge-ai-generator
pnpm install
cp .env.example .env.local
# Add: OPENAI_API_KEY, CREATOMATE_API_KEY (v0.3), N8N_WEBHOOK_URL
pnpm dev
# http://localhost:3000
```

---

## Current status (v0.1)

The async pipeline is working. The AI generates hook titles and 15-second scripts. Video rendering is placeholder (no real `.mp4` output yet). The 4-agent architecture is the v0.2 build target.

**Known issues to fix before v0.2:**

| Bug | File | Fix |
|---|---|---|
| `openai/gpt-5-mini` doesn't exist | `app/api/generate-videos-ai/route.ts:11` | Change to `gpt-4o-mini` |
| `localhost:3000` hardcoded | `app/api/generate/route.ts:130,169,204` | Use `NEXT_PUBLIC_APP_URL` env var |
| `jobStore` in-memory only | `app/api/generate/route.ts:65` | Replace with Upstash Redis |
| Only 2 AI scripts generated | `generate-videos-ai/route.ts` | Generate all 10 hook variations |
| Download buttons are `alert()` | `storyforge-app.tsx:313,371` | Wire to real file URLs |

---

## Roadmap

| Version | Focus |
|---|---|
| **v0.1** (now) | Async pipeline + AI script generation. Placeholder video rendering. |
| **v0.2** | 4-agent architecture. All 10 hooks. Fix production bugs. Real script downloads. |
| **v0.3** | Creatomate/Shotstack rendering → real `.mp4` files with brand overlays + music. |
| **v0.4** | Voice narration via ElevenLabs. Creator voice cloning. |
| **v0.5** | Multi-format export: 9:16 / 1:1 / 16:9. Hook performance analytics. |

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 + React 18 + TypeScript |
| Styling | Tailwind CSS + Radix UI |
| AI (scripts) | OpenAI GPT-4o-mini via Vercel AI SDK |
| Workflow orchestration | n8n |
| Video rendering (v0.3) | Creatomate or Shotstack API |
| Job queue | Upstash Redis (needed for v0.2) |
| Deployment | Vercel |

---

## Docs

- [PRD.md](PRD.md) — full product requirements, agent design, metrics
- [docs/wiki/Architecture.md](docs/wiki/Architecture.md) — system design and request flow
- [docs/wiki/API-Reference.md](docs/wiki/API-Reference.md) — endpoint schemas
- [docs/wiki/Roadmap.md](docs/wiki/Roadmap.md) — detailed milestone plan
- [storyforge-workflow.json](storyforge-workflow.json) — n8n workflow export
- [YouTube demo](https://www.youtube.com/watch?v=qet04CEO8Z4)
