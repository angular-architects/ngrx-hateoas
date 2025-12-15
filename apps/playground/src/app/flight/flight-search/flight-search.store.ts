import { withHypermediaResource, withHypermediaCollectionAction, withExperimentalDeepWritableStateDelegate } from "@angular-architects/ngrx-hateoas";
import { signalStore, withHooks } from "@ngrx/signals";
import { Flight } from "../flight.entities";
import { inject } from "@angular/core";
import { AppStore } from "../../app.store";

export type FlightSearchVm = {
  from: string | null,
  to: string | null,
  flights: Flight[]
}

const initialFlightSearchVm: FlightSearchVm = {
  from: null,
  to: null,
  flights: []
}

export const FlightSearchStore = signalStore(
  { providedIn: 'root' },
  withHypermediaResource('flightSearchVm', initialFlightSearchVm),
  withExperimentalDeepWritableStateDelegate(store => ({
    flightSearchVmToDelegate: store.flightSearchVm.to,
    flightSearchVmFromDelegate: store.flightSearchVm.from
  })),
  withHypermediaCollectionAction('deleteFlight', store => store.flightSearchVm.flights, 'delete'),
  withHypermediaCollectionAction('updateConnection', store => store.flightSearchVm.flights, 'update', { idLookup: flight => flight.id, resourceLookup: flight => flight.connection }),
  withHooks({
    onInit(store) {
      store.loadFlightSearchVmFromLink(inject(AppStore).rootApi(), 'flightSearchVm');
    }
  })
);
