import { Component, input, model, computed, signal, inject } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { AiSuggestService } from './ai-suggest.service';

type Status = 'idle' | 'loading' | 'ready' | 'error';

@Component({
  selector: 'ai-suggest-field',
  templateUrl: './ai-suggest-field.component.html',
  styleUrl: './ai-suggest-field.component.css'
})
export class AiSuggestFieldComponent implements FormValueControl<string> {
  label = input.required<string>();
  placeholder = input<string>('');
  context = input<string>('');
  
  // FormValueControl implementation - required
  value = model<string>('');
  touched = model<boolean>(false);

  status = signal<Status>('idle');
  suggestion = signal<string>('');
  private abortController: AbortController | null = null;
  private requestId = signal(0);

  private service = inject(AiSuggestService);

  isSubmitDisabled = computed(() => 
    this.value().length < 20 || 
    this.status() === 'loading'
  );

  onInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    this.value.set(target.value);
    this.requestId.update(id => id + 1);
  }

  onBlur() {
    this.touched.set(true);
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Tab' && this.status() === 'ready' && this.suggestion().length > 0) {
      event.preventDefault();
      this.accept();
    }
  }

  submitRequest() {
    const currentValue = this.value();
    
    // Don't submit if empty or too short
    if (currentValue.length < 20) {
      return;
    }

    // Cancel any pending operations
    this.cancelPendingOperations();
    
    // Increment request ID and submit
    this.requestId.update(id => id + 1);
    this.requestSuggestion(currentValue, this.requestId());
  }

  accept() {
    const suggestion = this.suggestion();
    if (suggestion.length === 0) return;

    // Replace the entire current value with the suggestion
    this.value.set(suggestion);

    this.resetToIdle();
  }

  private cancelPendingOperations() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  private resetToIdle() {
    this.status.set('idle');
    this.suggestion.set('');
  }

  private isStaleRequest(requestId: number, text: string): boolean {
    return this.requestId() !== requestId || 
           this.value() !== text;
  }

  private async requestSuggestion(text: string, requestId: number) {
    this.abortController = new AbortController();
    this.status.set('loading');

    try {
      const response = await this.service.suggest(
        { context: this.context(), text },
        this.abortController.signal
      );

      if (this.isStaleRequest(requestId, text)) return;

      if (response.suggestion?.length > 0) {
        this.suggestion.set(response.suggestion);
        this.status.set('ready');
      } else {
        this.resetToIdle();
      }
    } catch (error: any) {
      if (error.name === 'AbortError' || this.isStaleRequest(requestId, text)) {
        return;
      }
      this.status.set('error');
      this.suggestion.set('');
    } finally {
      this.abortController = null;
    }
  }
}
