import { withHypermediaResource, withHypermediaAction, withWritableStateCopy, withExperimentalDeepWritableStateCopy, withExperimentalDeepWritableStateDelegate, withDeepWritableStateProjection } from "@angular-architects/ngrx-hateoas";
import { signalStore, withMethods } from "@ngrx/signals";
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
  withWritableStateCopy(store => ({ localFlight: store.flightEditVm.flight })),
  withHypermediaAction('updateFlightConnection', store => store.localFlight.connection, 'update'),
  withHypermediaAction('updateFlightTimes', store => store.localFlight.times, 'update'),
  withHypermediaAction('updateFlightOperator', store => store.localFlight.operator, 'update'),
  withHypermediaAction('updateFlightPrice', store => store.localFlight.price, 'update'),
  withMethods(store => ({
    reset() {
      store.localFlight.set(store.flightEditVm.flight());
    }
  }))
);


// Option 1: Reading a resource from server, creating a writable copy, and sending back the copy to the server
export const FlightEditViewStore1 = signalStore(
  { providedIn: 'root' },
  withHypermediaResource('flightEditVm', initialFlightEditVm),
  withWritableStateCopy(store => ({ writableFlightConnectionCopy: store.flightEditVm.flight.connection })),
  withHypermediaAction('updateFlightConnection', store => store.writableFlightConnectionCopy, 'update'),
);

// Option 2: Reading a resource from server, creating a deep writable copy (suited for template driven forms),
// and sending back the copy to the server
export const FlightEditViewStore2 = signalStore(
  { providedIn: 'root' },
  withHypermediaResource('flightEditVm', initialFlightEditVm),
  withExperimentalDeepWritableStateCopy(store => ({ deepWritableFlightConnectionCopy: store.flightEditVm.flight.connection })),
  withHypermediaAction('updateFlightConnection', store => store.deepWritableFlightConnectionCopy, 'update'),
);

// Option 3: Reading a resource from server, creating a delegate that directly modifies the "main" state of the store,
// and sending back parts of the main state to the server
export const FlightEditViewStore3 = signalStore(
  { providedIn: 'root' },
  withHypermediaResource('flightEditVm', initialFlightEditVm),
  withExperimentalDeepWritableStateDelegate(store => ({ deepWritableFlightConnectionDelegate: store.flightEditVm.flight.connection })),
  withHypermediaAction('updateFlightConnection', store => store.flightEditVm.flight.connection, 'update'),
);

// Option 4: Reading a resource from server, creating a deep writable state projection (suited for reactive forms), 
// and sending back parts of the main state to the server
export const FlightEditViewStore4 = signalStore(
  { providedIn: 'root' },
  withHypermediaResource('flightEditVm', initialFlightEditVm),
  withDeepWritableStateProjection(store => ({ flightFormModel: { from: store.flightEditVm.flight.connection.from, to: store.flightEditVm.flight.connection.to } })),
  withHypermediaAction('updateFlightConnection', store => store.flightEditVm.flight.connection, 'update'),
);

