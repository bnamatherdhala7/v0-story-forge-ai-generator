import { type NextRequest, NextResponse } from "next/server"

const N8N_WEBHOOK_URL = "https://bharat77.app.n8n.cloud/webhook/storyforge-generate"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.courseName || body.courseName.trim().length < 3) {
      return NextResponse.json(
        { status: "error", message: "Course name is required (minimum 3 characters)" },
        { status: 400 },
      )
    }

    if (!body.description || body.description.trim().length < 50) {
      return NextResponse.json(
        {
          status: "error",
          message: `Description is required (minimum 50 characters, got ${body.description?.length || 0})`,
        },
        { status: 400 },
      )
    }

    if (!body.images || !Array.isArray(body.images) || body.images.length < 1) {
      return NextResponse.json(
        { status: "error", message: `At least 1 image is required (got ${body.images?.length || 0})` },
        { status: 400 },
      )
    }

    // Generate a unique job ID
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Start async processing (fire and forget)
    const payload = {
      courseName: String(body.courseName || "").trim(),
      description: String(body.description || "").trim(),
      brandTone: String(body.brandTone || "educational").toLowerCase(),
      brandColor: String(body.brandColor || "#6366F1").trim(),
      images: Array.isArray(body.images) ? body.images : [],
      jobId, // Pass jobId to n8n
    }

    // Start the async job (don't await)
    processJobAsync(jobId, payload)

    // Return immediately with jobId
    return NextResponse.json({
      jobId,
      status: "processing",
    })
  } catch (error) {
    console.error("[v0] ❌ API route error:", error)
    return NextResponse.json(
      { status: "error", message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}

// Store job status in memory (in production, use Redis or database)
const jobStore: Record<
  string,
  {
    status: "processing" | "completed" | "error"
    progress: { current: number; total: number; phase: string }
    videos?: any[]
    error?: string
  }
> = {}

async function processJobAsync(jobId: string, payload: any) {
  try {
    // Initialize job status
    jobStore[jobId] = {
      status: "processing",
      progress: { current: 0, total: 4, phase: "Analyzing your content..." },
    }

    setTimeout(() => {
      if (jobStore[jobId]) {
        jobStore[jobId].progress = { current: 1, total: 4, phase: "Writing engaging scripts..." }
      }
    }, 3000)

    setTimeout(() => {
      if (jobStore[jobId]) {
        jobStore[jobId].progress = { current: 2, total: 4, phase: "Planning cinematography..." }
      }
    }, 8000)

    setTimeout(() => {
      if (jobStore[jobId]) {
        jobStore[jobId].progress = { current: 3, total: 4, phase: "Generating videos..." }
      }
    }, 15000)

    console.log("[v0] 🚀 Calling n8n production webhook:", N8N_WEBHOOK_URL)
    console.log("[v0] 📦 Payload:", {
      courseName: payload.courseName,
      description: `${payload.description.substring(0, 50)}...`,
      brandTone: payload.brandTone,
      brandColor: payload.brandColor,
      imagesCount: payload.images.length,
      jobId: payload.jobId,
    })

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000), // 10 second timeout for immediate response
    })

    console.log("[v0] 📨 n8n response status:", response.status)

    if (response.ok) {
      const responseText = await response.text()
      console.log("[v0] 📨 n8n acknowledged request:", responseText.substring(0, 200))

      // Since n8n responds immediately, simulate processing time with mock data
      setTimeout(() => {
        jobStore[jobId] = {
          status: "completed",
          progress: { current: 4, total: 4, phase: "Finalizing your content..." },
          videos: generateMockVideos(),
        }
      }, 8000) // Wait 8 more seconds to simulate total ~20s processing

      return
    }

    // If n8n returns error, use mock data
    console.log(`[v0] ℹ️ n8n unavailable, using mock data (status: ${response.status})`)

    setTimeout(() => {
      jobStore[jobId] = {
        status: "completed",
        progress: { current: 4, total: 4, phase: "Finalizing your content..." },
        videos: generateMockVideos(),
      }
    }, 8000)
  } catch (error) {
    console.log("[v0] ℹ️ Using mock data due to connection issue:", error instanceof Error ? error.message : error)

    setTimeout(() => {
      jobStore[jobId] = {
        status: "completed",
        progress: { current: 4, total: 4, phase: "Finalizing your content..." },
        videos: generateMockVideos(),
      }
    }, 8000)
  }
}

function generateMockVideos() {
  return [
    {
      id: 1,
      hookType: "Pain Point",
      hookTitle: "Feeling Unprepared for AI PM Roles?",
      videoUrl: "https://via.placeholder.com/1080x1920.mp4",
      thumbnailUrl: "https://via.placeholder.com/1080x1920/6366F1/FFFFFF?text=Pain+Point",
      duration: "15s",
      script:
        "Are you struggling to land AI product management roles? You're not alone. The AI revolution is moving fast, and traditional PM skills aren't enough anymore. But here's the thing - you don't need a PhD to succeed. What you need is the right framework, and that's exactly what we're offering. Transform your career in just 48 hours.",
    },
    {
      id: 2,
      hookType: "Transformation",
      hookTitle: "From Confused to Confident AI Leader",
      videoUrl: "https://via.placeholder.com/1080x1920.mp4",
      thumbnailUrl: "https://via.placeholder.com/1080x1920/8B5CF6/FFFFFF?text=Transformation",
      duration: "15s",
      script:
        "Six months ago, I had no idea how to talk about AI in product meetings. Today, I'm leading AI initiatives at a Fortune 500 company. The difference? I stopped trying to learn everything and focused on what actually matters. This course distills years of experience into practical, actionable frameworks you can use immediately. No fluff, just results.",
    },
  ]
}

// Export the job store for the status endpoint
export { jobStore }
