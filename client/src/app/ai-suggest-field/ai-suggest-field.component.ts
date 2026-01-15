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
  value = model<string>('');
  touched = model<boolean>(false);

  protected status = signal<Status>('idle');
  protected suggestion = signal<string>('');
  
  private abortController: AbortController | null = null;

  private service = inject(AiSuggestService);

  protected onInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    this.value.set(target.value);
  }

  protected onBlur() {
    this.touched.set(true);
  }

  protected submitRequest() {
    this.cancelPendingOperations();
    this.requestSuggestion(this.value());
  }

  protected accept() {
    this.value.set(this.suggestion());
    this.resetToIdle();
  }

  protected isSubmitDisabled = computed(() =>
    this.status() === 'loading'
  );

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

  private async requestSuggestion(text: string) {
    this.abortController = new AbortController();
    this.status.set('loading');

    try {
      const response = await this.service.suggest(
        text,
        this.abortController.signal
      );

      if (response.suggestion?.length > 0) {
        this.suggestion.set(response.suggestion);
        this.status.set('ready');
      } else {
        this.resetToIdle();
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return;
      }
      this.status.set('error');
      this.suggestion.set('');
    } finally {
      this.abortController = null;
    }
  }
}
