import { Component, input, output } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GetLinkPipe, HasLinkPipe, HasActionPipe } from '@angular-architects/ngrx-hateoas';
import { Flight } from '../../flight.entities';

@Component({
    selector: 'app-flight-summary-card',
    imports: [DatePipe, HasLinkPipe, HasActionPipe, GetLinkPipe, CurrencyPipe, RouterLink],
    templateUrl: './flight-summary-card.component.html'
})
export class FlightSummaryCardComponent {
  flight = input<Flight>();
  delete = output<void>();
}
