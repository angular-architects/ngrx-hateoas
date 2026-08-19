import { Component, input } from '@angular/core';
import { FlightConnection } from '../../flight.entities';
import { FieldTree, FormField } from '@angular/forms/signals';

@Component({
    selector: 'app-flight-connection-form',
    imports: [FormField],
    templateUrl: './flight-connection-form.component.html'
})
export class FlightConnectionFormComponent {
  connection = input.required<FieldTree<FlightConnection>>();
}
