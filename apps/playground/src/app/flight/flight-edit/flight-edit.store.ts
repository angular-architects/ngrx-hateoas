import { withHypermediaResource, withHypermediaAction, withWritableState } from "@angular-architects/ngrx-hateoas";
import { signalStore } from "@ngrx/signals";
import { Aircraft, Flight, initialFlight } from "../flight.entities";
import { effect } from "@angular/core";

export type FlightEditVm = {
  flight: Flight;
  aircrafts: Aircraft[];
}

export const initialFlightEditVm: FlightEditVm = {
  flight: initialFlight,
  aircrafts: []
}

export const FlightEditStore = signalStore(
  { providedIn: 'root' },
  withHypermediaResource('flightEditVm', initialFlightEditVm),
  withWritableState(store => ({
    flightConnection: store.flightEditVm.flight.connection,
    flightTimes: store.flightEditVm.flight.times,
    flightOperator: store.flightEditVm.flight.operator,
    flightPrice: store.flightEditVm.flight.price
  })),
  withHypermediaAction('updateFlightConnection', store => store.flightConnection, 'update'),
  withHypermediaAction('updateFlightTimes', store => store.flightTimes, 'update'),
  withHypermediaAction('updateFlightOperator', store => store.flightOperator, 'update'),
  withHypermediaAction('updateFlightPrice', store => store.flightPrice, 'update')
);


export const FlightEditViewStore = signalStore(
  { providedIn: 'root' },
  // 1. Step Define a resource with initial value
  withHypermediaResource('flightEditVm', initialFlightEditVm),
  // 2. Step map certain parts of the state to writable signals
  withWritableState(store => ({
    flightConnection: store.flightEditVm.flight.connection
  })),
  // 3. Step define actions that operate on the writable signals
  withHypermediaAction('updateFlightConnection', store => store.flightConnection, 'update')
);


