# StoryForge AI — Product Requirements Document

**Version:** 0.2 (vision draft)
**Status:** Working prototype → building toward full agent architecture
**Last updated:** April 2026

---

## 0. The product bet in one paragraph

StoryForge bets that the biggest barrier to short-form video marketing for course creators is not creativity or even editing skill — it's the **Hook Testing Deficit**. A creator with a proven course needs to test 5–10 different angles to find which one resonates with their audience. Manually producing 10 variations costs 30 hours or $3,000 in editor fees. So creators never test. They post one version, it underperforms, and they conclude "short-form doesn't work for me." StoryForge generates all 10 variations from a single asset upload in under 3 minutes, using the creator's real photos and testimonials — not generic AI avatars. If the bet is right, the north star metric (Posted Video Rate ≥ 60%) will prove it: creators will actually use the output.

---

## 1. Problem

### 1.1 Who we're building for

Online course creators, coaches, and digital educators selling on Kajabi, Teachable, Gumroad, or their own sites. They post to Instagram, TikTok, and YouTube Shorts to drive course discovery and sales. They are not video production experts. Creating short-form promotional content is their biggest growth bottleneck — they know they need it, they find ways to avoid doing it.

**Market context:**
- 50M+ creators operate online courses or digital products (2025)
- Short-form video is the #1 driver of course discovery on social platforms
- Average creator spends 3–5 hours producing one polished short-form video
- Professional editors charge $100–$300 per clip
- 67% of creators cite "time to produce content" as their top growth barrier

### 1.2 The specific frustration — the Hook Testing Deficit

A course creator knows their content. They know their transformation story. They've heard the testimonials. But they don't know which *angle* will make someone stop scrolling.

Marketing research shows that the same product converts very differently depending on hook framing:
- Pain Point hook vs. Transformation hook: 2–5× engagement difference on the same product
- Which one wins depends on the audience, platform, and moment in the funnel

**The problem:** Discovering which hook works requires testing. Testing requires production. Production takes 3 hours per video. So creators test nothing, post one video, and give up.

This is the Hook Testing Deficit. StoryForge is the solution.

### 1.3 Why existing tools fail

| Tool | What it does | Why it fails |
|---|---|---|
| **Sora / Gen-2** | AI video generation from text | Generic, uncanny valley output — erodes brand trust |
| **Synthesia** | AI avatar presenter | Fake-looking presenter, not the creator's authentic face/voice |
| **CapCut** | Manual short-form editing | Still requires 3 hours per video; no hook variation |
| **Canva Video** | Template-based video creator | Templates look like templates; no AI script generation |
| **Opus Clip** | Repurposes long-form content | Requires existing long-form video to exist; no new creation |
| **ChatGPT** | Can write scripts | No asset handling, no rendering, no brand application |

**The gap:** No tool takes a creator's real assets (photos, testimonials, brand color) and outputs 10 hook-differentiated, brand-authentic short-form videos automatically.

---

## 2. Solution

### 2.1 Core concept: asset-orchestration-to-video

StoryForge is not a video generator in the Sora sense. It is an **asset orchestrator**. The raw material is always the creator's own photos, testimonials, and brand identity. StoryForge's job is to assemble those assets into 10 strategically differentiated videos, each optimized for a specific hook psychology.

**Authenticity is the core differentiator.** The videos look like the creator made them — because the creator's real assets are in them.

### 2.2 The 4-agent architecture

StoryForge replicates the logic of a professional creative team using 4 agents:

#### Agent 1 — Creative Director
- Analyzes the creator's goal (awareness / conversion / testimonial)
- Reviews the uploaded assets and selects which images/testimonials best communicate each hook's emotional tone
- Output: asset selection map → `{ hook_type: [image_ids], brand_feeling: string }`

#### Agent 2 — Scriptwriter
- Receives hook type + asset selection + brand tone
- Writes a 15-second script optimized for the hook's psychological mechanism
- Applies timing optimization: hook in first 2s, value in 3–10s, CTA in 11–15s
- Output: `{ hook_title: string, script: string, scene_timing: [] }`

#### Agent 3 — Cinematographer
- Receives script + scene timing + available images
- Matches each scene moment to the best image
- Determines visual transitions, text overlay placement, motion type (ken burns, static, zoom)
- Output: scene manifest → `{ scenes: [{ image_id, duration, text_overlay, transition }] }`

#### Agent 4 — Video Renderer (Creatomate / Shotstack)
- Receives the scene manifest
- Splices images, applies brand color overlays, text animations, background music
- Renders a 9:16 MP4 at 1080×1920
- Output: `.mp4` file URL

### 2.3 What each agent needs to be built

| Agent | Current state | What's needed |
|---|---|---|
| Creative Director | Not built | LLM call with asset metadata + goal → selection logic |
| Scriptwriter | Partially built (`generate-videos-ai`) | Expand to all 10 hooks; add timing structure |
| Cinematographer | Not built | Scene matching logic + transition selection |
| Video Renderer | Mock (placeholder URLs) | Creatomate or Shotstack API integration |

---

## 3. Target personas

### Persona 1 — The Course Creator (primary)
- 1–3 courses, 100–5,000 students
- Posts 3–4x/week to Instagram and TikTok to drive sales
- Has strong course content and some photos from their course or lifestyle
- **Job to be done:** Give me 10 promotional videos this week without touching a timeline
- **Quote:** "I know what to say. I just don't have time to make it look good."
- **Success:** "I posted 3 of the 10 videos. Two of them got more saves than anything I've ever posted."

### Persona 2 — The Cohort Coach (secondary)
- Runs recurring 6–12 week programs, 3–4 cohorts/year
- Needs fresh promotional content for each cohort launch
- Same course, same hooks, different creative angle each time
- **Job to be done:** Fresh promotional videos for my next cohort without starting from scratch
- **Quote:** "I reuse the same Canva template every time. My audience has seen it 6 times."

### Persona 3 — The Digital Product Seller (tertiary)
- Sells templates, guides, or tools on Gumroad
- No filming experience — prefers to stay off camera
- Needs image-based, text-driven promotional videos
- **Job to be done:** Promotional content that looks professional without me on camera

---

## 4. MVP scope

### v0.1 — Current state (script generator)

**Working:**
- 3-screen React UI: upload → processing → results
- Async job pipeline: POST → jobId → polling → completion
- AI script generation (OpenAI): hook title + 15-second script
- n8n workflow: validation and logging
- Progress animation with 4 phases
- 5 hook types in UI (Pain Point, Transformation, Social Proof, Behind-the-Scenes, Objection Handling)
- Fallback template scripts if AI fails

**Not working (known bugs):**

| Bug | Location | Fix |
|---|---|---|
| `openai/gpt-5-mini` model doesn't exist | `app/api/generate-videos-ai/route.ts:11` | `gpt-4o-mini` |
| `localhost:3000` hardcoded | `app/api/generate/route.ts:130,169,204` | `process.env.NEXT_PUBLIC_APP_URL` |
| `jobStore` in-memory → lost on cold start | `app/api/generate/route.ts:65` | Upstash Redis |
| Only 2 AI scripts generated, not 10 | `generate-videos-ai/route.ts` | Loop over all hook types |
| Download buttons call `alert()` | `storyforge-app.tsx:313,371` | Real file URLs |

**Out of scope for v0.1:**
- Real video rendering
- 4-agent architecture
- Voice narration
- Multi-platform formats
- User accounts or saved history

### v0.2 — Production-ready pipeline + full hook set

Fix all 5 bugs above. Implement all 10 hook variations. Add script download. Redis job store.

### v0.3 — Real video rendering

Creatomate or Shotstack integration. Scene manifest from Cinematographer Agent. Real `.mp4` output. Download all as ZIP.

---

## 5. North star metrics

| Metric | Target | Why this metric |
|---|---|---|
| **Posted Video Rate (PVR)** | ≥ 60% | If creators don't post it, it wasn't useful. This is the only metric that proves real value. |
| **Time-to-First-Video (TTFV)** | < 5 min (95th pct) | Slower than manual = not worth switching |
| **Hook Performance Variance** | ≥ 3× between top/bottom hook | Proves variation strategy. If all hooks perform the same, the product concept is wrong. |

### Secondary metrics
- D7 retention: > 40% (users return within a week)
- Batch completion rate: > 80% (users who start generation see it through)
- Hooks-to-post ratio: > 3 of 10 videos posted per batch

---

## 6. Technical architecture

### Current stack
- **Frontend:** Next.js 15 + React 18 + TypeScript, deployed on Vercel
- **Job system:** Async `processJobAsync` with in-memory `jobStore` (⚠ needs Redis)
- **AI:** Vercel AI SDK → OpenAI GPT-4o-mini
- **Orchestration:** n8n cloud (`bharat77.app.n8n.cloud`)
- **Video:** Placeholder URLs (no real rendering)

### Target stack (v0.3)
- **Job queue:** Upstash Redis (replaces in-memory store)
- **Agent runtime:** LangChain or direct multi-step LLM calls
- **Video rendering:** Creatomate API or Shotstack API
- **Asset storage:** Vercel Blob or AWS S3
- **Voice (v0.4):** ElevenLabs API

### Cost model

| Version | Per 10-video batch | At $47/month (10 batches) |
|---|---|---|
| v0.2 (scripts only) | ~$0.01 | ~$0.10 cost → 99% margin |
| v0.3 (rendered video) | ~$2–5 | ~$20–50 cost → 0–57% margin |
| v0.4 (video + narration) | ~$4–8 | ~$40–80 cost → 0% or loss |

**Pricing implication:** At v0.3+, $47/month with unlimited rendering is not viable. Move to per-batch credits or a higher subscription tier ($97–149/month) for unlimited at v0.4.

---

## 7. What v0.1 needs to validate

| Question | How to measure |
|---|---|
| Do creators find AI scripts usable as-is? | Post-generation survey: "Would you record/post this script?" > 60% yes |
| Which hooks drive the most downloads? | Track per-hook download rate in results screen |
| Is 15 seconds the right length? | Survey: "Is this the right length for your platform?" |
| Does async polling feel smooth? | Session recordings — bounce rate during processing screen |
| Is $47/month the right price? | Willingness-to-pay survey on free users after first generation |

---

## 8. Competitive positioning

### Versus Sora / RunwayML
**Their angle:** Generate video from text prompts.  
**Problem for creators:** Output looks AI-generated. Followers can tell. Brand trust erodes.  
**StoryForge angle:** Your real photos, your real testimonials, AI-orchestrated. Looks like you made it.

### Versus Synthesia
**Their angle:** AI presenter reads your script.  
**Problem for creators:** Generic avatar face. Inauthentic.  
**StoryForge angle:** No avatar. Your assets, your voice (v0.4), your brand.

### Versus CapCut / manual editing
**Their angle:** Professional templates, fast editing.  
**Problem for creators:** Still takes 1–2 hours. Still only produces 1 video per session.  
**StoryForge angle:** 10 variations, 3 minutes, zero editing.

### The unique position

> StoryForge is the only tool that generates **10 hook-differentiated videos** from a creator's **real assets** — not AI hallucinations — in **under 3 minutes**.

---

## 9. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Scripts feel generic despite AI generation | High | High | Richer prompt: include audience description, transformation outcome, existing testimonials |
| PVR stays below 30% — quality not good enough to post | Medium | Critical | Add "edit script" and "regenerate this hook" before v0.3 |
| Video rendering cost exceeds subscription revenue | Medium | High | Cap free tier at 5 videos; benchmark Creatomate vs Shotstack costs before committing |
| Creators want to be on camera (not image-based) | Medium | Medium | Add HeyGen API for talking-head mode in v0.5 |
| Canva or CapCut ships a similar feature | Medium | High | Speed and hook strategy depth are the moat; no template tool will ship multi-agent hook variation |
| `jobStore` memory loss causes stuck "processing" state | High | Medium | Replace with Redis before first real users |

---

## 10. Open questions

1. **10 hooks or let creators choose?** Currently the UI lets users select a hook type. The full vision generates all 10 automatically. Should v0.2 generate all 10 or keep the user-selection model?

2. **Images vs. talking head?** The current product is image-based. Many creators want to be on camera. Does adding talking-head mode (HeyGen API) dilute focus or expand TAM?

3. **Platform-specific optimization?** TikTok, Instagram Reels, and YouTube Shorts have different optimal lengths (7s, 15s, 30s) and caption styles. Should the Cinematographer Agent adapt output per platform?

4. **Hook performance analytics?** To prove the 3× variance north star metric, creators need to connect their social analytics. This requires platform API integrations (Instagram Graph API, TikTok API). When does this become necessary vs. a distraction?

5. **n8n vs. direct API?** The n8n workflow currently adds a network hop with no additional value. Should v0.2 bypass n8n entirely for the generation pipeline, and reserve n8n for logging, CRM triggers, and notification webhooks?
