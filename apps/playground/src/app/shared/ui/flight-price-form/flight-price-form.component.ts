import { AfterViewInit, Component, ViewChild, model } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { initialFlightPrice } from '../../models/flight';

@Component({
  selector: 'app-flight-price-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './flight-price-form.component.html'
})
export class FlightPriceFormComponent implements AfterViewInit {

  model = model(initialFlightPrice);

  @ViewChild('flightTimesForm')
  flightTimesForm : NgForm | null = null;

  isValid = false;

  ngAfterViewInit(): void {
    this.flightTimesForm?.valueChanges?.subscribe((value) => { 
      this.model.set(value); 
      this.isValid = this.flightTimesForm?.valid ?? false; 
    });
  }
}
