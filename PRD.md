# StoryForge AI — Product Requirements Document

**Version:** 0.1
**Status:** Working prototype
**Last updated:** April 2026

---

## 0. The product bet in one paragraph

StoryForge bets that the biggest barrier to short-form video marketing for course creators is not creativity — it's production time. A creator who knows their course inside out can describe it in a paragraph, but turning that paragraph into 5 platform-ready promotional videos takes hours of scripting, recording, editing, and formatting. If an AI can take course content and output 5 hook-differentiated videos automatically, creators get a week's worth of social content in minutes. That's the bet.

---

## 1. Problem

### 1.1 Who we're building for

Online course creators, coaches, and digital educators who sell on Kajabi, Teachable, Gumroad, or their own websites. They post promotional content to Instagram, TikTok, and YouTube Shorts to drive course sales. They understand their content deeply but are not video production experts. Creating short-form promo videos is a bottleneck — they know they need it, they avoid doing it.

**Market context:**
- 50M+ creators operate online courses or digital products (2025)
- Short-form video is the #1 driver of course discovery on social platforms
- Average creator spends 3–5 hours producing a single polished short-form video
- 67% of creators cite "time to produce content" as their top growth barrier

### 1.2 The specific frustration

A course creator has a 6-week program they've taught 50 times. They know exactly who it's for and what transformation it delivers. But every time they need to promote it, they face:

1. Write a script from scratch (or stare at a blank page)
2. Record on camera or find a hook image
3. Edit in CapCut or Premiere for 30–60 minutes
4. Format for 3 different aspect ratios
5. Repeat for each hook type (social proof, pain point, etc.)

They already know their course. The tools don't.

**StoryForge fixes this:** the course description you've already written becomes 5 hook-differentiated videos automatically.

### 1.3 The hook types and why they matter

Short-form video marketing research identifies 5 hooks that consistently drive engagement:

| Hook | Psychology | When to use |
|---|---|---|
| **Pain Point** | Opens with the audience's frustration | Top of funnel — cold traffic |
| **Transformation** | Before/after story arc | Retargeting — aware audience |
| **Social Proof** | Numbers and testimonials | Consideration — warm traffic |
| **Quick Win** | Low barrier to entry | Launch — new offer |
| **Curiosity Gap** | Pattern interrupt | Broad reach — scroll-stopping |

Manually writing and producing all 5 takes a full day. StoryForge generates all 5 in under 2 minutes.

---

## 2. Solution

### 2.1 What StoryForge does

1. Creator enters: course name, description, 1–8 images, brand tone, brand color
2. StoryForge dispatches an async job to the AI pipeline (n8n + OpenAI)
3. AI generates a 15-second script for each of the 5 hook types, tailored to the course
4. Creator reviews scripts, watches placeholder video previews, downloads

### 2.2 Architecture (current v0.1)

```
Frontend (Next.js, 3-screen flow)
    ↓
POST /api/generate → creates jobId, fires async job
    ↓
processJobAsync()
    ├─ Calls n8n workflow (validation + logging)
    └─ Calls /api/generate-videos-ai (OpenAI GPT scripts)
    ↓
Browser polls GET /api/status/{jobId} every 3 seconds
    ↓
Results screen: 5 video cards with hook type, title, script, thumbnail
```

### 2.3 What "videos" means today vs. the target state

**Today (v0.1):**
- AI generates a hook title + 15-second script per video
- Placeholder thumbnail images shown (no real pixel rendering)
- Video URL is a placeholder `.mp4` link
- Value delivered: 5 complete scripts tailored to the course

**Target (v0.3):**
- Remotion renders the script over the uploaded images as a 9:16 video
- ElevenLabs narrates the script in the brand's voice
- Real `.mp4` files downloadable and platform-ready

The v0.1 script output is genuinely useful — a creator can take the 5 scripts and record themselves or hand to a video editor. The rendering step (v0.3) removes even that remaining friction.

---

## 3. Target personas

### Persona 1 — The Course Creator (primary)
- Has 1–5 courses on Kajabi/Teachable
- Posts 3–4x/week to Instagram and TikTok to drive sales
- Knows their content well; hates video production
- **Job to be done:** Turn my course description into social content I can post today
- **Quote:** "I know what to say. I just don't have time to make it look good."

### Persona 2 — The Cohort Coach (secondary)
- Runs recurring 6-week programs
- Needs new promotional content each cohort
- Same course, same hooks, different creative angle each time
- **Job to be done:** Fresh promotional videos for my next cohort without starting from scratch

### Persona 3 — The Digital Product Seller (tertiary)
- Sells templates, guides, or tools on Gumroad
- No filming experience — wants text + image-based videos
- **Job to be done:** Promotional videos that don't require me on camera

---

## 4. v0.1 scope — what's built

### Built and working
- 3-screen React UI: upload form → processing → results
- Input: course name, description, 1–8 images, hook type, brand tone, brand color
- Async job system: POST returns jobId immediately; browser polls for status
- n8n workflow pipeline: webhook → validation → response (mock videos)
- AI script generation: OpenAI GPT → hook title + 15-second script
- Progress phases: 4-step animation (Analyzing → Writing → Planning → Generating)
- Fallback: template scripts if AI generation fails
- Results: 5 video cards with script, thumbnail, hook type badge

### Known bugs to fix before v0.2
| Bug | Location | Fix |
|---|---|---|
| `openai/gpt-5-mini` model doesn't exist | `generate-videos-ai/route.ts:11` | Change to `gpt-4o-mini` |
| `localhost:3000` hardcoded | `generate/route.ts:130,169,204` | Replace with `process.env.NEXT_PUBLIC_APP_URL` |
| `jobStore` in-memory — lost on serverless cold start | `generate/route.ts:65` | Replace with Upstash Redis |
| n8n returns BigBuckBunny placeholder | `storyforge-workflow.json` | Real video URLs or Remotion render |
| Download button calls `alert()` | `storyforge-app.tsx:313,371` | Wire to real file download |

### Out of scope for v0.1
- Real video rendering (requires Remotion or external video API)
- Voice narration
- Multi-platform aspect ratio export
- User accounts or saved projects
- Payment / subscription
- Mobile app

---

## 5. What v0.1 needs to validate

| Question | How to measure |
|---|---|
| Do creators find the AI scripts usable as-is? | Post-generation survey: "Would you use this script?" > 60% yes |
| Is 5 hooks the right number? | Which hooks get downloaded most? Any consistently ignored? |
| Is the description input sufficient to generate relevant scripts? | Script relevance rating 1–5 by 20 test creators |
| Does async polling UX feel smooth enough? | Session recordings — do users wait or abandon during processing? |
| Is GPT the right model for short-form video scripts? | Compare GPT-4o-mini vs Claude Haiku on 10 sample courses |

---

## 6. Technical architecture

### Stack
- **Frontend:** Next.js 15 + React 18 + TypeScript
- **Styling:** Tailwind CSS + Radix UI components
- **AI:** Vercel AI SDK → OpenAI GPT (script generation)
- **Workflow:** n8n (cloud at `bharat77.app.n8n.cloud`)
- **Job state:** In-memory `jobStore` (⚠ needs Redis for production)
- **Deployment:** Vercel (auto-deploy from GitHub)

### Request flow
```
1. User submits form
2. POST /api/generate
   → validates (courseName, description, images, hookType, brandTone)
   → generates jobId
   → calls processJobAsync() without await
   → returns { jobId, status: "processing" }

3. processJobAsync() runs in background
   → updates jobStore progress every 3s
   → fires n8n webhook (async, no blocking)
   → after 8s: calls /api/generate-videos-ai
   → stores videos in jobStore on completion

4. Browser polls GET /api/status/{jobId} every 3s
   → "processing" → update progress bar
   → "completed" → show results screen
   → "error" → show error with retry button

5. /api/generate-videos-ai
   → calls OpenAI with course context
   → returns 2 AI scripts (⚠ currently hardcoded to 2, should be 5)
   → fallback: generateFallbackVideos() returns template scripts
```

### Cost model (at scale)

| Task | Model | Est. cost per generation |
|---|---|---|
| Script generation (5 hooks) | GPT-4o-mini | ~$0.003 |
| n8n workflow execution | — | ~$0.001 (cloud plan) |
| Video rendering (v0.3) | Remotion / Runway | ~$0.10–$0.50/video |

**At $29/month subscription:** 20–50 generations/month = $0.06–$0.15 in AI costs. Strong margins pre-rendering. Video rendering at v0.3 changes the unit economics significantly.

---

## 7. Roadmap

### v0.1 — Script generator (now)
Async pipeline working. AI generates scripts. Placeholder video previews.
Fix the 4 production bugs before shipping to real users.

### v0.2 — Production-ready script generator
- Fix: Redis job store (Upstash), correct model, env URL
- Fix: AI generates all 5 hook types (not 2)
- Add: `.env.example` and setup documentation
- Add: Real script download as `.txt` or `.pdf`
- Add: User feedback on scripts ("regenerate this one")

### v0.3 — Real video rendering
- Remotion: render script + images + brand color into a 9:16 MP4
- Scenes: hook title card → image montage → CTA
- Duration: 15 seconds per video
- Output: downloadable `.mp4` for each hook type

### v0.4 — Voice narration
- ElevenLabs: auto-narrate the generated script
- Creator selects voice tone (warm, authoritative, energetic)
- Audio synced to rendered video

### v0.5 — Multi-platform export
- 9:16 (TikTok, Instagram Reels, YouTube Shorts)
- 1:1 (Instagram feed)
- 16:9 (YouTube intro, LinkedIn)
- Platform-specific caption overlays

---

## 8. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Scripts feel generic, not course-specific | Medium | High | Richer prompt with course description + target audience + transformation outcome |
| `jobStore` memory loss causes phantom "processing" state | High | High | Replace with Redis before first real user |
| Real video rendering cost exceeds subscription price | Medium | High | Benchmark Remotion vs Runway vs HeyGen costs before v0.3 |
| OpenAI rate limits during high concurrency | Low | Medium | Queue jobs with exponential backoff |
| Users want to be on camera (not text-based) | Low | Medium | Add "talking head" mode in v0.4 with HeyGen avatar API |

---

## 9. Open questions

1. **How many hooks per run?** Currently the UI selects one hook type but the results show 5 (all types). Should users choose their hook type or always get all 5?

2. **Script length:** 15 seconds = ~50–70 words. Is that enough for course creators to communicate value, or should we offer 30s and 60s options?

3. **Image usage:** Currently images are uploaded but not actually used in the script generation prompt. Should the AI see the images and reference them in scripts?

4. **Pricing:** $29/month flat vs. per-generation credits. At <$0.01 AI cost per run, flat subscription is cleaner. Usage-based only makes sense post-video rendering when costs are $0.50–$2.50 per generation.

5. **n8n vs. direct API:** The n8n workflow currently adds latency without adding value (mock output). Should v0.2 bypass n8n entirely and go direct to AI, or invest in making the n8n workflow do real work?
