# Roadmap

---

## v0.1 — Script generator (current)

**Status:** Working. Async pipeline functional. AI generates scripts. No real video rendering.

**Delivered:**
- 3-screen UI (upload → processing → results)
- Async job pipeline with 3-second polling
- AI hook titles + 15-second scripts via OpenAI
- n8n workflow for validation + logging
- 5 hook types in UI

**Must fix before v0.2:**

| # | Bug | File:Line | Fix |
|---|---|---|---|
| 1 | `openai/gpt-5-mini` doesn't exist | `generate-videos-ai/route.ts:11` | `gpt-4o-mini` |
| 2 | `localhost:3000` hardcoded | `generate/route.ts:130,169,204` | `process.env.NEXT_PUBLIC_APP_URL` |
| 3 | `jobStore` in-memory | `generate/route.ts:65` | Upstash Redis |
| 4 | Only 2 scripts generated, not 10 | `generate-videos-ai/route.ts` | Loop all 10 hooks |
| 5 | Download = `alert()` | `storyforge-app.tsx:313,371` | Real download URLs |

---

## v0.2 — Production pipeline + full agent architecture

**Goal:** All 10 hooks. Working in production. Real script downloads. 4-agent design implemented.

**Engineering:**
- [ ] Fix all 5 v0.1 bugs
- [ ] Creative Director Agent: asset selection logic per hook
- [ ] Scriptwriter Agent: all 10 hooks, timing structure, scene breakdown
- [ ] Cinematographer Agent: scene manifest builder
- [ ] Redis job store (Upstash)
- [ ] Script download as `.txt` / `.pdf`
- [ ] "Regenerate this hook" button per video card
- [ ] `.env.example` with all required keys

**10 hook types for v0.2:**

| Hook | Psychological mechanism |
|---|---|
| Pain Point | Activates recognition of a felt problem |
| Transformation | Before/after identity arc |
| Social Proof | Borrowed credibility from community |
| Behind-the-Scenes | Authenticity and transparency |
| Objection Handling | Pre-empts and dissolves resistance |
| Curiosity Gap | Pattern interrupt + open loop |
| Quick Win | Low barrier, immediate value |
| Authority | Credentials + track record |
| Urgency/Scarcity | FOMO and timing pressure |
| Story Hook | Narrative open loop |

---

## v0.3 — Real video rendering

**Goal:** Creator gets 10 downloadable `.mp4` files, 9:16, 15 seconds each.

**Integration decision: Creatomate vs. Shotstack**

| | Creatomate | Shotstack |
|---|---|---|
| JSON template format | Yes | Yes |
| Image + text overlay | Yes | Yes |
| Background music | Yes | Yes |
| Cost per render | ~$0.05–0.20 | ~$0.05–0.15 |
| Latency | 10–30s | 15–45s |
| Free tier | 10 renders | 20 renders |

Recommendation: Start with Creatomate. Switch if cost becomes a concern at scale.

**What the Cinematographer Agent outputs (scene manifest):**
```json
{
  "scenes": [
    { "image": "img_2.jpg", "start": 0, "end": 3, "text": "Hook line here", "motion": "ken_burns_in" },
    { "image": "img_5.jpg", "start": 3, "end": 10, "text": "Value statement", "motion": "static" },
    { "image": "img_1.jpg", "start": 10, "end": 15, "text": "CTA here →", "motion": "zoom_out" }
  ],
  "brand_color": "#6366F1",
  "music": "upbeat_hopeful_low",
  "format": "9:16"
}
```

**n8n workflow update for v0.3:**
```
Webhook → Validate → Trigger Creatomate Render → Poll Status → Return .mp4 URLs
```

---

## v0.4 — Voice narration

**Goal:** Videos with auto-narrated scripts. Creator doesn't need to record anything.

- [ ] ElevenLabs API integration
- [ ] Voice selection UI: warm / authoritative / energetic
- [ ] Voice preview (5s sample before full generation)
- [ ] Optional: creator records 30s of their voice → ElevenLabs clones it
- [ ] Audio synced to scene timing from Cinematographer Agent

**Cost impact:** ElevenLabs adds ~$0.05–0.15/video. Adjust pricing at v0.4.

---

## v0.5 — Multi-format export + analytics

**Goal:** One generation → downloads for every platform. Hook performance data closes the loop.

**Multi-format:**

| Format | Platform | Dimensions |
|---|---|---|
| 9:16 | TikTok, Instagram Reels, YouTube Shorts | 1080×1920 |
| 1:1 | Instagram feed, LinkedIn | 1080×1080 |
| 16:9 | YouTube pre-roll, LinkedIn video | 1920×1080 |
| 4:5 | Instagram feed (recommended ratio) | 1080×1350 |

**Hook performance analytics:**
- Connect Instagram Graph API + TikTok API
- Track views, saves, shares per posted video
- Surface which hooks perform best for each creator
- Feed back into Creative Director Agent: "your Pain Point hooks get 4× the saves of Social Proof"

**North star metric target — Hook Performance Variance ≥ 3×:**
This requires analytics integration to prove. Without it, we can't verify the core product bet.

---

## Pricing evolution

| Version | What's delivered | Recommended pricing |
|---|---|---|
| v0.1–v0.2 | Scripts only | Free (beta) |
| v0.3 | Real .mp4 videos | $47/month — 20 batches |
| v0.4 | Video + narration | $79/month — 20 batches |
| v0.5 | All formats + analytics | $129/month unlimited |

**At v0.3:** AI + rendering = ~$1–2 per 10-video batch. 20 batches/month = ~$20–40 costs vs $47 revenue → ~15–57% margin. Viable.

**At v0.4:** Add ~$0.50–1.50/batch narration = $30–55 costs for 20 batches. $47/month is breakeven. Must move to $79+.
