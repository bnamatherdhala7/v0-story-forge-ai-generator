"use client"

import { useState, type ChangeEvent, type DragEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface UploadedImage {
  name: string
  data: string
}

interface FormData {
  courseName: string
  description: string
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

const N8N_WEBHOOK_URL = "https://bharat77.app.n8n.cloud/webhook-test/storyforge-generate"

// Mock data for testing
const MOCK_VIDEOS: Video[] = [
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

export default function StoryForgeApp() {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [formData, setFormData] = useState<FormData>({
    courseName: "",
    description: "",
    brandTone: "educational", // Default to "educational" instead of empty string
    brandColor: "#6366F1",
  })
  const [screen, setScreen] = useState<"upload" | "processing" | "results">("upload")
  const [videos, setVideos] = useState<Video[]>([])
  const [validationError, setValidationError] = useState("")
  const [dragActive, setDragActive] = useState(false)

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
          setUploadedImages((prev) => [...prev, { name: file.name, data: e.target!.result as string }])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const isFormValid = () => {
    const isImagesValid = uploadedImages.length >= 5 && uploadedImages.length <= 8
    const isCourseNameValid = formData.courseName.trim().length >= 3
    const isDescriptionValid = formData.description.trim().length >= 50
    const isToneValid = ["educational", "inspiring", "relatable"].includes(formData.brandTone.toLowerCase())

    return isImagesValid && isCourseNameValid && isDescriptionValid && isToneValid
  }

  const handleGenerate = async () => {
    // Validate all fields
    if (uploadedImages.length < 5 || uploadedImages.length > 8) {
      setValidationError("Please upload 5-8 images")
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

    // Clear errors and move to processing screen
    setValidationError("")
    setScreen("processing")

    try {
      // Prepare payload with base64 images
      const payload = {
        courseName: formData.courseName,
        description: formData.description,
        brandTone: formData.brandTone,
        brandColor: formData.brandColor,
        images: uploadedImages.map((img) => img.data),
      }

      // Debug logging
      console.log("🚀 Calling n8n:", N8N_WEBHOOK_URL)
      console.log("📦 Payload:", payload)

      // Call n8n webhook
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("✅ Response:", data)

      // Handle response
      if (data.status === "error") {
        setValidationError(data.message || "An error occurred while generating videos")
        setScreen("upload")
        alert(`Error: ${data.message || "Failed to generate videos"}`)
        return
      }

      if (data.status === "success" && data.videos) {
        setVideos(data.videos)
        setScreen("results")
      } else {
        throw new Error("Invalid response format")
      }
    } catch (error) {
      console.error("Error generating videos:", error)
      const errorMessage =
        error instanceof Error ? error.message : "Network error. Please check your connection and try again."
      setValidationError(errorMessage)
      setScreen("upload")
      alert(`Failed to generate videos: ${errorMessage}`)
    }
  }

  const handleDownloadAll = () => {
    alert("Download all functionality - integrate with your backend")
  }

  const handleGenerateNew = () => {
    setScreen("upload")
    setUploadedImages([])
    setFormData({
      courseName: "",
      description: "",
      brandTone: "educational", // Default to "educational" instead of empty string
      brandColor: "#6366F1",
    })
    setVideos([])
  }

  const handleDownload = (videoUrl: string, hookType: string) => {
    alert(`Download video: ${hookType}`)
  }

  const charCount = formData.description.length
  const isCharCountValid = charCount >= 50

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4">
      {/* SCREEN 1: Upload & Setup */}
      {screen === "upload" && (
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-in fade-in duration-500">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
              StoryForge AI
            </h1>
            <p className="text-gray-600 text-lg">Generate 5 unique promotional videos for your course in minutes</p>
          </div>

          {/* Main Form Card */}
          <Card className="p-8 mb-6">
            {/* Image Upload Section */}
            <div className="mb-8">
              <label className="block text-gray-700 font-semibold mb-3 text-lg">
                Upload Images (5-8 required) <span className="text-red-500">*</span>
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
                        src={img.data || "/placeholder.svg"}
                        alt={img.name}
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
                  uploadedImages.length >= 5 && uploadedImages.length <= 8
                    ? "text-green-600 font-semibold"
                    : uploadedImages.length > 0
                      ? "text-orange-600 font-semibold"
                      : "text-gray-500"
                }`}
              >
                {uploadedImages.length} image{uploadedImages.length !== 1 ? "s" : ""} uploaded
                {uploadedImages.length > 0 && uploadedImages.length < 5 && " (need at least 5)"}
                {uploadedImages.length > 8 && " (maximum 8 allowed)"}
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              {/* Course Name */}
              <div>
                <label htmlFor="courseName" className="block text-gray-700 font-semibold mb-2">
                  Course/Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="courseName"
                  placeholder="e.g., AI Product Management Masterclass"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                  value={formData.courseName}
                  onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                  required
                  minLength={3}
                />
                {formData.courseName.length > 0 && formData.courseName.length < 3 && (
                  <p className="text-orange-600 text-sm mt-1">Must be at least 3 characters</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="courseDescription" className="block text-gray-700 font-semibold mb-2">
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              {/* Brand Tone */}
              <div>
                <label htmlFor="brandTone" className="block text-gray-700 font-semibold mb-2">
                  Brand Tone <span className="text-red-500">*</span>
                </label>
                <select
                  id="brandTone"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors bg-white"
                  value={formData.brandTone}
                  onChange={(e) => setFormData({ ...formData, brandTone: e.target.value })}
                >
                  <option value="">Select a tone...</option>
                  <option value="educational">Educational</option>
                  <option value="inspiring">Inspiring</option>
                  <option value="relatable">Relatable</option>
                </select>
              </div>

              {/* Brand Color */}
              <div>
                <label htmlFor="brandColor" className="block text-gray-700 font-semibold mb-2">
                  Brand Color
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    id="brandColor"
                    value={formData.brandColor}
                    onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                    className="h-12 w-20 border-2 border-gray-200 rounded-lg cursor-pointer"
                  />
                  <span className="text-gray-600 font-mono">{formData.brandColor}</span>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={!isFormValid()}
              className="w-full mt-8 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              Generate 5 Videos
            </Button>
            {validationError && (
              <p className="text-red-500 text-sm mt-2 text-center font-semibold">{validationError}</p>
            )}
            {!isFormValid() && (
              <p className="text-gray-500 text-sm mt-2 text-center">Complete all required fields to generate videos</p>
            )}
          </Card>

          {/* Info Footer */}
          <div className="text-center text-gray-500 text-sm">
            <p>
              AI will generate 5 video hooks: Pain Point, Transformation, Social Proof, Quick Win, and Curiosity Gap
            </p>
          </div>
        </div>
      )}

      {/* SCREEN 2: Processing */}
      {screen === "processing" && (
        <div className="max-w-2xl mx-auto text-center">
          <Card className="p-12">
            {/* Spinner */}
            <div className="flex justify-center mb-8">
              <div className="h-20 w-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>

            <h2 className="text-3xl font-bold text-gray-800 mb-4">Analyzing your content...</h2>
            <p className="text-gray-600 text-lg mb-6">Our AI is crafting 5 unique video concepts</p>

            <div className="bg-indigo-50 rounded-lg p-6 mb-6">
              <p className="text-indigo-700 font-semibold mb-3">Generating Hook Types:</p>
              <div className="space-y-2 text-left">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-indigo-500 rounded-full" />
                  <span className="text-gray-700">Pain Point - Identifies audience struggles</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-purple-500 rounded-full" />
                  <span className="text-gray-700">Transformation - Shows before/after</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-pink-500 rounded-full" />
                  <span className="text-gray-700">Social Proof - Leverages testimonials</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-indigo-500 rounded-full" />
                  <span className="text-gray-700">Quick Win - Promises fast results</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-purple-500 rounded-full" />
                  <span className="text-gray-700">Curiosity Gap - Creates intrigue</span>
                </div>
              </div>
            </div>

            <p className="text-gray-500">
              Estimated time: <span className="font-semibold">~3-5 minutes</span>
            </p>
          </Card>
        </div>
      )}

      {/* SCREEN 3: Results */}
      {screen === "results" && (
        <div className="max-w-7xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 bg-green-100 text-green-700 px-6 py-3 rounded-full mb-4">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-semibold text-lg">Your 5 videos are ready!</span>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Button
                onClick={handleDownloadAll}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                Download All (ZIP)
              </Button>
              <Button
                onClick={handleGenerateNew}
                variant="outline"
                className="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 border-2 border-indigo-200"
              >
                Generate New
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
                    onClick={() => handleDownload(video.videoUrl, video.hookType)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition-colors"
                  >
                    Download
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
