export function buildPrompt(text: string): string {
  return `You are helping a user write a description for a listing.

Current text: "${text}"

Continue the description naturally. Rules:
- Output ONLY the continuation text (no quotes, no markdown, no prefix)
- Write 1-2 sentences maximum
- Keep it concise and relevant
- Do not repeat what's already written

Continuation:`;
}

export function buildMessages(text: string): Array<{ role: string; content: string }> {
  const prompt = buildPrompt(text);
  return [
    {
      role: 'user',
      content: prompt
    }
  ];
}

export function sanitizeSuggestion(raw: string): string {
  // Remove quotes, markdown, and extra whitespace
  let cleaned = raw
    .replace(/^["']|["']$/g, '') // Remove surrounding quotes
    .replace(/^```[\w]*\n?|```$/g, '') // Remove code blocks
    .replace(/^\*\*|\*\*$/g, '') // Remove bold markers
    .replace(/^_|_$/g, '') // Remove italic markers
    .trim();
  
  // Hard cap at 220 chars
  if (cleaned.length > 220) {
    cleaned = cleaned.substring(0, 220).trim();
    // Try to end at a sentence boundary
    const lastPeriod = cleaned.lastIndexOf('.');
    const lastExclamation = cleaned.lastIndexOf('!');
    const lastQuestion = cleaned.lastIndexOf('?');
    const lastSentenceEnd = Math.max(lastPeriod, lastExclamation, lastQuestion);
    if (lastSentenceEnd > 150) {
      cleaned = cleaned.substring(0, lastSentenceEnd + 1);
    }
  }
  
  return cleaned;
}
