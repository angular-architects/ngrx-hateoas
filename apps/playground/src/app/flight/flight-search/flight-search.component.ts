import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { GetLinkPipe, HasLinkPipe, HateoasService } from '@angular-architects/ngrx-hateoas';
import { FlightSummaryCardComponent } from '../shared/flight-summary-card/flight-summary-card.component';
import { FlightState } from '../flight.state';

@Component({
  selector: 'app-flight-search',
  standalone: true,
  imports: [FormsModule, RouterLink, HasLinkPipe, GetLinkPipe, FlightSummaryCardComponent],
  templateUrl: './flight-search.component.html'
})
export class FlightSearchComponent {
  hateoasService = inject(HateoasService);
  router = inject(Router);
  flightState = inject(FlightState);
  showCreate = signal(true);
  viewModel = this.flightState.getFlightSearchVmAsPatchable();
  from = this.viewModel['from'];
  to = this.viewModel['to'];

  onSearch() {
    let url = this.hateoasService.getLink(this.viewModel(), 'flightSearchVm')?.href;
    url = url + '?from=' + (this.from() ?? '') + '&to=' + (this.to() ?? '');
    this.router.navigate(['/flight/search', url]);
  }
}
