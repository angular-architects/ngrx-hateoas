import { withHypermediaResource, withHypermediaAction, withWritableStateCopy, withExperimentalDeepWritableStateCopy, withExperimentalDeepWritableStateDelegate } from "@angular-architects/ngrx-hateoas";
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
  withExperimentalDeepWritableStateCopy(store => ({
    localFlight: store.flightEditVm.flight
  })),
  withHypermediaAction('updateFlightConnection', store => store.localFlight.connection, 'update'),
  withHypermediaAction('updateFlightTimes', store => store.localFlight.times, 'update'),
  withHypermediaAction('updateFlightOperator', store => store.localFlight.operator, 'update'),
  withHypermediaAction('updateFlightPrice', store => store.localFlight.price, 'update')
);


// Option 1: Reading a resource from server, creating a writable copy, and sending back the copy to the server
export const FlightEditViewStore1 = signalStore(
  { providedIn: 'root' },
  withHypermediaResource('flightEditVm', initialFlightEditVm),
  withWritableStateCopy(store => ({ writableFlightConnection: store.flightEditVm.flight.connection })),
  withHypermediaAction('updateFlightConnection', store => store.writableFlightConnection, 'update'),
);

// Option 2: Reading a resource from server, creating a deep writable copy (suited for template driven forms),
// and sending back the copy to the server
export const FlightEditViewStore2 = signalStore(
  { providedIn: 'root' },
  withHypermediaResource('flightEditVm', initialFlightEditVm),
  withExperimentalDeepWritableStateCopy(store => ({ deepWritableFlightConnection: store.flightEditVm.flight.connection })),
  withHypermediaAction('updateFlightConnection', store => store.deepWritableFlightConnection, 'update'),
);

// Option 3: Reading a resource from server, creating a delegate that directly modifies the "main" state of the store,
// and sending back parts of the main state to the server
export const FlightEditViewStore = signalStore(
  { providedIn: 'root' },
  withHypermediaResource('flightEditVm', initialFlightEditVm),
  withExperimentalDeepWritableStateDelegate(store => ({ delegatedDeepWritableFlightConnection: store.flightEditVm.flight.connection })),
  withHypermediaAction('updateFlightConnection', store => store.delegatedDeepWritableFlightConnection, 'update'),
);

