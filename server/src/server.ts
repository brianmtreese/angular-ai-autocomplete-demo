import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { getProvider } from './providers/index.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { withTimeout } from './utils/timeout.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Trust proxy for accurate IP addresses (important for rate limiting)
app.set('trust proxy', 1);

// Initialize provider
let provider;
try {
  provider = getProvider();
  console.log(`AI Provider initialized: ${process.env.AI_PROVIDER || 'groq'}`);
} catch (error) {
  console.error('Failed to initialize AI provider:', error);
  process.exit(1);
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Suggestion endpoint with rate limiting
app.post('/api/suggest', rateLimiter, async (req, res) => {
  // Set timeout to prevent hanging connections
  req.setTimeout(15000, () => {
    if (!res.headersSent) {
      res.status(504).json({ error: 'Request timeout' });
    }
  });

  try {
    const { text } = req.body;

    // Validate payload exists
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ 
        error: 'Invalid payload: request body must be an object' 
      });
    }

    // Validate payload types
    if (typeof text !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid payload: text must be a string' 
      });
    }

    // Generate suggestion with timeout (10 seconds)
    const suggestion = await withTimeout(
      provider.generateSuggestion({ text }),
      10000
    );
    
    if (!res.headersSent) {
      res.json({ suggestion });
    }
  } catch (error) {
    console.error('Error generating suggestion:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('Error details:', { errorMessage, errorStack });
    
    // Only send response if headers haven't been sent
    if (!res.headersSent) {
      // Handle timeout errors specifically
      const statusCode = errorMessage.includes('timeout') ? 504 : 500;
      res.status(statusCode).json({ 
        error: errorMessage 
      });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
