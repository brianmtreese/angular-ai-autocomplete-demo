# AI-powered Autocomplete in Angular

A minimal but production-shaped demo showcasing AI-powered autocomplete in Angular without wrecking UX.

## Features

- **Manual trigger**: User clicks the sparkle button to request AI suggestions (no auto-trigger)
- **Preview-only suggestions**: AI suggestions appear below the textarea and never auto-write
- **Explicit acceptance**: User must click "Accept" or press Tab to accept suggestions
- **Request cancellation**: Clicking the button again cancels in-flight requests
- **Stale request handling**: Late results are discarded if user has typed or clicked again since request started
- **Context-aware**: Uses the listing title as context for generating description suggestions
- **Rate limiting**: 10 requests per minute per IP address
- **Request timeout**: 10-second timeout for AI requests
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
PORT=3000
```

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

The server runs on `http://localhost:3000` and the client on `http://localhost:4200`.

## Usage

1. Enter a title for your listing (used as context for AI suggestions)
2. Start typing a description in the textarea
3. Once you've typed at least 20 characters, click the **sparkle button** (✨) next to the textarea to request an AI suggestion
4. Wait for the suggestion to appear below the textarea (shows "Thinking..." while loading)
5. Press **Tab** or click **Accept** to replace your current text with the suggestion
6. Continue typing or click the button again to get a new suggestion

## API Endpoints

- `GET /health` - Health check
- `POST /api/suggest` - Get AI suggestion
  - Request: `{ context: string, text: string }`
    - `context`: The listing title (used to provide context for the description)
    - `text`: The current description text (minimum 20 characters)
  - Response: `{ suggestion: string }`
  - Rate limit: 10 requests per minute per IP (returns 429 if exceeded)
  - Timeout: 10 seconds (returns 504 if exceeded)