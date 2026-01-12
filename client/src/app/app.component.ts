import { Component, computed, signal } from '@angular/core';
import { form, Field, schema } from '@angular/forms/signals';
import { AiSuggestFieldComponent } from './ai-suggest-field/ai-suggest-field.component';
import { ListingModel } from './models/listing.schema';

@Component({
  selector: 'app-root',
  imports: [AiSuggestFieldComponent, Field],
  templateUrl: './app.component.html'
})
export class AppComponent {
  private model = signal<ListingModel>({
    title: '',
    description: '',
  });

  private listingFormSchema = schema<ListingModel>(() => {});

  protected formTree = form(this.model, this.listingFormSchema);

  protected payloadPreview = computed(() => {
    const formValue = {
      title: this.formTree.title().value(),
      description: this.formTree.description().value(),
    };
    return JSON.stringify(formValue, null, 2);
  });
}
