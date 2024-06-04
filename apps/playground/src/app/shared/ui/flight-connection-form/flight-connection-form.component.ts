import { Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FlightConnection, initialFlightConnection } from '../../models/flight';

@Component({
  selector: 'app-flight-connection-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './flight-connection-form.component.html'
})
export class FlightConnectionFormComponent {

  model = model(initialFlightConnection);

  isValid = false;

  patchModel(patchState: Partial<FlightConnection>) {
    this.model.update(currentValue => ({ ...currentValue, ...patchState }));
  }

}
