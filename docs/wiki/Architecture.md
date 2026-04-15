# Architecture

## System overview

StoryForge has three layers:

```
┌─────────────────────────────────────┐
│  Frontend (Next.js)                 │
│  storyforge-app.tsx — 3 screens     │
│  upload → processing → results      │
└──────────────┬──────────────────────┘
               │ POST /api/generate
               ▼
┌─────────────────────────────────────┐
│  API Routes (Next.js serverless)    │
│  /api/generate      — create job    │
│  /api/status/[id]   — poll status   │
│  /api/generate-videos-ai — scripts  │
└──────┬──────────────────────────────┘
       │ fire-and-forget POST
       ▼
┌─────────────────────────────────────┐
│  n8n Workflow                       │
│  bharat77.app.n8n.cloud             │
│  Validate → Generate → Respond      │
└─────────────────────────────────────┘
```

---

## Request lifecycle

```
1.  User submits form
        ↓
2.  POST /api/generate
    - Validates: courseName, description, images, hookType, brandTone
    - Generates jobId = "job_{timestamp}_{random}"
    - Stores job in jobStore: { status: "processing", progress: {...} }
    - Calls processJobAsync(jobId, payload) — no await
    - Returns: { jobId, status: "processing" }
        ↓
3.  Browser polls GET /api/status/{jobId} every 3 seconds
        ↓
4.  processJobAsync() runs in background
    ├─ t=0s:  progress → "Analyzing your content..."
    ├─ t=3s:  progress → "Writing engaging scripts..."
    ├─ t=8s:  progress → "Planning cinematography..."
    ├─ t=8s:  fires POST to n8n webhook (non-blocking)
    └─ t=8s:  calls /api/generate-videos-ai (OpenAI)
              └─ on success: stores videos in jobStore
              └─ on fail:    stores fallback template scripts
        ↓
5.  Browser receives { status: "completed", videos: [...] }
    → renders results screen
```

---

## File structure

```
v0-story-forge-ai-generator/
├── app/
│   ├── api/
│   │   ├── generate/
│   │   │   └── route.ts          ← main job endpoint + processJobAsync
│   │   ├── generate-videos-ai/
│   │   │   └── route.ts          ← OpenAI script generation
│   │   └── status/
│   │       └── [jobId]/
│   │           └── route.ts      ← job status polling
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── storyforge-app.tsx         ← entire frontend (3 screens, ~780 lines)
│   └── ui/                        ← Radix UI components
├── lib/
│   └── utils.ts
├── storyforge-workflow.json       ← n8n workflow export
├── PRD.md
└── README.md
```

---

## State management

The frontend uses React `useState` with three screens:

| State | Type | Values |
|---|---|---|
| `screen` | string | `upload` / `processing` / `results` |
| `processingStatus` | string | `idle` / `processing` / `completed` / `error` |
| `jobId` | string \| null | job ID from `/api/generate` |
| `progress` | object | `{ current, total, phase }` |
| `videos` | array | completed video objects |
| `uploadedImages` | string[] | base64 data URIs |
| `lastSubmittedData` | object | saved for "Generate More" re-use |

---

## Job store

Jobs are stored in an in-memory object in `app/api/generate/route.ts`:

```typescript
const jobStore: Record<string, {
  status: "processing" | "completed" | "error"
  progress: { current: number; total: number; phase: string }
  videos?: Video[]
  error?: string
}> = {}
```

**⚠ Production issue:** In Vercel serverless, each invocation may get a fresh instance. `jobStore` will be empty on cold starts, causing polling to return 404.

**Fix:** Replace with [Upstash Redis](https://upstash.com):
```typescript
import { Redis } from "@upstash/redis"
const redis = new Redis({ url: process.env.UPSTASH_URL, token: process.env.UPSTASH_TOKEN })
await redis.set(jobId, jobData, { ex: 3600 })
```

---

## n8n workflow nodes

| Node | Type | Purpose |
|---|---|---|
| Webhook | `n8n-nodes-base.webhook` | Receives POST at `/storyforge-generate` |
| Validate Input | `n8n-nodes-base.code` | JS validation of all fields |
| Generate Mock Videos | `n8n-nodes-base.code` | Returns 5 placeholder video objects |
| Respond to Webhook | `n8n-nodes-base.respondToWebhook` | Returns JSON + CORS headers |

The n8n workflow receives the full payload including images. Currently it validates and returns mock videos. In v0.3 this node will trigger real video rendering.

---

## OpenAI integration

`/api/generate-videos-ai` uses the Vercel AI SDK:

```typescript
import { generateText } from "ai"

const { text } = await generateText({
  model: "openai/gpt-5-mini",  // ⚠ wrong — change to "gpt-4o-mini"
  prompt: `Generate 2 video scripts for ${courseName}...`,
  maxOutputTokens: 1500,
  temperature: 0.8,
})
```

The prompt asks for 2 scripts as a JSON array. The system fallback (`generateFallbackVideos`) activates if this call fails.

**Note:** Currently only 2 scripts are generated per AI call. The results screen shows up to 5 videos — the remaining 3 come from the fallback mock data in `storyforge-app.tsx`.
