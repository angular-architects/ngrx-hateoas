import { Component, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { Aircraft, FlightOperator } from '../../flight.entities';

@Component({
    selector: 'app-flight-operator-form',
    imports: [Field],
    templateUrl: './flight-operator-form.component.html'
})
export class FlightOperatorFormComponent {
  operator = input.required<FieldTree<FlightOperator>>();
  aircrafts = input<Aircraft[]>([]);
}
