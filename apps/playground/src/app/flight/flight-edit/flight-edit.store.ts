import { withHypermediaResource, withHypermediaAction } from "@angular-architects/ngrx-hateoas";
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
  withHypermediaAction('updateFlightConnection', store => store.flightEditVm.flight.connection, 'update'),
  withHypermediaAction('updateFlightTimes', store => store.flightEditVm.flight.times, 'update'),
  withHypermediaAction('updateFlightOperator', store => store.flightEditVm.flight.operator, 'update'),
  withHypermediaAction('updateFlightPrice', store => store.flightEditVm.flight.price, 'update')
);
