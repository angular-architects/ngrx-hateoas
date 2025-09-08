import { withHypermediaResource, withHypermediaCollectionAction } from "@angular-architects/ngrx-hateoas";
import { signalStore, withComputed, withHooks } from "@ngrx/signals";
import { Flight } from "../flight.entities";
import { computed, inject } from "@angular/core";
import { AppStore } from "../../app.store";
import { computeMsgId } from "@angular/compiler";

export type FlightSearchVm = {
  from: string,
  to: string,
  flights: Flight[]
}

const initialFlightSearchVm: FlightSearchVm = {
  from: '',
  to: '',
  flights: []
}

export const FlightSearchStore = signalStore(
  { providedIn: 'root' },
  withHypermediaResource('flightSearchVm', initialFlightSearchVm),
  withComputed(store => ({
    flights: computed(() => store.flightSearchVm.flights()),
  })),
  withHypermediaCollectionAction('deleteFlight', store => store.flights, 'delete'),
  withHypermediaCollectionAction('updateConnection', store => store.flightSearchVm.flights, 'update', { idLookup: flight => flight.id, resourceLookup: flight => flight.connection }),
  withHooks({
    onInit(store) {
      store.loadFlightSearchVmFromLink(inject(AppStore).rootApi(), 'flightSearchVm');
    }
  })
);
