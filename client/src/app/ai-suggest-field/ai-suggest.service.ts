import { Injectable } from '@angular/core';

export interface SuggestRequest {
  context: string;
  text: string;
}

export interface SuggestResponse {
  suggestion: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiSuggestService {
  async suggest(request: SuggestRequest, signal?: AbortSignal): Promise<SuggestResponse> {
    const response = await fetch('/api/suggest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }
}
