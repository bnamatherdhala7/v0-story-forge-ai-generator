import { type NextRequest, NextResponse } from "next/server"

const N8N_WEBHOOK_URL = "https://bharat77.app.n8n.cloud/webhook/storyforge-generate"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log("[v0] 🚀 Proxying request to n8n:", N8N_WEBHOOK_URL)
    console.log("[v0] 📦 Received body keys:", Object.keys(body))

    console.log("[v0] 📦 courseName:", body.courseName)
    console.log("[v0] 📦 description:", body.description)
    console.log("[v0] 📦 description length:", body.description?.length)
    console.log("[v0] 📦 brandTone:", body.brandTone)
    console.log("[v0] 📦 brandColor:", body.brandColor)
    console.log("[v0] 📦 images type:", Array.isArray(body.images) ? "Array" : typeof body.images)
    console.log("[v0] 📦 images count:", body.images?.length)
    console.log("[v0] 📦 first image starts with:", body.images?.[0]?.substring(0, 30))

    // Validate required fields
    if (!body.courseName || body.courseName.trim().length < 3) {
      return NextResponse.json(
        {
          status: "error",
          message: "Course name is required (minimum 3 characters)",
        },
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
        {
          status: "error",
          message: `Images array must contain 5-8 items (got ${body.images?.length || 0})`,
        },
        { status: 400 },
      )
    }

    const payload = {
      courseName: body.courseName.trim(),
      description: body.description.trim(),
      brandTone: body.brandTone.toLowerCase(),
      brandColor: body.brandColor || "#6366F1",
      images: body.images,
    }

    console.log("[v0] 📤 Sending to n8n - payload preview:", {
      courseName: payload.courseName,
      descriptionLength: payload.description.length,
      brandTone: payload.brandTone,
      brandColor: payload.brandColor,
      imagesCount: payload.images.length,
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
        body: JSON.stringify(payload),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log("[v0] 📡 n8n Response status:", response.status, response.statusText)

      const responseText = await response.text()
      console.log("[v0] 📡 n8n Response raw:", responseText)

      if (!response.ok) {
        console.error("[v0] ❌ n8n error response:", responseText)
        return NextResponse.json(
          {
            status: "error",
            message: `Webhook error: ${response.status} - ${responseText}`,
          },
          { status: response.status },
        )
      }

      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error("[v0] ❌ Failed to parse n8n response as JSON:", parseError)
        data = { status: "error", message: responseText }
      }

      console.log("[v0] ✅ n8n Response parsed:", data)

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
