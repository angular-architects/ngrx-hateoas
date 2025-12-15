import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { ActionCardComponent } from '../../shared/ui/action-card/action-card.component';
import { FlightConnectionFormComponent } from '../shared/flight-connection-form/flight-connection-form.component';
import { FlightOperatorFormComponent } from '../shared/flight-operator-form/flight-operator-form.component';
import { FlightTimesFormComponent } from '../shared/flight-times-form/flight-times-form.component';
import { FlightCreateStore } from './flight-create.store';
import { flightConnectionSchema, flightOperatorSchema, flightTimesSchema } from '../flight.entities';
import { apply, form } from '@angular/forms/signals';

@Component({
    selector: 'app-flight-create',
    imports: [ActionCardComponent, FlightConnectionFormComponent, FlightOperatorFormComponent, FlightTimesFormComponent],
    templateUrl: './flight-create.component.html'
})
export class FlightCreateComponent {
  location = inject(Location);
  store = inject(FlightCreateStore);
  templateForm = form(this.store.localTemplate, template => {
    apply(template.connection, flightConnectionSchema);
    apply(template.times, flightTimesSchema);
    apply(template.operator, flightOperatorSchema);
  });

  async onSaveFlight() {
    await this.store.createFlight();
    this.location.back();
  }
}
