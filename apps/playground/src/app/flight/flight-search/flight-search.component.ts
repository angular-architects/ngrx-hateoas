import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FlightSummaryCardComponent } from '../../shared/ui/flight-summary-card/flight-summary-card.component';
import { FlightState } from '../flight.state';
import { GetLinkPipe, HasLinkPipe } from '@angular-architects/ngrx-hateoas';

@Component({
  selector: 'app-flight-search',
  standalone: true,
  imports: [FormsModule, RouterLink, FlightSummaryCardComponent, HasLinkPipe, GetLinkPipe],
  templateUrl: './flight-search.component.html'
})
export class FlightSearchComponent {
  state = inject(FlightState);
  viewModel = this.state.getFlightSearchVmAsPatchable();
  flightCreate = this.state.flightCreateVm;
}
