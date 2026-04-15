# StoryForge AI ✦

**Generate 5 short-form promotional videos for your course in minutes.**

StoryForge takes your course content — name, description, images, brand tone — and generates 5 videos with different psychological hooks (Pain Point, Transformation, Social Proof, Quick Win, Curiosity Gap). Built for online course creators, coaches, and digital product sellers.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/nama7vijay-6218s-projects/v0-story-forge-ai-generator-ed)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/o5w8damtO7P)

---

## What it does

| Step | What happens |
|---|---|
| **1. Upload** | Add 1–8 course images, enter name, description, hook type, brand tone, brand color |
| **2. Process** | Job dispatched to n8n + AI script generation (~8 seconds) |
| **3. Results** | 5 videos with AI-written scripts, thumbnails, and download links |

**The 5 hook types generated:**

| Hook | Purpose |
|---|---|
| Pain Point | Opens with the problem the audience feels |
| Transformation | Before/after story arc |
| Social Proof | Numbers, testimonials, community size |
| Quick Win | "You can do this in 48 hours" |
| Curiosity Gap | "There's a secret the top 1% know…" |

---

## Architecture

```
Browser (Next.js)
    ↓  POST /api/generate
    ↓  returns { jobId } immediately

/api/generate (Next.js API route)
    ├─ Validates input
    ├─ Creates jobId
    ├─ Calls n8n webhook (fire and forget)
    └─ Starts processJobAsync() — 8s async timer

processJobAsync()
    ├─ Phase 1 (0s):  "Analyzing your content..."
    ├─ Phase 2 (3s):  "Writing engaging scripts..."
    ├─ Phase 3 (8s):  "Planning cinematography..."
    └─ Phase 4 (15s): Calls /api/generate-videos-ai → GPT script generation
                      Falls back to template scripts if AI fails

/api/generate-videos-ai
    └─ OpenAI GPT → generates hook title + 15s script for each video

/api/status/[jobId]
    └─ Returns current job state from in-memory jobStore

n8n workflow (bharat77.app.n8n.cloud)
    Webhook → Validate → Generate Mock Videos → Respond
```

**Browser polls `/api/status/{jobId}` every 3 seconds until `completed` or `error`.**

---

## Setup

### Prerequisites
- Node.js 18+
- pnpm (`npm install -g pnpm`)
- OpenAI API key
- n8n instance (optional — app falls back to direct AI generation if n8n is unavailable)

### Local development

```bash
# 1. Clone
git clone https://github.com/bnamatherdhala7/v0-story-forge-ai-generator.git
cd v0-story-forge-ai-generator

# 2. Install dependencies
pnpm install

# 3. Set environment variables
cp .env.example .env.local
# Add your OpenAI API key to .env.local:
# OPENAI_API_KEY=sk-...

# 4. Run
pnpm dev
# Opens at http://localhost:3000
```

### n8n workflow setup (optional)

Import `storyforge-workflow.json` into your n8n instance:
1. Open n8n → Workflows → Import
2. Upload `storyforge-workflow.json`
3. Activate the workflow
4. Update `N8N_WEBHOOK_URL` in `app/api/generate/route.ts` with your instance URL

---

## API reference

### `POST /api/generate`
Start a video generation job.

**Request body:**
```json
{
  "courseName": "AI Product Management Bootcamp",
  "description": "A 48-hour intensive for PMs who want...",
  "hookType": "pain-point",
  "brandTone": "educational",
  "brandColor": "#6366F1",
  "images": ["data:image/jpeg;base64,..."]
}
```

**Field rules:**
| Field | Required | Validation |
|---|---|---|
| `courseName` | Yes | min 3 characters |
| `description` | Yes | min 50 characters |
| `images` | Yes | array, 1–8 items, max 10MB each |
| `hookType` | Yes | `pain-point` / `transformation` / `social-proof` / `behind-the-scenes` / `objection-handling` |
| `brandTone` | Yes | `educational` / `inspiring` / `relatable` |
| `brandColor` | No | hex string, default `#6366F1` |

**Response:**
```json
{ "jobId": "job_1713200000_abc123", "status": "processing" }
```

---

### `GET /api/status/{jobId}`
Poll for job completion.

**Response (processing):**
```json
{
  "status": "processing",
  "progress": { "current": 2, "total": 4, "phase": "Writing engaging scripts..." }
}
```

**Response (completed):**
```json
{
  "status": "completed",
  "progress": { "current": 4, "total": 4, "phase": "Finalizing your content..." },
  "videos": [
    {
      "id": 1,
      "hookType": "Pain Point",
      "hookTitle": "Struggling to Land AI PM Roles?",
      "videoUrl": "https://...",
      "thumbnailUrl": "https://...",
      "duration": "15s",
      "script": "Are you struggling to..."
    }
  ]
}
```

---

### `POST /api/generate-videos-ai`
Internal — called by `/api/generate`. Generates AI scripts via OpenAI.

**Request:** `{ courseName, description, hookType, brandTone }`  
**Response:** `{ status: "success", videos: [...] }`

---

## n8n workflow

The `storyforge-workflow.json` file defines a 4-node workflow:

```
Webhook (POST /storyforge-generate)
    ↓
Validate Input (JS code node)
  — courseName min 3 chars
  — description min 200 chars
  — images array 5–8 items
  — brandTone: Educational | Inspiring | Relatable
    ↓
Generate Mock Videos (JS code node)
  — Returns 5 placeholder videos with hook types
    ↓
Respond to Webhook (JSON response + CORS headers)
```

> **Current state:** The "Generate Mock Videos" node returns placeholder videos. Real video rendering (Remotion, Runway, or similar) is the v0.2 work.

---

## Known limitations

| Issue | Impact | Fix needed |
|---|---|---|
| `jobStore` is in-memory | Jobs lost between Vercel serverless invocations — polling will return 404 | Replace with Redis or Upstash |
| `openai/gpt-5-mini` model doesn't exist | AI generation always falls back to template scripts | Change to `gpt-4o-mini` |
| `localhost:3000` hardcoded in `processJobAsync` | AI generation fails in production | Replace with `process.env.NEXT_PUBLIC_APP_URL` |
| n8n returns mock placeholder `.mp4` links | No real video files generated | Integrate Remotion / Runway / ElevenLabs |
| Download buttons not implemented | `alert()` called instead of real download | Wire to actual video file URLs |

---

## Roadmap

| Version | Focus |
|---|---|
| v0.1 (now) | Script generation + n8n pipeline + async job polling |
| v0.2 | Fix production bugs (Redis job store, correct model, env URL) + real script output |
| v0.3 | Real video rendering — Remotion for template-based video generation from scripts + images |
| v0.4 | Voice narration via ElevenLabs — auto-narrate generated scripts |
| v0.5 | Multi-platform export — 9:16 (TikTok/Reels), 1:1 (Instagram), 16:9 (YouTube) |

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 + React 18 + TypeScript |
| Styling | Tailwind CSS + Radix UI |
| AI (scripts) | OpenAI GPT via Vercel AI SDK |
| Workflow | n8n (self-hosted or cloud) |
| Deployment | Vercel |
| Forms | React Hook Form + Zod |

---

## Related

- [PRD.md](PRD.md) — full product requirements and strategy
- [storyforge-workflow.json](storyforge-workflow.json) — n8n workflow export
- [v0.app project](https://v0.app/chat/o5w8damtO7P) — visual builder
- [YouTube demo](https://www.youtube.com/watch?v=qet04CEO8Z4)
