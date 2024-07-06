import { Component, inject } from '@angular/core';
import { ActionCardComponent } from '../../shared/ui/action-card/action-card.component';
import { FlightConnectionFormComponent } from '../shared/flight-connection-form/flight-connection-form.component';
import { FlightOperatorFormComponent } from '../shared/flight-operator-form/flight-operator-form.component';
import { FlightPriceFormComponent } from '../shared/flight-price-form/flight-price-form.component';
import { FlightTimesFormComponent } from '../shared/flight-times-form/flight-times-form.component';
import { FlightState } from '../flight.state';

@Component({
  selector: 'app-flight-edit',
  standalone: true,
  imports: [ActionCardComponent, FlightConnectionFormComponent, FlightOperatorFormComponent, FlightTimesFormComponent, FlightPriceFormComponent],
  templateUrl: './flight-edit.component.html'
})
export class FlightEditComponent {
  flightState = inject(FlightState);
  viewModel = this.flightState.getFlightEditVmAsPatchable();
  flightConnection = this.viewModel.flight.connection;
  flightTimes = this.viewModel.flight.times;
  flightOperator = this.viewModel.flight.operator;
  flightPrice = this.viewModel.flight.price;
}
