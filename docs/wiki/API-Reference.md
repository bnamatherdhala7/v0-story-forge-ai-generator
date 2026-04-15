# API Reference

---

## `POST /api/generate`

Start an async video generation job. Returns immediately with a `jobId`.

### Request

```http
POST /api/generate
Content-Type: application/json
```

```json
{
  "courseName": "AI Product Management Bootcamp",
  "description": "A 48-hour intensive for product managers who want to lead AI initiatives...",
  "hookType": "pain-point",
  "brandTone": "educational",
  "brandColor": "#6366F1",
  "images": [
    "data:image/jpeg;base64,/9j/4AAQSkZ...",
    "data:image/png;base64,iVBORw0KGgo..."
  ]
}
```

### Field rules

| Field | Type | Required | Validation |
|---|---|---|---|
| `courseName` | string | Yes | min 3 characters |
| `description` | string | Yes | min 50 characters |
| `images` | string[] | Yes | 1–8 base64 data URIs, max 10MB each |
| `hookType` | string | Yes | See hook types below |
| `brandTone` | string | Yes | `educational` / `inspiring` / `relatable` |
| `brandColor` | string | No | hex color, default `#6366F1` |

### Hook types

| Value | Display name |
|---|---|
| `pain-point` | Pain Point |
| `transformation` | Transformation |
| `social-proof` | Social Proof |
| `behind-the-scenes` | Behind-the-Scenes |
| `objection-handling` | Objection-Handling |

### Response — success (202)

```json
{
  "jobId": "job_1713200000_abc123xyz",
  "status": "processing"
}
```

### Response — validation error (400)

```json
{
  "status": "error",
  "message": "Description is required (minimum 50 characters, got 23)"
}
```

---

## `GET /api/status/{jobId}`

Poll for job completion. Called every 3 seconds by the frontend.

### Request

```http
GET /api/status/job_1713200000_abc123xyz
```

### Response — processing

```json
{
  "status": "processing",
  "progress": {
    "current": 2,
    "total": 4,
    "phase": "Writing engaging scripts..."
  }
}
```

### Response — completed

```json
{
  "status": "completed",
  "progress": {
    "current": 4,
    "total": 4,
    "phase": "Finalizing your content..."
  },
  "videos": [
    {
      "id": 1,
      "hookType": "Pain Point",
      "hookTitle": "Struggling to Land AI PM Roles?",
      "videoUrl": "https://via.placeholder.com/1080x1920.mp4",
      "thumbnailUrl": "https://via.placeholder.com/1080x1920/6366F1/FFFFFF?text=Pain+Point",
      "duration": "15s",
      "script": "Are you struggling to land AI product management roles? You're not alone..."
    }
  ]
}
```

### Response — error

```json
{
  "status": "error",
  "error": "Job not found"
}
```

### Progress phases

| `current` | `phase` |
|---|---|
| 0 | Analyzing your content… |
| 1 | Writing engaging scripts… |
| 2 | Planning cinematography… |
| 3 | Generating videos… |
| 4 | Finalizing your content… |

---

## `POST /api/generate-videos-ai`

Internal endpoint. Called by `processJobAsync` inside `/api/generate`. Generates AI-written video scripts via OpenAI.

### Request

```json
{
  "courseName": "AI Product Management Bootcamp",
  "description": "A 48-hour intensive...",
  "hookType": "pain-point",
  "brandTone": "educational"
}
```

### Response — success

```json
{
  "status": "success",
  "videos": [
    {
      "id": 1,
      "hookType": "Pain Point",
      "hookTitle": "Struggling to Land AI PM Roles?",
      "videoUrl": "https://via.placeholder.com/1080x1920.mp4",
      "thumbnailUrl": "https://via.placeholder.com/1080x1920/6366F1/FFFFFF?text=Pain+Point",
      "duration": "15s",
      "script": "Are you struggling..."
    }
  ]
}
```

### Response — error

```json
{
  "status": "error",
  "message": "Failed to generate videos with AI"
}
```

---

## n8n webhook

The Next.js backend also calls the n8n workflow directly:

```
POST https://bharat77.app.n8n.cloud/webhook/storyforge-generate
```

**Payload** (same as `/api/generate` body, plus `jobId`):
```json
{
  "courseName": "...",
  "description": "...",
  "hookType": "...",
  "brandTone": "...",
  "brandColor": "#6366F1",
  "images": [...],
  "jobId": "job_..."
}
```

**Response** (from n8n mock node):
```json
{
  "status": "success",
  "message": "Your 5 videos are ready!",
  "jobId": "job_...",
  "videos": [...],
  "totalVideos": 5,
  "generatedAt": "2026-04-15T14:00:00.000Z"
}
```

The n8n response is currently not used by the frontend — the job is completed via `/api/generate-videos-ai` instead. The n8n workflow is used for validation logging and will be extended in v0.3 to trigger real video rendering.
