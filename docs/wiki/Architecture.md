# Architecture

## System overview

StoryForge uses a 4-agent pipeline to replicate the logic of a professional creative team:

```
┌──────────────────────────────────────────────────────────────┐
│  Frontend (Next.js)                                          │
│  3 screens: upload form → processing → results               │
└─────────────────────────┬────────────────────────────────────┘
                          │ POST /api/generate
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  /api/generate (Next.js serverless)                          │
│  Validates → creates jobId → fires processJobAsync()         │
│  Returns { jobId } immediately                               │
└──────────────┬───────────────────────────────────────────────┘
               │ async (no await)
               ▼
┌──────────────────────────────────────────────────────────────┐
│  processJobAsync()                                           │
│                                                              │
│  Agent 1: Creative Director                                  │
│    Selects best assets per hook type                         │
│              ↓                                               │
│  Agent 2: Scriptwriter                                       │
│    Writes 15s script per hook with timing structure          │
│              ↓                                               │
│  Agent 3: Cinematographer                                    │
│    Builds scene manifest: image → scene → overlay → timing   │
│              ↓                                               │
│  Agent 4: Video Renderer (Creatomate / Shotstack)            │
│    Renders scene manifest → .mp4 with brand + music          │
└──────────────┬───────────────────────────────────────────────┘
               │ status updates
               ▼
┌──────────────────────────────────────────────────────────────┐
│  Redis (Upstash) — job state store                           │
│  { status, progress, videos }                                │
└──────────────┬───────────────────────────────────────────────┘
               │ GET /api/status/{jobId} every 3s
               ▼
┌──────────────────────────────────────────────────────────────┐
│  Browser — results screen                                    │
│  10 video cards with scripts, thumbnails, download links     │
└──────────────────────────────────────────────────────────────┘
```

---

## The 4 agents

### Agent 1 — Creative Director

**Responsibility:** Analyze the creator's goal and uploaded assets. Select which images and testimonials best communicate each hook type's emotional tone.

**Input:**
```json
{
  "goal": "awareness | conversion | testimonial",
  "assets": ["image_1.jpg", "testimonial_screenshot.png", ...],
  "brandTone": "educational | inspiring | relatable",
  "hookType": "Pain Point"
}
```

**Output:**
```json
{
  "hook_type": "Pain Point",
  "selected_assets": ["image_2.jpg", "image_5.jpg"],
  "brand_feeling": "relatable struggle with hopeful resolution",
  "asset_rationale": "image_2 shows frustration; image_5 shows the transformation moment"
}
```

**Current state:** Not yet implemented. v0.2 priority.

---

### Agent 2 — Scriptwriter

**Responsibility:** Write a 15-second script optimized for the hook's psychological mechanism. Structure: hook (0–2s) → value (3–10s) → CTA (11–15s).

**Input:**
```json
{
  "hook_type": "Pain Point",
  "course_name": "AI PM Bootcamp",
  "description": "...",
  "brand_tone": "educational",
  "selected_assets": [...],
  "brand_feeling": "..."
}
```

**Output:**
```json
{
  "hook_title": "Struggling to Land AI PM Roles?",
  "script": "Are you applying to AI PM roles and hearing nothing back? You're not alone...",
  "scene_timing": [
    { "second": 0, "text": "Struggling to land AI PM roles?", "type": "hook" },
    { "second": 3, "text": "You're not alone. Here's what changed for me...", "type": "value" },
    { "second": 12, "text": "Join 200+ PMs who made the switch →", "type": "cta" }
  ]
}
```

**Current state:** Partially built (`/api/generate-videos-ai`). Generates 2 scripts. Needs: all 10 hooks, timing structure, asset context in prompt.

---

### Agent 3 — Cinematographer

**Responsibility:** Match each scene moment from the Scriptwriter's timing structure to the best available image. Determine visual transitions, text overlay placement, and motion type.

**Input:**
```json
{
  "scene_timing": [...],
  "available_assets": ["image_1.jpg", "image_2.jpg"],
  "brand_color": "#6366F1",
  "duration": 15
}
```

**Output (scene manifest):**
```json
{
  "scenes": [
    {
      "image": "image_2.jpg",
      "start_second": 0,
      "end_second": 3,
      "text_overlay": "Struggling to land AI PM roles?",
      "text_position": "center",
      "motion": "ken_burns_in",
      "transition": "fade"
    }
  ],
  "background_music": "upbeat_hopeful_low",
  "brand_color": "#6366F1"
}
```

**Current state:** Not yet implemented. v0.2 priority.

---

### Agent 4 — Video Renderer

**Responsibility:** Take the Cinematographer's scene manifest and render a real `.mp4` file. Applies brand color overlays, text animations, and background music.

**Integration options:**

| Service | Approach | Cost/video | Latency |
|---|---|---|---|
| [Creatomate](https://creatomate.com) | JSON template → rendered video | ~$0.05–0.20 | 10–30s |
| [Shotstack](https://shotstack.io) | JSON timeline → rendered video | ~$0.05–0.15 | 15–45s |
| [Remotion](https://remotion.dev) | React component → rendered video | Infrastructure cost | 30–120s |

**Current state:** Returns placeholder URLs. v0.3 priority.

---

## Current file structure

```
v0-story-forge-ai-generator/
├── app/
│   ├── api/
│   │   ├── generate/route.ts          ← job creation + processJobAsync
│   │   ├── generate-videos-ai/route.ts ← OpenAI script generation (partial Scriptwriter)
│   │   └── status/[jobId]/route.ts    ← job polling
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── storyforge-app.tsx             ← full 3-screen UI (~780 lines)
│   └── ui/                            ← Radix UI components
├── storyforge-workflow.json           ← n8n workflow export
├── PRD.md
└── README.md
```

---

## Job store — current issue and fix

**Current (broken in production):**
```typescript
// app/api/generate/route.ts
const jobStore: Record<string, JobState> = {}  // in-memory, per-instance
```
Vercel serverless can spin up a new instance for each poll request. The `jobStore` on the new instance is empty → `GET /api/status/{jobId}` returns 404.

**Fix — Upstash Redis:**
```typescript
import { Redis } from "@upstash/redis"
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Write
await redis.set(`job:${jobId}`, JSON.stringify(jobState), { ex: 3600 })

// Read
const job = await redis.get(`job:${jobId}`)
```

---

## n8n workflow

The `storyforge-workflow.json` defines a 4-node linear pipeline. In v0.1 it validates and logs the request. In v0.3 it will trigger the Creatomate render job.

```
Webhook → Validate Input → Generate Mock Videos → Respond to Webhook
```

**v0.3 target:**
```
Webhook → Validate Input → Trigger Creatomate Render → Poll Render Status → Respond with .mp4 URLs
```
