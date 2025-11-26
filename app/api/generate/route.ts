import { type NextRequest, NextResponse } from "next/server"

const N8N_WEBHOOK_URL = "https://bharat77.app.n8n.cloud/webhook/storyforge-generate"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log("[v0] 🚀 Proxying request to n8n:", N8N_WEBHOOK_URL)
    console.log("[v0] 📦 Received body keys:", Object.keys(body))
    console.log("[v0] 📦 Images received:", body.images ? `Array of ${body.images.length} items` : "MISSING")
    console.log("[v0] 📦 Images type:", Array.isArray(body.images) ? "Array" : typeof body.images)

    // Validate images exist
    if (!body.images || !Array.isArray(body.images) || body.images.length === 0) {
      console.error("[v0] ❌ Images missing or invalid in request body")
      return NextResponse.json(
        {
          status: "error",
          message: "Images array is required",
        },
        { status: 400 },
      )
    }

    console.log("[v0] 📦 Full payload structure:", {
      courseName: body.courseName,
      description: body.description?.substring(0, 50) + "...",
      brandTone: body.brandTone,
      brandColor: body.brandColor,
      imagesCount: body.images.length,
      firstImagePreview: body.images[0]?.substring(0, 50) + "...",
    })

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log("[v0] 📡 n8n Response status:", response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error")
        console.error("[v0] ❌ n8n error:", errorText)
        return NextResponse.json(
          {
            status: "error",
            message: `Webhook error: ${response.status} - ${errorText}`,
          },
          { status: response.status },
        )
      }

      const data = await response.json()
      console.log("[v0] ✅ n8n Response:", data)

      return NextResponse.json(data)
    } catch (fetchError) {
      clearTimeout(timeoutId)
      throw fetchError
    }
  } catch (error) {
    console.error("[v0] ❌ API route error:", error)

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return NextResponse.json(
          {
            status: "error",
            message: "Request timed out after 30 seconds",
          },
          { status: 504 },
        )
      }
    }

    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}
