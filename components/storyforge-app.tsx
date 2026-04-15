"use client"

import { useState, useEffect, type ChangeEvent, type DragEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, CheckCircle2 } from "lucide-react"

const N8N_WEBHOOK_URL = "https://bharat77.app.n8n.cloud/webhook-test/storyforge-generate"

// Mock data for testing
const MOCK_VIDEOS: any[] = [
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

interface UploadedImage {
  name: string
  data: string
}

interface FormData {
  courseName: string
  description: string
  hookType: string
  brandTone: string
  brandColor: string
}

interface Video {
  id: number
  hookType: string
  hookTitle: string
  videoUrl: string
  thumbnailUrl: string
  duration: string
  script: string
}

interface JobProgress {
  current: number
  total: number
  phase: string
}

type ProcessingStatus = "idle" | "processing" | "completed" | "error"

function StoryforgeApp() {
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [formData, setFormData] = useState<FormData>({
    courseName: "",
    description: "",
    hookType: "pain-point",
    brandTone: "educational",
    brandColor: "#6366F1",
  })
  const [lastSubmittedData, setLastSubmittedData] = useState<{
    courseName: string
    description: string
    hookType: string
    brandTone: string
    brandColor: string
    images: string[]
  } | null>(null)
  const [screen, setScreen] = useState<"upload" | "processing" | "results">("upload")
  const [videos, setVideos] = useState<Video[]>([])
  const [validationError, setValidationError] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [dragActive, setDragActive] = useState(false)

  const [jobId, setJobId] = useState<string | null>(null)
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>("idle")
  const [progress, setProgress] = useState<JobProgress>({ current: 0, total: 5, phase: "Initializing..." })

  useEffect(() => {
    if (!jobId || processingStatus !== "processing") {
      return
    }

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/status/${jobId}`)
        const data = await response.json()

        if (data.status === "completed") {
          setProcessingStatus("completed")
          setProgress(data.progress)
          setVideos(data.videos || [])
          setScreen("results")
          clearInterval(pollInterval)
        } else if (data.status === "error") {
          setProcessingStatus("error")
          setErrorMessage(data.error || "Video generation failed")
          setScreen("upload")
          clearInterval(pollInterval)
        } else if (data.status === "processing") {
          setProgress(data.progress)
        }
      } catch (error) {
        console.error("[v0] ❌ Polling error:", error)
        setProcessingStatus("error")
        setErrorMessage("Failed to check job status. Please try again.")
        setScreen("upload")
        clearInterval(pollInterval)
      }
    }, 3000) // Poll every 3 seconds

    // Cleanup on unmount
    return () => clearInterval(pollInterval)
  }, [jobId, processingStatus])

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const handleFiles = (files: FileList) => {
    const fileArray = Array.from(files)
    const imageFiles = fileArray.filter((file) => file.type.startsWith("image/"))

    if (imageFiles.length === 0) {
      setValidationError("Please upload valid image files")
      return
    }

    const totalImages = uploadedImages.length + imageFiles.length
    if (totalImages > 8) {
      setValidationError("You can only upload up to 8 images total")
      return
    }

    setValidationError("")

    imageFiles.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        setValidationError(`${file.name} is too large. Maximum 10MB per file.`)
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setUploadedImages((prev) => [...prev, e.target!.result as string])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const isFormValid = () => {
    const isImagesValid = uploadedImages.length >= 1 && uploadedImages.length <= 8
    const isCourseNameValid = formData.courseName.trim().length >= 3
    const isDescriptionValid = formData.description.trim().length >= 50
    const isToneValid = ["educational", "inspiring", "relatable"].includes(formData.brandTone.toLowerCase())

    return isImagesValid && isCourseNameValid && isDescriptionValid && isToneValid
  }

  const handleGenerate = async () => {
    console.log("[v0] 🚀 Generate button clicked")
    console.log("[v0] 📋 Form data:", formData)
    console.log("[v0] 🖼️ Uploaded images count:", uploadedImages.length)

    // Validate all fields
    if (uploadedImages.length < 1) {
      setValidationError("Please upload at least 1 image")
      return
    }

    if (formData.courseName.trim().length < 3) {
      setValidationError("Course name must be at least 3 characters")
      return
    }

    if (formData.description.trim().length < 50) {
      setValidationError("Description must be at least 50 characters")
      return
    }

    if (!["educational", "inspiring", "relatable"].includes(formData.brandTone.toLowerCase())) {
      setValidationError("Please select a valid brand tone")
      return
    }

    console.log("[v0] ✅ All validations passed")

    // Clear errors and move to processing screen
    setValidationError("")
    setErrorMessage("")
    setProcessingStatus("processing")
    setScreen("processing")
    setProgress({ current: 0, total: 5, phase: "Analyzing your content..." })

    try {
      const submittedData = {
        courseName: formData.courseName,
        description: formData.description,
        hookType: formData.hookType,
        brandTone: formData.brandTone,
        brandColor: formData.brandColor,
        images: uploadedImages,
      }
      setLastSubmittedData(submittedData)

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submittedData),
      })

      const data = await response.json()

      if (!response.ok || data.status === "error") {
        let errorMsg = data.message || "Failed to start video generation"
        if (errorMsg.includes("webhook") && errorMsg.includes("not registered")) {
          errorMsg =
            "⚠️ n8n Workflow Not Active\n\n" +
            "Please activate your n8n workflow:\n" +
            "1. Go to your n8n editor\n" +
            "2. Click 'Execute workflow' button (for test URL)\n" +
            "   OR\n" +
            "   Enable the workflow toggle (top-right) for production URL\n" +
            "3. Try again\n\n" +
            "Note: Test webhooks only work for one call after activation."
        }
        throw new Error(errorMsg)
      }

      // Store jobId and start polling
      setJobId(data.jobId)
    } catch (error) {
      console.error("[v0] ❌ Error starting job:", error)
      setProcessingStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Failed to start video generation")
      setScreen("upload")
    }
  }

  const handleDownloadAll = () => {
    videos.forEach((video) => {
      const content = `Hook Type: ${video.hookType}\nTitle: ${video.hookTitle}\n\n${video.script}`
      const blob = new Blob([content], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${video.hookType.replace(/[^a-z0-9]/gi, "_")}_script.txt`
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    })
  }

  const handleGenerateNew = () => {
    setScreen("upload")
    setUploadedImages([])
    setFormData({
      courseName: "",
      description: "",
      hookType: "pain-point",
      brandTone: "educational",
      brandColor: "#6366F1",
    })
    setVideos([])
    setJobId(null)
    setProcessingStatus("idle")
    setProgress({ current: 0, total: 5, phase: "Initializing..." })
  }

  const handleGenerateMore = async () => {
    if (!lastSubmittedData) {
      setErrorMessage("No previous data found. Please submit the form first.")
      return
    }

    console.log("[v0] 🔄 Generating more videos with previous data")

    // Move to processing screen
    setProcessingStatus("processing")
    setScreen("processing")
    setProgress({ current: 0, total: 5, phase: "Analyzing your content..." })

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(lastSubmittedData),
      })

      const data = await response.json()

      if (!response.ok || data.status === "error") {
        throw new Error(data.message || "Failed to start video generation")
      }

      // Store jobId and start polling
      setJobId(data.jobId)
    } catch (error) {
      console.error("[v0] ❌ Error starting job:", error)
      setProcessingStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Failed to start video generation")
      setScreen("results") // Return to results instead of upload
    }
  }

  const handleDownload = (script: string, hookType: string, hookTitle: string) => {
    const content = `Hook Type: ${hookType}\nTitle: ${hookTitle}\n\n${script}`
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${hookType.replace(/[^a-z0-9]/gi, "_")}_script.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleCancel = () => {
    setProcessingStatus("idle")
    setJobId(null)
    setScreen("upload")
  }

  const handleRetry = () => {
    setErrorMessage("")
    setValidationError("")
    setProcessingStatus("idle")
    setJobId(null)
    handleGenerate()
  }

  const charCount = formData.description.length
  const isCharCountValid = charCount >= 50

  const progressPercentage = (progress.current / progress.total) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      {/* SCREEN 1: Upload */}
      {screen === "upload" && (
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center mb-12 animate-in fade-in duration-500">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
              StoryForge AI
            </h1>
            <p className="text-gray-600 text-lg">Generate promotional videos for your course or product in minutes</p>
          </div>

          {/* Main Form Card */}
          <Card className="p-8 shadow-xl">
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="flex-1">
                    <h3 className="text-red-800 font-semibold mb-1">Error</h3>
                    <p className="text-red-700 text-sm whitespace-pre-line">{errorMessage}</p>
                    <button
                      onClick={handleRetry}
                      className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              </div>
            )}

            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Setup Your Video Generation</h2>

            {/* Image Upload Section */}
            <div className="mb-8">
              <label htmlFor="images" className="block text-sm font-medium mb-2">
                Upload Images <span className="text-red-500">*</span>
              </label>

              {/* Upload Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById("fileInput")?.click()}
                className={`border-3 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                  dragActive ? "border-indigo-500 bg-indigo-100" : "border-indigo-300 bg-indigo-50 hover:bg-indigo-100"
                }`}
              >
                <svg
                  className="mx-auto h-16 w-16 text-indigo-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-indigo-600 font-medium mb-2">Click to upload or drag and drop</p>
                <p className="text-gray-500 text-sm">PNG, JPG, WEBP up to 10MB each</p>
                <input
                  type="file"
                  id="fileInput"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileInput}
                />
              </div>

              {/* Thumbnail Preview Grid */}
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 mt-4">
                  {uploadedImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img || "/placeholder.svg"}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg shadow-md"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeImage(index)
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                        aria-label="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p
                className={`text-sm mt-2 ${
                  uploadedImages.length >= 1 && uploadedImages.length <= 8
                    ? "text-green-600 font-semibold"
                    : uploadedImages.length > 0
                      ? "text-orange-600 font-semibold"
                      : "text-gray-500"
                }`}
              >
                {uploadedImages.length} image{uploadedImages.length !== 1 ? "s" : ""} uploaded
                {uploadedImages.length > 0 && uploadedImages.length < 1 && " (need at least 1)"}
                {uploadedImages.length > 8 && " (maximum 8 allowed)"}
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              {/* Course Name */}
              <div>
                <label htmlFor="courseName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Course/Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="courseName"
                  placeholder="e.g., Productivity Masterclass, SkinCare Starter Kit"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                  value={formData.courseName}
                  onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                  disabled={processingStatus === "processing"}
                  required
                  minLength={3}
                />
                {formData.courseName.length > 0 && formData.courseName.length < 3 && (
                  <p className="text-orange-600 text-sm mt-1">Must be at least 3 characters</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="courseDescription" className="block text-sm font-semibold text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                  <span
                    className={`text-sm ml-2 ${
                      isCharCountValid ? "text-green-600" : charCount > 0 ? "text-orange-600" : "text-gray-500"
                    }`}
                  >
                    ({charCount}/50 characters minimum)
                  </span>
                </label>
                <textarea
                  id="courseDescription"
                  rows={4}
                  placeholder="Describe your course, target audience, and key benefits..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all min-h-[120px] disabled:bg-gray-100 disabled:cursor-not-allowed"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={processingStatus === "processing"}
                  required
                />
              </div>

              {/* Hook Type */}
              <div>
                <label htmlFor="hookType" className="block text-sm font-semibold text-gray-700 mb-2">
                  Hook Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="hookType"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                  value={formData.hookType}
                  onChange={(e) => setFormData({ ...formData, hookType: e.target.value })}
                  disabled={processingStatus === "processing"}
                  required
                >
                  <option value="pain-point">Pain Point</option>
                  <option value="transformation">Transformation</option>
                  <option value="social-proof">Social Proof</option>
                  <option value="behind-the-scenes">Behind-the-Scenes</option>
                  <option value="objection-handling">Objection Handling</option>
                  <option value="curiosity-gap">Curiosity Gap</option>
                  <option value="quick-win">Quick Win</option>
                  <option value="authority">Authority</option>
                  <option value="urgency-scarcity">Urgency/Scarcity</option>
                  <option value="story-hook">Story Hook</option>
                </select>
              </div>

              {/* Brand Tone */}
              <div>
                <label htmlFor="brandTone" className="block text-sm font-semibold text-gray-700 mb-2">
                  Brand Tone <span className="text-red-500">*</span>
                </label>
                <select
                  id="brandTone"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                  value={formData.brandTone}
                  onChange={(e) => setFormData({ ...formData, brandTone: e.target.value })}
                  disabled={processingStatus === "processing"}
                >
                  <option value="educational">Educational</option>
                  <option value="inspiring">Inspiring</option>
                  <option value="relatable">Relatable</option>
                </select>
              </div>

              {/* Brand Color */}
              <div>
                <label htmlFor="brandColor" className="block text-sm font-semibold text-gray-700 mb-2">
                  Brand Color
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    id="brandColor"
                    value={formData.brandColor}
                    onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                    disabled={processingStatus === "processing"}
                    className="w-full h-[50px] border-2 border-gray-200 rounded-xl cursor-pointer disabled:cursor-not-allowed"
                  />
                  <span className="text-gray-600 font-mono">{formData.brandColor}</span>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={!isFormValid() || processingStatus === "processing"}
              className={`w-full mt-6 py-4 text-lg font-bold rounded-xl shadow-lg transition-all duration-200 ${
                isFormValid() && processingStatus !== "processing"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-xl hover:scale-[1.02] cursor-pointer"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {processingStatus === "processing" ? "Processing..." : "Generate Videos"}
            </Button>

            {validationError && (
              <p className="text-red-500 text-sm mt-2 text-center font-semibold">{validationError}</p>
            )}
            {!isFormValid() && processingStatus !== "processing" && (
              <p className="text-gray-500 text-sm mt-2 text-center">Complete all required fields to generate videos</p>
            )}
          </Card>

          {/* Info Footer */}
          <div className="text-center text-gray-500 text-sm">
            <p>AI will generate video hooks based on your input</p>
          </div>
        </div>
      )}

      {/* SCREEN 2: Processing - UPDATED */}
      {screen === "processing" && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <Card className="max-w-2xl w-full p-12 text-center">
            {/* Animated Header */}
            <h2 className="text-4xl font-bold text-gray-800 mb-2 animate-pulse">AI is Creating Your Videos...</h2>

            {/* Pulsing Loader */}
            <div className="flex justify-center my-8">
              <Loader2 className="h-20 w-20 text-indigo-600 animate-spin" />
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Current Phase */}
            <div className="bg-indigo-50 rounded-xl p-6 mb-6">
              <p className="text-2xl font-semibold text-indigo-700">{progress.phase}</p>
            </div>

            {/* Info Text */}
            <p className="text-gray-500 text-sm mb-8">This takes 2-4 minutes. You can safely stay on this page.</p>

            {/* Cancel Button */}
            <Button
              onClick={handleCancel}
              variant="outline"
              className="px-6 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors bg-transparent"
            >
              Cancel
            </Button>
          </Card>
        </div>
      )}

      {/* SCREEN 3: Results - UPDATED */}
      {screen === "results" && (
        <div className="max-w-7xl mx-auto">
          {/* Success Header with Celebration */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-20 w-20 text-green-500" />
            </div>
            <h1 className="text-5xl font-bold text-gray-800 mb-3">Your Videos Are Ready!</h1>
            <p className="text-xl text-gray-600 mb-8">Your promotional videos have been generated successfully</p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button
                onClick={handleDownloadAll}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 text-lg"
              >
                Download All Scripts
              </Button>
              <Button
                onClick={handleGenerateMore}
                className="px-8 py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 text-lg"
              >
                Generate More Videos
              </Button>
              <Button
                onClick={handleGenerateNew}
                variant="outline"
                className="px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 border-2 border-indigo-200 text-lg"
              >
                Start New Project
              </Button>
            </div>
          </div>

          {/* Video Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <Card key={video.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                {/* Video Preview */}
                <div className="relative bg-gray-900 aspect-[9/16]">
                  <video
                    src={video.videoUrl}
                    poster={video.thumbnailUrl}
                    controls
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs font-semibold">
                    {video.duration}
                  </div>
                </div>

                {/* Video Details */}
                <div className="p-5">
                  <div className="mb-3">
                    <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full">
                      {video.hookType}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3">{video.hookTitle}</h3>

                  {video.script && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Script:</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{video.script}</p>
                    </div>
                  )}

                  <Button
                    onClick={() => handleDownload(video.script, video.hookType, video.hookTitle)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition-colors"
                  >
                    Download Script
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default StoryforgeApp
