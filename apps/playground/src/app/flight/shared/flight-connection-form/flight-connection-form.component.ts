import { Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { initialFlightConnection } from '../../flight.entities';
import { FormUpdateDirective } from '../../../shared/directives/form-update.directive';

@Component({
  selector: 'app-flight-connection-form',
  standalone: true,
  imports: [FormsModule, FormUpdateDirective],
  templateUrl: './flight-connection-form.component.html'
})
export class FlightConnectionFormComponent {
  model = model(initialFlightConnection);
}
