import { Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { initialFlightTimes } from '../../flight.entities';
import { FormUpdateDirective } from '../../../shared/directives/form-update.directive';

@Component({
  selector: 'app-flight-times-form',
  standalone: true,
  imports: [FormsModule, FormUpdateDirective],
  templateUrl: './flight-times-form.component.html'
})
export class FlightTimesFormComponent {
  model = model(initialFlightTimes);
}
