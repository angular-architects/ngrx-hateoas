import { Component, input } from '@angular/core';
import { FlightConnection } from '../../flight.entities';
import { Field, FieldTree } from '@angular/forms/signals';

@Component({
    selector: 'app-flight-connection-form',
    imports: [Field],
    templateUrl: './flight-connection-form.component.html'
})
export class FlightConnectionFormComponent {
  connection = input.required<FieldTree<FlightConnection>>();
}
