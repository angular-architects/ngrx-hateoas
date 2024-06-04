import { AfterViewInit, Component, Input, ViewChild, model } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { initialFlightOperator } from '../../models/flight';
import { Aircraft } from '../../models/aircraft';

@Component({
  selector: 'app-flight-operator-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './flight-operator-form.component.html'
})
export class FlightOperatorFormComponent implements AfterViewInit {

  model = model(initialFlightOperator);

  @Input()
  aircrafts = new Array<Aircraft>();

  @ViewChild('flightOperatorForm')
  flightOperatorForm : NgForm | null = null;

  isValid = false;

  ngAfterViewInit(): void {
    this.flightOperatorForm?.valueChanges?.subscribe((value) => { 
      this.model.set(value); 
      this.isValid = this.flightOperatorForm?.valid ?? false; 
    });
  }
}
