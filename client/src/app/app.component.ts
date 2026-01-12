import { Component, computed, signal } from '@angular/core';
import { form, Field, schema, debounce } from '@angular/forms/signals';
import { AiSuggestFieldComponent } from './ai-suggest-field/ai-suggest-field.component';
import { ListingModel } from './models/listing.schema';

@Component({
  selector: 'app-root',
  imports: [AiSuggestFieldComponent, Field],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private model = signal<ListingModel>({
    title: '',
    description: '',
  });

  private listingFormSchema = schema<ListingModel>((fields) => {
    debounce(fields.description, 1000); // Debounce AI suggestions by 1000ms
  });

  protected formTree = form(this.model, this.listingFormSchema);

  protected payloadPreview = computed(() => {
    const formValue = {
      title: this.formTree.title().value(),
      description: this.formTree.description().value(),
    };
    return JSON.stringify(formValue, null, 2);
  });
}
