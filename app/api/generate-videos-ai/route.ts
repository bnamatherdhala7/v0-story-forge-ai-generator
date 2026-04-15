import { generateText } from "ai"
import { type NextRequest, NextResponse } from "next/server"

const ALL_HOOKS = [
  "Pain Point",
  "Transformation",
  "Social Proof",
  "Behind-the-Scenes",
  "Objection Handling",
  "Curiosity Gap",
  "Quick Win",
  "Authority",
  "Urgency/Scarcity",
  "Story Hook",
]

const HOOK_COLORS = [
  "6366F1", "8B5CF6", "EC4899", "10B981", "F59E0B",
  "3B82F6", "EF4444", "14B8A6", "F97316", "7C3AED",
]

export async function POST(request: NextRequest) {
  try {
    const { courseName, description, brandTone } = await request.json()

    console.log("[v0] 🤖 Generating AI-powered video scripts for all 10 hooks")

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `You are a video script writer for short-form promotional content. Generate 10 unique video scripts, one per hook type.

Product/Course: ${courseName}
Description: ${description}
Brand Tone: ${brandTone}

Generate one script for each of these 10 hook types (in order):
1. Pain Point — activates recognition of a felt problem
2. Transformation — before/after identity arc
3. Social Proof — borrowed credibility from community
4. Behind-the-Scenes — authenticity and transparency
5. Objection Handling — pre-empts and dissolves resistance
6. Curiosity Gap — pattern interrupt + open loop
7. Quick Win — low barrier, immediate value
8. Authority — credentials + track record
9. Urgency/Scarcity — FOMO and timing pressure
10. Story Hook — narrative open loop

For each script:
- hookTitle: 5-10 word compelling title
- script: 50-80 words structured as hook (0-2s) → value (3-10s) → CTA (11-15s)

Return ONLY a JSON array of exactly 10 objects. Each object:
{ "hookType": string, "hookTitle": string, "script": string }

No markdown, no extra text.`,
      maxOutputTokens: 4000,
      temperature: 0.8,
    })

    // Parse the AI response
    const videos = JSON.parse(text)

    const formattedVideos = videos.map((video: any, index: number) => ({
      id: index + 1,
      hookType: video.hookType,
      hookTitle: video.hookTitle,
      videoUrl: "https://via.placeholder.com/1080x1920.mp4",
      thumbnailUrl: `https://via.placeholder.com/1080x1920/${HOOK_COLORS[index % HOOK_COLORS.length]}/FFFFFF?text=${encodeURIComponent(video.hookType)}`,
      duration: "15s",
      script: video.script,
    }))

    console.log("[v0] ✅ Generated", formattedVideos.length, "AI-powered videos")

    return NextResponse.json({
      status: "success",
      videos: formattedVideos,
    })
  } catch (error) {
    console.error("[v0] ❌ AI generation error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Failed to generate videos with AI",
      },
      { status: 500 },
    )
  }
}
