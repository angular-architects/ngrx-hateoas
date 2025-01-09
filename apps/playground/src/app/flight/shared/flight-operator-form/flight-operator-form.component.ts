import { Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Aircraft, initialFlightOperator } from '../../flight.entities';
import { FormUpdateDirective } from '../../../shared/directives/form-update.directive';

@Component({
    selector: 'app-flight-operator-form',
    imports: [FormsModule, FormUpdateDirective],
    templateUrl: './flight-operator-form.component.html'
})
export class FlightOperatorFormComponent {
  model = model(initialFlightOperator);
  aircrafts = input<Aircraft[]>([]);
}
