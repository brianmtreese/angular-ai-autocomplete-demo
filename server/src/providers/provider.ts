export interface SuggestionRequest {
  context: string;
  text: string;
}

export interface AiProvider {
  generateSuggestion(request: SuggestionRequest): Promise<string>;
}
