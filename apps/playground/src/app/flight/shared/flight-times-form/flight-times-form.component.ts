import { Component, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { FlightTimes } from '../../flight.entities';

@Component({
    selector: 'app-flight-times-form',
    imports: [FormField],
    templateUrl: './flight-times-form.component.html'
})
export class FlightTimesFormComponent {
  times = input.required<FieldTree<FlightTimes>>();
}
