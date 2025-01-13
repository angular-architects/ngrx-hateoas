import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { GetLinkPipe, HasLinkPipe, HateoasService } from '@angular-architects/ngrx-hateoas';
import { FlightSummaryCardComponent } from '../shared/flight-summary-card/flight-summary-card.component';
import { FlightSearchStore } from './flight-search.store';

@Component({
    selector: 'app-flight-search',
    imports: [FormsModule, RouterLink, HasLinkPipe, GetLinkPipe, FlightSummaryCardComponent],
    templateUrl: './flight-search.component.html'
})
export class FlightSearchComponent {
  hateoasService = inject(HateoasService);
  router = inject(Router);
  store = inject(FlightSearchStore);
  viewModel = this.store.getFlightSearchVmAsPatchable();
  from = this.viewModel['from'];
  to = this.viewModel['to'];

  onSearch() {
    let url = this.hateoasService.getLink(this.viewModel(), 'flightSearchVm')?.href;
    url = url + '?from=' + (this.from() ?? '') + '&to=' + (this.to() ?? '');
    this.router.navigate(['/flight/search', url]);
  }

  async onDelete(flightId: number) {
    await this.store.deleteFlight(flightId);
    await this.store.reloadFlightSearchVm();
  }
}
