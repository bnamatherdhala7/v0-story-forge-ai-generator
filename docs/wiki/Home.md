# StoryForge AI — Wiki

**Generate 5 short-form promotional videos for any course in minutes.**

StoryForge takes your course content and outputs 5 platform-ready marketing videos — one for each psychological hook type that drives short-form video engagement.

---

## Quick links

| Page | What's covered |
|---|---|
| [Architecture](Architecture) | System design, request flow, data model |
| [API Reference](API-Reference) | All endpoints, request/response schemas |
| [n8n Workflow](N8N-Workflow) | Workflow nodes, setup, extending |
| [Roadmap](Roadmap) | v0.1 → v0.5 plan and priorities |

---

## What StoryForge does

```
Creator inputs:
  course name + description + images + brand tone + brand color
                          ↓
StoryForge generates 5 videos:
  Pain Point  |  Transformation  |  Social Proof  |  Quick Win  |  Curiosity Gap
                          ↓
Each video has:
  Hook title · 15-second script · Thumbnail · Download link
```

---

## Current status (v0.1)

The pipeline is working end-to-end. The AI generates real scripts. Video thumbnails are placeholders — actual `.mp4` rendering is the v0.3 milestone.

**Working today:**
- Async job pipeline (submit → poll → results)
- AI script generation per hook type
- 3-screen UI (upload → processing → results)
- n8n workflow for validation and logging

**Known bugs before v0.2:**
- `openai/gpt-5-mini` → should be `gpt-4o-mini`
- `localhost:3000` hardcoded in production path
- `jobStore` is in-memory (lost on serverless cold start)
- Download buttons not wired up

See [Architecture](Architecture) for the full technical breakdown and [Roadmap](Roadmap) for what's coming.

---

## Setup in 5 minutes

```bash
git clone https://github.com/bnamatherdhala7/v0-story-forge-ai-generator.git
cd v0-story-forge-ai-generator
pnpm install
# Add OPENAI_API_KEY to .env.local
pnpm dev
```

Full setup: see [README](https://github.com/bnamatherdhala7/v0-story-forge-ai-generator#readme)
