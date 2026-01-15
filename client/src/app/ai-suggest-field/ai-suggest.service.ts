import { Injectable } from '@angular/core';

export interface SuggestResponse {
  suggestion: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiSuggestService {
  async suggest(text: string, signal?: AbortSignal): Promise<SuggestResponse> {
    const response = await fetch('/api/suggest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
      signal,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }
}
