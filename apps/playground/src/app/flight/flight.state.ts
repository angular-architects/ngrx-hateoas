import { withHypermediaResource, withHypermediaAction, withLinkedHypermediaResource, withHypermediaCollectionAction } from "@angular-architects/ngrx-hateoas";
import { signalStore, withHooks } from "@ngrx/signals";
import { Flight, initialFlightCreateVm, initialFlightEditVm } from "./flight.entities";

export const FlightState = signalStore(
  { providedIn: 'root' },
  withHypermediaResource('flightSearchVm', { flights: [], from: '', to: '' } as { flights: Flight[], from: string, to: string }),
  withHypermediaCollectionAction('deleteFlight'),
  withHypermediaResource('flightEditVm', initialFlightEditVm),
  withHypermediaAction('updateFlightConnection'),
  withHypermediaAction('updateFlightTimes'),
  withHypermediaAction('updateFlightOperator'),
  withHypermediaAction('updateFlightPrice'),
  withLinkedHypermediaResource('flightCreateVm', initialFlightCreateVm),
  withHypermediaAction('createFlight'),
  withHooks({
    onInit(store) {
        store._connectDeleteFlight(store.flightSearchVm.flights, 'id', 'delete');
        store._connectUpdateFlightConnection(store.flightEditVm.flight.connection, 'update');
        store._connectUpdateFlightTimes(store.flightEditVm.flight.times, 'update');
        store._connectUpdateFlightOperator(store.flightEditVm.flight.operator, 'update');
        store._connectUpdateFlightPrice(store.flightEditVm.flight.price, 'update');
        store._connectFlightCreateVm(store.flightSearchVm, 'flightCreateVm');
        store._connectCreateFlight(store.flightCreateVm.template, 'create');
    }
})
);
