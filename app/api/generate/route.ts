import { type NextRequest, NextResponse } from "next/server"

const N8N_WEBHOOK_URL = "https://bharat77.app.n8n.cloud/webhook/storyforge-generate"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log("[v0] 🚀 Proxying request to n8n:", N8N_WEBHOOK_URL)

    console.log("[v0] 📦 Payload details:")
    console.log("[v0]   courseName:", body.courseName)
    console.log("[v0]   description length:", body.description?.length)
    console.log("[v0]   images count:", body.images?.length)

    console.log("[v0] 📦 Request body received by API route:")
    console.log("[v0]   typeof body.images:", typeof body.images)
    console.log("[v0]   Array.isArray(body.images):", Array.isArray(body.images))
    console.log("[v0]   Object.keys(body.images):", Object.keys(body.images || {}))
    console.log("[v0]   body.images.length:", body.images?.length)

    if (body.images && Array.isArray(body.images)) {
      console.log("[v0]   first image sample:", body.images[0]?.substring(0, 50) + "...")
      console.log("[v0]   first image length:", body.images[0]?.length)
    }

    // Validate required fields before sending
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

    const payload = {
      courseName: String(body.courseName || "").trim(),
      description: String(body.description || "").trim(),
      brandTone: String(body.brandTone || "educational").toLowerCase(),
      brandColor: String(body.brandColor || "#6366F1").trim(),
      images: Array.isArray(body.images) ? body.images : [],
    }

    console.log("[v0] 📤 Final payload being sent:")
    console.log("[v0]   courseName:", payload.courseName, `(${payload.courseName.length} chars)`)
    console.log(
      "[v0]   description:",
      payload.description.substring(0, 50) + `... (${payload.description.length} chars)`,
    )
    console.log("[v0]   brandTone:", payload.brandTone)
    console.log("[v0]   brandColor:", payload.brandColor)
    console.log("[v0]   images array length:", payload.images.length)
    console.log("[v0]   first image starts with:", payload.images[0]?.substring(0, 50))

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000)

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

      console.log("[v0] 📡 n8n Response status:", response.status)
      console.log("[v0] 📡 n8n Response headers:", Object.fromEntries(response.headers.entries()))

      const responseText = await response.text()
      console.log("[v0] 📡 n8n Response body:", responseText)

      if (!response.ok) {
        return NextResponse.json(
          { status: "error", message: `Webhook error: ${responseText}` },
          { status: response.status },
        )
      }

      let data
      try {
        data = JSON.parse(responseText)
      } catch {
        data = { status: "error", message: responseText }
      }

      return NextResponse.json(data)
    } catch (fetchError) {
      clearTimeout(timeoutId)
      throw fetchError
    }
  } catch (error) {
    console.error("[v0] ❌ API route error:", error)

    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json({ status: "error", message: "Request timed out after 60 seconds" }, { status: 504 })
    }

    return NextResponse.json(
      { status: "error", message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
