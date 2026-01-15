export interface SuggestionRequest {
  text: string;
}

export interface AiProvider {
  generateSuggestion(request: SuggestionRequest): Promise<string>;
}
