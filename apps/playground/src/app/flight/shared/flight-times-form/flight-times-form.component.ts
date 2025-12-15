import { Component, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { FlightTimes } from '../../flight.entities';

@Component({
    selector: 'app-flight-times-form',
    imports: [Field],
    templateUrl: './flight-times-form.component.html'
})
export class FlightTimesFormComponent {
  times = input.required<FieldTree<FlightTimes>>();
}
