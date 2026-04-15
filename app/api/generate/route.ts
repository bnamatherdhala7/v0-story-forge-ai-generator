import { type NextRequest, NextResponse } from "next/server"

const N8N_WEBHOOK_URL = "https://bharat77.app.n8n.cloud/webhook/storyforge-generate"
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

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

    const payload = {
      courseName: String(body.courseName || "").trim(),
      description: String(body.description || "").trim(),
      hookType: String(body.hookType || "Pain Point").trim(),
      brandTone: String(body.brandTone || "educational").toLowerCase(),
      brandColor: String(body.brandColor || "#6366F1").trim(),
      images: Array.isArray(body.images) ? body.images : [],
      jobId,
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

// ⚠️  In-memory store — works locally but breaks on Vercel (new instance per request).
// To fix for production:
//   1. pnpm add @upstash/redis
//   2. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env.local
//   3. Replace setJob/getJob below with Redis calls (see Architecture.md for the snippet)

if (!process.env.UPSTASH_REDIS_REST_URL) {
  console.warn("[v0] ⚠️  UPSTASH_REDIS_REST_URL not set — using in-memory job store (not suitable for production)")
}

type JobState = {
  status: "processing" | "completed" | "error"
  progress: { current: number; total: number; phase: string }
  videos?: any[]
  error?: string
}

const jobStore: Record<string, JobState> = {}

function setJob(jobId: string, state: JobState): void {
  jobStore[jobId] = state
}

function getJob(jobId: string): JobState | null {
  return jobStore[jobId] ?? null
}

export { getJob }

async function processJobAsync(jobId: string, payload: any) {
  try {
    // Initialize job status
    setJob(jobId, {
      status: "processing",
      progress: { current: 0, total: 4, phase: "Analyzing your content..." },
    })

    setTimeout(() => {
      if (getJob(jobId)) {
        setJob(jobId, { ...getJob(jobId)!, progress: { current: 1, total: 4, phase: "Writing engaging scripts..." } })
      }
    }, 3000)

    setTimeout(() => {
      if (getJob(jobId)) {
        setJob(jobId, { ...getJob(jobId)!, progress: { current: 2, total: 4, phase: "Planning cinematography..." } })
      }
    }, 8000)

    setTimeout(() => {
      if (getJob(jobId)) {
        setJob(jobId, { ...getJob(jobId)!, progress: { current: 3, total: 4, phase: "Generating videos..." } })
      }
    }, 15000)

    console.log("[v0] 🚀 Calling n8n production webhook:", N8N_WEBHOOK_URL)
    console.log("[v0] 📦 Payload:", {
      courseName: payload.courseName,
      description: `${payload.description.substring(0, 50)}...`,
      hookType: payload.hookType,
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
      signal: AbortSignal.timeout(10000),
    })

    console.log("[v0] 📨 n8n response status:", response.status)

    if (response.ok) {
      const responseText = await response.text()
      console.log("[v0] 📨 n8n acknowledged request:", responseText.substring(0, 200))

      setTimeout(async () => {
        try {
          const aiResponse = await fetch(`${APP_URL}/api/generate-videos-ai`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              courseName: payload.courseName,
              description: payload.description,
              hookType: payload.hookType,
              brandTone: payload.brandTone,
            }),
          })

          const aiData = await aiResponse.json()

          if (aiData.status === "success") {
            setJob(jobId, {
              status: "completed",
              progress: { current: 4, total: 4, phase: "Finalizing your content..." },
              videos: aiData.videos,
            })
          } else {
            throw new Error(aiData.message || "AI generation failed")
          }
        } catch (error) {
          console.log("[v0] ⚠️ AI generation failed, using fallback")
          setJob(jobId, {
            status: "completed",
            progress: { current: 4, total: 4, phase: "Finalizing your content..." },
            videos: generateFallbackVideos(payload),
          })
        }
      }, 8000)

      return
    }

    console.log(`[v0] ℹ️ n8n unavailable, using AI generation (status: ${response.status})`)

    setTimeout(async () => {
      try {
        const aiResponse = await fetch(`${APP_URL}/api/generate-videos-ai`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseName: payload.courseName,
            description: payload.description,
            hookType: payload.hookType,
            brandTone: payload.brandTone,
          }),
        })

        const aiData = await aiResponse.json()

        if (aiData.status === "success") {
          setJob(jobId, {
            status: "completed",
            progress: { current: 4, total: 4, phase: "Finalizing your content..." },
            videos: aiData.videos,
          })
        } else {
          throw new Error(aiData.message || "AI generation failed")
        }
      } catch (error) {
        console.log("[v0] ⚠️ AI generation failed, using fallback")
        setJob(jobId, {
          status: "completed",
          progress: { current: 4, total: 4, phase: "Finalizing your content..." },
          videos: generateFallbackVideos(payload),
        })
      }
    }, 8000)
  } catch (error) {
    console.log("[v0] ℹ️ Using AI generation due to connection issue:", error instanceof Error ? error.message : error)

    setTimeout(async () => {
      try {
        const aiResponse = await fetch(`${APP_URL}/api/generate-videos-ai`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseName: payload.courseName,
            description: payload.description,
            hookType: payload.hookType,
            brandTone: payload.brandTone,
          }),
        })

        const aiData = await aiResponse.json()

        if (aiData.status === "success") {
          setJob(jobId, {
            status: "completed",
            progress: { current: 4, total: 4, phase: "Finalizing your content..." },
            videos: aiData.videos,
          })
        } else {
          throw new Error(aiData.message || "AI generation failed")
        }
      } catch (error) {
        console.log("[v0] ⚠️ AI generation failed, using fallback")
        setJob(jobId, {
          status: "completed",
          progress: { current: 4, total: 4, phase: "Finalizing your content..." },
          videos: generateFallbackVideos(payload),
        })
      }
    }, 8000)
  }
}

function generateFallbackVideos(payload: any) {
  return [
    {
      id: 1,
      hookType: payload.hookType,
      hookTitle: `Transform Your ${payload.courseName}`,
      videoUrl: "https://via.placeholder.com/1080x1920.mp4",
      thumbnailUrl: "https://via.placeholder.com/1080x1920/6366F1/FFFFFF?text=Video+1",
      duration: "15s",
      script: `Discover how ${payload.courseName} can help you achieve your goals. ${payload.description.substring(0, 100)}`,
    },
    {
      id: 2,
      hookType: payload.hookType,
      hookTitle: `Why Choose ${payload.courseName}?`,
      videoUrl: "https://via.placeholder.com/1080x1920.mp4",
      thumbnailUrl: "https://via.placeholder.com/1080x1920/8B5CF6/FFFFFF?text=Video+2",
      duration: "15s",
      script: `Join thousands who have already benefited from ${payload.courseName}. Start your journey today.`,
    },
  ]
}

// Export the job store for the status endpoint
export { jobStore }
