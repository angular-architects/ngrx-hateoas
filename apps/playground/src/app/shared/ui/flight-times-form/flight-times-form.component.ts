import { AfterViewInit, Component, ViewChild, model } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { initialFlightTimes } from '../../models/flight';

@Component({
  selector: 'app-flight-times-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './flight-times-form.component.html'
})
export class FlightTimesFormComponent implements AfterViewInit {

  model = model(initialFlightTimes);

  @ViewChild('flightTimesForm')
  flightTimesForm : NgForm | null = null;

  isValid = false;

  ngAfterViewInit(): void {
    // this.flightTimesForm?.valueChanges?.pipe().subscribe((value) => { 
    //   this.model.set(value); 
    //   this.isValid = this.flightTimesForm?.valid ?? false; 
    // });
  }

}
