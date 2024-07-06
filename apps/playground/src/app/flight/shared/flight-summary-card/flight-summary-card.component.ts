import { Component, input } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GetLinkPipe, HasLinkPipe } from '@angular-architects/ngrx-hateoas';
import { Flight } from '../../flight.entities';

@Component({
  selector: 'app-flight-summary-card',
  standalone: true,
  imports: [DatePipe, HasLinkPipe, GetLinkPipe, CurrencyPipe, RouterLink],
  templateUrl: './flight-summary-card.component.html'
})
export class FlightSummaryCardComponent {
  flight = input<Flight>();
}
