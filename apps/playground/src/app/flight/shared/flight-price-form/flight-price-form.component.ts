import { Component, input } from '@angular/core';
import { FormField, FieldTree } from '@angular/forms/signals';
import { FlightPrice } from '../../flight.entities';

@Component({
    selector: 'app-flight-price-form',
    imports: [FormField],
    templateUrl: './flight-price-form.component.html'
})
export class FlightPriceFormComponent {
  price = input.required<FieldTree<FlightPrice>>();
}
