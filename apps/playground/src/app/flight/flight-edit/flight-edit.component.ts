import { Component, inject } from '@angular/core';
import { ActionCardComponent } from '../../shared/ui/action-card/action-card.component';
import { FlightConnectionFormComponent } from '../../shared/ui/flight-connection-form/flight-connection-form.component';
import { FlightOperatorFormComponent } from '../../shared/ui/flight-operator-form/flight-operator-form.component';
import { FlightPriceFormComponent } from '../../shared/ui/flight-price-form/flight-price-form.component';
import { FlightTimesFormComponent } from '../../shared/ui/flight-times-form/flight-times-form.component';
import { FlightState } from '../flight.state';

@Component({
  selector: 'app-flight-edit',
  standalone: true,
  imports: [ActionCardComponent, FlightConnectionFormComponent, FlightOperatorFormComponent, FlightTimesFormComponent, FlightPriceFormComponent],
  templateUrl: './flight-edit.component.html'
})
export class FlightEditComponent {
  state = inject(FlightState);
  model = this.state.getFlightEditVmAsPatchable();
}
