import { Component, input } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Flight } from '../../models/flight';

@Component({
  selector: 'app-flight-summary-card',
  standalone: true,
  imports: [DatePipe, CurrencyPipe, RouterLink],
  templateUrl: './flight-summary-card.component.html'
})
export class FlightSummaryCardComponent {
  flight = input<Flight>();
}
