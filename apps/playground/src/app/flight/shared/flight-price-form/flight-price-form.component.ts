import { Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { initialFlightPrice } from '../../flight.entities';
import { FormUpdateDirective } from '../../../shared/directives/form-update.directive';

@Component({
    selector: 'app-flight-price-form',
    imports: [FormsModule, FormUpdateDirective],
    templateUrl: './flight-price-form.component.html'
})
export class FlightPriceFormComponent {
  model = model(initialFlightPrice);
}
