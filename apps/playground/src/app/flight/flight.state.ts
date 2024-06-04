import { inject } from "@angular/core";
import { signalStore, withHooks } from "@ngrx/signals";
import { initialDynamicResource, withHypermediaResource, withHypermediaAction, withLinkedHypermediaResource } from "@angular-architects/ngrx-hateoas";
import { AppState } from "../app.state";
import { initialFlightCreateVm } from "./flight-create/flight-create.models";
import { initialFlightEditVm } from "./flight-edit/flight-edit.models";

export const FlightState = signalStore(
    { providedIn: 'root' },
    withHypermediaResource('flightSearchVm', initialDynamicResource),
    withLinkedHypermediaResource('flightCreateVm', initialFlightCreateVm),
    withHypermediaResource('flightEditVm', initialFlightEditVm),
    withHypermediaAction('createFlight'),
    withHypermediaAction('updateFlightConnection'),
    withHypermediaAction('updateFlightTimes'),
    withHypermediaAction('updateFlightOperator'),
    withHypermediaAction('updateFlightPrice'),
    withHooks({
        onInit(store) {
            store.connectFlightCreateVm(store.flightSearchVm.resource, 'flightCreateVm');
            store.connectCreateFlight(store.flightCreateVm.resource.template, 'create');
            store.connectUpdateFlightConnection(store.flightEditVm.resource.flight.connection, 'update');
            store.connectUpdateFlightTimes(store.flightEditVm.resource.flight.times, 'update');
            store.connectUpdateFlightOperator(store.flightEditVm.resource.flight.operator, 'update');
            store.connectUpdateFlightPrice(store.flightEditVm.resource.flight.price, 'update');
        }
    })
);
