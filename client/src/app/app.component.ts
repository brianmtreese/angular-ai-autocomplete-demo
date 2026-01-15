import { Component, computed, signal } from '@angular/core';
import { form, Field } from '@angular/forms/signals';
import { AiSuggestFieldComponent } from './ai-suggest-field/ai-suggest-field.component';

interface ListingModel {
  title: string;
  description: string;
}

@Component({
  selector: 'app-root',
  imports: [Field, AiSuggestFieldComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  private model = signal<ListingModel>({
    title: '',
    description: '',
  });

  protected formTree = form(this.model);

  protected payloadPreview = computed(() => {
    const formValue = {
      title: this.formTree.title().value(),
      description: this.formTree.description().value(),
    };
    return JSON.stringify(formValue, null, 2);
  });
}
