import { withHypermediaResource, withHypermediaAction } from "@angular-architects/ngrx-hateoas";
import { signalStore, withHooks } from "@ngrx/signals";
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
  withHypermediaAction('updateFlightConnection'),
  withHypermediaAction('updateFlightTimes'),
  withHypermediaAction('updateFlightOperator'),
  withHypermediaAction('updateFlightPrice'),
  withHooks({
    onInit(store) {
      store._connectUpdateFlightConnection(store.flightEditVm.flight.connection, 'update');
      store._connectUpdateFlightTimes(store.flightEditVm.flight.times, 'update');
      store._connectUpdateFlightOperator(store.flightEditVm.flight.operator, 'update');
      store._connectUpdateFlightPrice(store.flightEditVm.flight.price, 'update');
    }
  })
);
