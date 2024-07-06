import { initialDynamicResource, withHypermediaResource, withHypermediaAction, withLinkedHypermediaResource } from "@angular-architects/ngrx-hateoas";
import { signalStore, withHooks } from "@ngrx/signals";
import { initialFlightCreateVm, initialFlightEditVm } from "./flight.entities";

export const FlightState = signalStore(
  { providedIn: 'root' },
  withHypermediaResource('flightSearchVm', initialDynamicResource),
  withHypermediaResource('flightEditVm', initialFlightEditVm),
  withHypermediaAction('updateFlightConnection'),
  withHypermediaAction('updateFlightTimes'),
  withHypermediaAction('updateFlightOperator'),
  withHypermediaAction('updateFlightPrice'),
  withLinkedHypermediaResource('flightCreateVm', initialFlightCreateVm),
  withHypermediaAction('createFlight'),
  withHooks({
    onInit(store) {
        store.connectUpdateFlightConnection(store.flightEditVm.resource.flight.connection, 'update');
        store.connectUpdateFlightTimes(store.flightEditVm.resource.flight.times, 'update');
        store.connectUpdateFlightOperator(store.flightEditVm.resource.flight.operator, 'update');
        store.connectUpdateFlightPrice(store.flightEditVm.resource.flight.price, 'update');
        store.connectFlightCreateVm(store.flightSearchVm.resource, 'flightCreateVm');
        store.connectCreateFlight(store.flightCreateVm.resource.template, 'create');
    }
})
);
