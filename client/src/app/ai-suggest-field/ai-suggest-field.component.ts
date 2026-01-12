import { Component, input, model, effect, computed, signal, InputSignal, inject } from '@angular/core';
import { FormValueControl, ValidationError } from '@angular/forms/signals';
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
  
  // FormValueControl optional inputs - will be bound by [field] directive
  // These are optional properties that can be undefined
  disabled?: InputSignal<boolean>;
  readonly?: InputSignal<boolean>;
  touched = model<boolean>(false);
  errors?: InputSignal<readonly ValidationError[]>;

  status = signal<Status>('idle');
  suggestion = signal<string>('');
  private dismissedForText = signal<string>('');
  private abortController: AbortController | null = null;
  private requestId = signal(0);

  private service = inject(AiSuggestService);

  private isFieldDisabled = computed(() => 
    (this.disabled?.() ?? false) || (this.readonly?.() ?? false)
  );

  constructor() {
    // Effect: value is already debounced at form level (1000ms)
    effect(() => {
      const currentValue = this.value();
      const currentRequestId = this.requestId();

      this.cancelPendingOperations();

      // Reset if empty or too short
      if (currentValue.length < 20) {
        this.resetToIdle();
        return;
      }

      // Check if dismissed for this exact text
      if (currentValue === this.dismissedForText()) {
        this.status.set('idle');
        return;
      }

      // Don't trigger if disabled or readonly
      if (this.isFieldDisabled()) {
        return;
      }

      // Request suggestion (value is already debounced)
      this.requestSuggestion(currentValue, currentRequestId);
    });
  }

  showSuggestion = computed(() => {
    const s = this.status();
    return s !== 'idle';
  });

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

  accept() {
    const suggestion = this.suggestion();
    if (suggestion.length === 0) return;

    const currentValue = this.value();
    const spacing = currentValue.length > 0 && !currentValue.endsWith(' ') ? ' ' : '';
    this.value.set(currentValue + spacing + suggestion);

    this.resetToIdle();
    this.dismissedForText.set('');
  }

  dismiss() {
    this.cancelPendingOperations();
    this.resetToIdle();
    this.dismissedForText.set(this.value());
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
           this.value() !== text || 
           text === this.dismissedForText();
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
