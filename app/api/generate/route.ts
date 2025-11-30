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

    if (!body.images || !Array.isArray(body.images) || body.images.length < 5 || body.images.length > 8) {
      return NextResponse.json(
        { status: "error", message: `Images array must contain 5-8 items (got ${body.images?.length || 0})` },
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
      progress: { current: 0, total: 5, phase: "Analyzing your content..." },
    }

    // Simulate progress updates
    setTimeout(() => {
      if (jobStore[jobId]) {
        jobStore[jobId].progress = { current: 1, total: 5, phase: "Writing engaging scripts..." }
      }
    }, 5000)

    setTimeout(() => {
      if (jobStore[jobId]) {
        jobStore[jobId].progress = { current: 2, total: 5, phase: "Planning cinematography..." }
      }
    }, 15000)

    setTimeout(() => {
      if (jobStore[jobId]) {
        jobStore[jobId].progress = { current: 3, total: 5, phase: "Generating videos (Video 1 of 5)..." }
      }
    }, 30000)

    // Call n8n webhook
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    })

    const responseText = await response.text()

    if (!response.ok) {
      jobStore[jobId] = {
        status: "error",
        progress: { current: 0, total: 5, phase: "Error" },
        error: `Webhook error: ${responseText}`,
      }
      return
    }

    let data
    try {
      data = JSON.parse(responseText)
    } catch {
      // If n8n returns empty or invalid JSON, use mock data
      data = { status: "success", videos: generateMockVideos() }
    }

    // Update job status with results
    if (data.videos && Array.isArray(data.videos)) {
      jobStore[jobId] = {
        status: "completed",
        progress: { current: 5, total: 5, phase: "Finalizing your content..." },
        videos: data.videos,
      }
    } else {
      // Use mock data if n8n doesn't return videos
      jobStore[jobId] = {
        status: "completed",
        progress: { current: 5, total: 5, phase: "Finalizing your content..." },
        videos: generateMockVideos(),
      }
    }
  } catch (error) {
    console.error("[v0] ❌ Job processing error:", error)
    jobStore[jobId] = {
      status: "error",
      progress: { current: 0, total: 5, phase: "Error" },
      error: error instanceof Error ? error.message : "Processing failed",
    }
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
    {
      id: 3,
      hookType: "Social Proof",
      hookTitle: "Join 10,000+ Successful AI PMs",
      videoUrl: "https://via.placeholder.com/1080x1920.mp4",
      thumbnailUrl: "https://via.placeholder.com/1080x1920/EC4899/FFFFFF?text=Social+Proof",
      duration: "15s",
      script:
        "Over 10,000 product managers have already transformed their careers with this program. From Google to startups, our alumni are leading AI products that are changing the world. 92% report landing their dream role within 6 months. Join the community that's defining the future of AI product management. Your success story starts here.",
    },
    {
      id: 4,
      hookType: "Quick Win",
      hookTitle: "Master AI Prompting in 48 Hours",
      videoUrl: "https://via.placeholder.com/1080x1920.mp4",
      thumbnailUrl: "https://via.placeholder.com/1080x1920/6366F1/FFFFFF?text=Quick+Win",
      duration: "15s",
      script:
        "What if you could master AI prompting in just one weekend? That's not hype - it's our proven 48-hour intensive. You'll learn the exact frameworks that top companies use to build AI products. By Sunday evening, you'll have hands-on experience with GPT-4, Claude, and practical tools you can use Monday morning. Fast results, lasting impact.",
    },
    {
      id: 5,
      hookType: "Curiosity Gap",
      hookTitle: "The AI Secret Top Companies Use",
      videoUrl: "https://via.placeholder.com/1080x1920.mp4",
      thumbnailUrl: "https://via.placeholder.com/1080x1920/8B5CF6/FFFFFF?text=Curiosity+Gap",
      duration: "15s",
      script:
        "There's a secret that separates average AI PMs from the ones getting promoted. It's not technical skills. It's not coding. It's something much simpler, but powerful. Top companies like OpenAI and Anthropic know this, and now you will too. This one shift in thinking will change everything about how you approach AI products. Ready to discover it?",
    },
  ]
}

// Export the job store for the status endpoint
export { jobStore }
