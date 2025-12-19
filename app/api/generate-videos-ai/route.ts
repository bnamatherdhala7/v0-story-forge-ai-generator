import { generateText } from "ai"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { courseName, description, hookType, brandTone } = await request.json()

    console.log("[v0] 🤖 Generating AI-powered video scripts")

    const { text } = await generateText({
      model: "openai/gpt-5-mini",
      prompt: `You are a video script writer for promotional content. Generate 2 unique video scripts for a ${brandTone} promotional video.

Product/Course: ${courseName}
Description: ${description}
Hook Type to focus on: ${hookType}
Brand Tone: ${brandTone}

For each video, create:
1. A compelling hook title (5-10 words)
2. A 15-second video script (50-80 words) that captures attention and drives action
3. Use the specified hook type as the primary approach

Format your response as a JSON array with exactly 2 videos. Each video should have:
- hookType: string (use the provided hook type)
- hookTitle: string (compelling title)
- script: string (the 15-second video script)

Example format:
[
  {
    "hookType": "Pain Point",
    "hookTitle": "Struggling to Grow Your Business?",
    "script": "Your script here..."
  },
  {
    "hookType": "Pain Point", 
    "hookTitle": "Another compelling title",
    "script": "Another script here..."
  }
]

Important: Return ONLY the JSON array, no additional text or markdown formatting.`,
      maxOutputTokens: 1500,
      temperature: 0.8,
    })

    // Parse the AI response
    const videos = JSON.parse(text)

    // Add IDs, URLs, and other metadata
    const formattedVideos = videos.map((video: any, index: number) => ({
      id: index + 1,
      hookType: video.hookType,
      hookTitle: video.hookTitle,
      videoUrl: "https://via.placeholder.com/1080x1920.mp4",
      thumbnailUrl: `https://via.placeholder.com/1080x1920/${index === 0 ? "6366F1" : "8B5CF6"}/FFFFFF?text=${encodeURIComponent(video.hookType)}`,
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
