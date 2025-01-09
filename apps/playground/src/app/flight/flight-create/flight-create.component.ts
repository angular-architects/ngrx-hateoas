import { Component, inject, signal } from '@angular/core';
import { Location } from '@angular/common';
import { ActionCardComponent } from '../../shared/ui/action-card/action-card.component';
import { FlightConnectionFormComponent } from '../shared/flight-connection-form/flight-connection-form.component';
import { FlightOperatorFormComponent } from '../shared/flight-operator-form/flight-operator-form.component';
import { FlightTimesFormComponent } from '../shared/flight-times-form/flight-times-form.component';
import { FlightState } from '../flight.state';

@Component({
    selector: 'app-flight-create',
    imports: [ActionCardComponent, FlightConnectionFormComponent, FlightOperatorFormComponent, FlightTimesFormComponent],
    templateUrl: './flight-create.component.html'
})
export class FlightCreateComponent {
  location = inject(Location);
  flightState = inject(FlightState);
  
  viewModel = this.flightState.getFlightCreateVmAsPatchable();

  saveEnabled = this.flightState.createFlightState.isAvailable;

  aircrafts = this.viewModel.aircrafts;
  
  flightConnection = this.viewModel.template.connection;
  flightTimes = this.viewModel.template.times;
  flightOperator = this.viewModel.template.operator;

  async onSaveFlight() {
    await this.flightState.createFlight();
    this.location.back();
  }
}
