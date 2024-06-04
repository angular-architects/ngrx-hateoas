import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { ActionCardComponent } from '../../shared/ui/action-card/action-card.component';
import { FlightConnectionFormComponent } from '../../shared/ui/flight-connection-form/flight-connection-form.component';
import { FlightOperatorFormComponent } from '../../shared/ui/flight-operator-form/flight-operator-form.component';
import { FlightTimesFormComponent } from '../../shared/ui/flight-times-form/flight-times-form.component';
import { FlightState } from '../flight.state';

@Component({
  selector: 'app-flight-create',
  standalone: true,
  imports: [ActionCardComponent, FlightConnectionFormComponent, FlightOperatorFormComponent, FlightTimesFormComponent],
  templateUrl: './flight-create.component.html'
})
export class FlightCreateComponent {

  _flightState = inject(FlightState);
  _location = inject(Location);

  viewModel = this._flightState.getFlightCreateVmAsPatchable();

  onSaveFlight() {
    this._flightState.executeCreateFlight();
  }

}
