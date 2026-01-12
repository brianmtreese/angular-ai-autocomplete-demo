import { GroqProvider } from './groq';
import { AiProvider } from './provider';

function mustGet(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function getProvider(): AiProvider {
  const provider = (process.env.AI_PROVIDER ?? 'groq').toLowerCase();

  switch (provider) {
    case 'groq': {
      const key = mustGet('GROQ_API_KEY');
      let model = process.env.GROQ_MODEL ?? 'llama-3.1-8b-instant';
      
      // Map deprecated model names to their replacements
      if (model === 'llama3-8b-8192') {
        console.warn('Deprecated model "llama3-8b-8192" detected. Using "llama-3.1-8b-instant" instead.');
        model = 'llama-3.1-8b-instant';
      }
      
      return new GroqProvider(key, model);
    }
    default:
      throw new Error(`Unsupported AI_PROVIDER: ${provider}`);
  }
}
