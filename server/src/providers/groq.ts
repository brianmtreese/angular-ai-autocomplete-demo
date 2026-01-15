import { AiProvider } from './provider';
import { buildMessages, sanitizeSuggestion } from '../prompt';

export class GroqProvider implements AiProvider {
  constructor(
    private readonly apiKey: string,
    private readonly model: string
  ) {}

  async generateSuggestion(input: { text: string }) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.model,
        messages: buildMessages(input.text),
        temperature: 0.4,
        max_tokens: 90
      })
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(body || `Groq error (${res.status})`);
    }

    const { choices } = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
    return sanitizeSuggestion(choices?.[0]?.message?.content ?? '');
  }
}
