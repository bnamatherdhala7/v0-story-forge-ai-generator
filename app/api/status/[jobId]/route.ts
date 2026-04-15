import { type NextRequest, NextResponse } from "next/server"
import { getJob } from "../../generate/route"

export async function GET(request: NextRequest, { params }: { params: { jobId: string } }) {
  try {
    const { jobId } = params

    const job = getJob(jobId)

    if (!job) {
      return NextResponse.json({ status: "error", error: "Job not found" }, { status: 404 })
    }

    return NextResponse.json(job)
  } catch (error) {
    console.error("[v0] ❌ Status check error:", error)
    return NextResponse.json(
      { status: "error", error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
