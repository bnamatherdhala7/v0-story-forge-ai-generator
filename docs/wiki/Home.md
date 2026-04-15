# StoryForge AI — Wiki

**10 high-converting promotional videos from your real assets. Under 3 minutes.**

StoryForge is a multi-agent hook variation engine for course creators. It solves the **Hook Testing Deficit** — creators can't test which marketing angle works because producing even one video takes 3 hours. StoryForge generates all 10 variations automatically, using the creator's real photos and testimonials, not AI avatars.

---

## Pages

| Page | What's covered |
|---|---|
| [Architecture](Architecture) | 4-agent design, request flow, job store, n8n |
| [API Reference](API-Reference) | Endpoint schemas, field rules, response formats |
| [Roadmap](Roadmap) | v0.1 bugs, v0.2–v0.5 milestones, pricing evolution |

---

## The 4-agent pipeline

```
Creator uploads photos + course info
            ↓
Agent 1: Creative Director — selects best assets per hook
            ↓
Agent 2: Scriptwriter — writes 15s hook-optimized script
            ↓
Agent 3: Cinematographer — builds scene manifest
            ↓
Agent 4: Video Renderer (Creatomate) — renders .mp4
            ↓
10 downloadable videos, 9:16, 15 seconds each
```

---

## North star metrics

| Metric | Target |
|---|---|
| **Posted Video Rate (PVR)** | ≥ 60% of generated videos actually get posted |
| **Time-to-First-Video (TTFV)** | < 5 minutes, 95th percentile |
| **Hook Performance Variance** | ≥ 3× between top and bottom hook |

---

## Current status (v0.1)

The async pipeline works end-to-end. AI generates hook titles and 15-second scripts. Video rendering is placeholder — real `.mp4` output is the v0.3 milestone. The full 4-agent architecture is the v0.2 build target.

**5 bugs to fix before shipping to real users:**
1. `openai/gpt-5-mini` → `gpt-4o-mini`
2. `localhost:3000` hardcoded → `NEXT_PUBLIC_APP_URL`
3. `jobStore` in-memory → Upstash Redis
4. Only 2 scripts generated → all 10 hooks
5. Download buttons → real file URLs

See [Roadmap](Roadmap) for the full breakdown.

---

## Competitive position

| Competitor | Gap |
|---|---|
| Sora / RunwayML | AI-generated footage looks fake — erodes brand trust |
| Synthesia | AI avatar, not the creator's face |
| CapCut / manual | Still 3 hours/video, still one variation |
| ChatGPT | Can write scripts, can't render or handle assets |

**StoryForge:** Real creator assets + 10 hook variations + <3 minutes. No tool does all three.

---

## Quick links

- [README](https://github.com/bnamatherdhala7/v0-story-forge-ai-generator#readme) — setup and API reference
- [PRD](https://github.com/bnamatherdhala7/v0-story-forge-ai-generator/blob/main/PRD.md) — full product strategy
- [n8n workflow](https://github.com/bnamatherdhala7/v0-story-forge-ai-generator/blob/main/storyforge-workflow.json) — import into n8n
- [YouTube demo](https://www.youtube.com/watch?v=qet04CEO8Z4)
