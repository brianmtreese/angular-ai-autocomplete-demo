# AI-powered Autocomplete in Angular

A minimal but production-shaped demo showcasing AI-powered autocomplete in Angular without wrecking UX.

## Features

- **Preview-only suggestions**: AI suggestions never auto-write into the textarea
- **Explicit acceptance**: User must click "Accept" or press Tab to accept suggestions
- **Smart debouncing**: Waits 1000ms after typing stops before requesting AI
- **Request cancellation**: Typing again cancels in-flight requests
- **Stale request handling**: Late results are discarded if user has typed since request started
- **Graceful error handling**: Shows "AI unavailable" message and allows retry

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

1. Enter a title for your listing
2. Start typing a description (minimum 20 characters)
3. After 1000ms of no typing, AI suggestions will appear below the textarea
4. Press **Tab** or click **Accept** to append the suggestion
5. Click **Dismiss** to clear the suggestion

## API Endpoints

- `GET /health` - Health check
- `POST /api/suggest` - Get AI suggestion
  - Request: `{ context: string, text: string }`
  - Response: `{ suggestion: string }`
