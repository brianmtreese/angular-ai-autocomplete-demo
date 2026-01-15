# AI-powered Suggestion Field in Angular

A minimal but production-shaped demo showcasing AI-powered suggestion field in Angular without wrecking UX.

## Features

- **Manual trigger**: User clicks the sparkle button to request AI suggestions (no auto-trigger)
- **Preview-only suggestions**: AI suggestions appear below the textarea and never auto-write
- **Explicit acceptance**: User must click "Accept" to accept suggestions
- **Request cancellation**: Clicking the button again cancels in-flight requests using AbortController
- **Rate limiting**: 10 requests per minute per IP address
- **Request timeout**: 10-second timeout for AI provider calls (15-second HTTP timeout)
- **Graceful error handling**: Shows "AI unavailable" message and preserves user input

## Setup

### Prerequisites

- Node.js 18+
- npm

### Installation

Install all dependencies:
```bash
npm run install:all
```

### Configuration

Create a `server/.env` file with your Groq API key:
```
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-8b-instant
PORT=3500
AI_PROVIDER=groq
```

**Note:** The `PORT` should be set to `3500` to match the client proxy configuration. If you use a different port, update `client/proxy.conf.json` and `client/vite.config.ts` accordingly.

**Getting a Groq API Key:**
1. Sign up at https://console.groq.com
2. Go to API Keys section
3. Create a new API key
4. Copy it to your `.env` file

### Running

Run both server and client together:
```bash
npm run dev
```

The server runs on `http://localhost:3500` (or the port specified in `.env`) and the client runs on the default Angular dev server port (typically `http://localhost:4200`). The client proxy configuration forwards `/api` requests to the server.

## Usage

1. Start typing a description in the textarea
2. Click the **sparkle button** (✨) next to the textarea to request an AI suggestion
3. Wait for the suggestion to appear below the textarea (shows "Thinking..." while loading)
4. Click **Accept** to replace your current text with the suggestion
5. Continue typing or click the button again to get a new suggestion

## API Endpoints

- `GET /health` - Health check
- `POST /api/suggest` - Get AI suggestion
  - Request: `{ text: string }`
    - `text`: The current description text to continue
  - Response: `{ suggestion: string }`
  - Rate limit: 10 requests per minute per IP (returns 429 if exceeded)
  - Timeout: 10 seconds for AI provider call, 15 seconds total HTTP timeout (returns 504 if exceeded)

  ## Related Resources
  🎥 YouTube Tutorial: https://youtu.be/g5LLwr5YTUg