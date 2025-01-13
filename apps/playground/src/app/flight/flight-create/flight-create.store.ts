import { withHypermediaAction, withLinkedHypermediaResource } from "@angular-architects/ngrx-hateoas";
import { signalStore, withHooks } from "@ngrx/signals";
import { FlightConnection, FlightTimes, FlightOperator, Aircraft, initialFlightConnection, initialFlightTimes, initialFlightOperator } from "../flight.entities";
import { FlightSearchStore } from "../flight-search/flight-search.store";
import { inject } from "@angular/core";

export type FlightCreateVm = {
  template: {
      connection: FlightConnection,
      times: FlightTimes,
      operator: FlightOperator
  },
  aircrafts: Aircraft[]
};

export const initialFlightCreateVm: FlightCreateVm = {
  template: {
      connection: initialFlightConnection,
      times: initialFlightTimes,
      operator: initialFlightOperator
  },
  aircrafts: []
};

export const FlightCreateStore = signalStore(
  { providedIn: 'root' },
  withLinkedHypermediaResource('flightCreateVm', initialFlightCreateVm),
  withHypermediaAction('createFlight'),
  withHooks({
    onInit(store) {
        store._connectFlightCreateVm(inject(FlightSearchStore).flightSearchVm, 'flightCreateVm');
        store._connectCreateFlight(store.flightCreateVm.template, 'create');
    }
})
);
