// API utility for submitting form data via internal API route

const INTERNAL_API_URL = "/api/generate"

interface FormData {
  courseName: string
  description: string
  brandTone: string
  brandColor: string
  images: string[]
}

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Fetch with timeout support using AbortController
 */
const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 30000): Promise<Response> => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

/**
 * Submit form data to internal API route (which proxies to n8n)
 */
export async function submitToAPI(formData: FormData): Promise<ApiResponse> {
  try {
    console.log("[v0] 🚀 Calling internal API route")

    console.log("[v0] 📦 FormData received in API utility:")
    console.log("[v0]   Array.isArray(formData.images):", Array.isArray(formData.images))
    console.log("[v0]   formData.images.length:", formData.images.length)
    console.log("[v0]   typeof formData.images:", typeof formData.images)
    console.log("[v0]   Object.keys(formData.images):", Object.keys(formData.images))

    const jsonString = JSON.stringify(formData)
    console.log("[v0]   JSON string first 200 chars:", jsonString.substring(0, 200))
    const parsed = JSON.parse(jsonString)
    console.log("[v0]   Parsed back - Array.isArray(parsed.images):", Array.isArray(parsed.images))

    console.log("[v0] 📦 Payload:", {
      courseName: formData.courseName,
      description: formData.description,
      brandTone: formData.brandTone,
      brandColor: formData.brandColor,
      images: `[${formData.images.length} base64 images]`,
    })

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 35000) // Slightly longer than server timeout

    try {
      const response = await fetchWithTimeout(
        INTERNAL_API_URL,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
        35000,
      )

      console.log("[v0] 📡 Response status:", response.status, response.statusText)

      // Parse JSON response
      const data = await response.json()
      console.log("[v0] ✅ Response:", data)

      // Check for errors
      if (!response.ok || data.status === "error") {
        return {
          success: false,
          error: data.message || `Server error: ${response.status}`,
        }
      }

      // Verify successful response has required data
      if (data.status === "success" && data.videos) {
        return {
          success: true,
          data: data,
        }
      }

      return {
        success: false,
        error: "Invalid response format - missing videos data",
      }
    } catch (fetchError) {
      clearTimeout(timeoutId)
      throw fetchError
    }
  } catch (error) {
    console.error("[v0] ❌ API call failed:", error)

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return {
          success: false,
          error: "Request timed out after 35 seconds. Please try again.",
        }
      } else if (error.message.includes("Failed to fetch")) {
        return {
          success: false,
          error: "Network error - check your internet connection and try again.",
        }
      } else {
        return {
          success: false,
          error: error.message,
        }
      }
    }

    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    }
  }
}
