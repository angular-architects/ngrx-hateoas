import { withHypermediaResource, withHypermediaAction, withWritableStateCopy } from "@angular-architects/ngrx-hateoas";
import { signalStore } from "@ngrx/signals";
import { Aircraft, Flight, initialFlight } from "../flight.entities";

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
  withWritableStateCopy(store => ({
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


