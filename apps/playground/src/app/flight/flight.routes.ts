import { ActivatedRouteSnapshot, Routes } from "@angular/router";
import { FlightCreateComponent } from ".//flight-create/flight-create.component";
import { FlightEditComponent } from "./flight-edit/flight-edit.component";
import { FlightSearchComponent } from "./flight-search/flight-search.component";
import { inject } from "@angular/core";
import { FlightState } from "./flight.state";
import { AppState } from "../app.state";
import { whenTrue } from "@angular-architects/ngrx-hateoas";

export const FLIHGT_ROUTES: Routes = [{
    path: '',
    pathMatch: 'full',
    redirectTo: 'search'
}, {
    path: "search",
    component: FlightSearchComponent,
    canActivate: [() => inject(FlightState).loadFlightSearchVmFromLink(inject(AppState).rootApi.resource(), 'flightSearchVm')]
}, {
    path: "search/:url",
    component: FlightSearchComponent,
    canActivate: [(routeSnapshot: ActivatedRouteSnapshot) => inject(FlightState).loadFlightSearchVmFromUrl(routeSnapshot.paramMap.get('url'), true)]
}, {
    path: "edit/:url",
    component: FlightEditComponent,
    canActivate: [(routeSnapshot: ActivatedRouteSnapshot) => inject(FlightState).loadFlightEditVmFromUrl(routeSnapshot.paramMap.get('url'), true)]
}, {
    path: "create",
    component: FlightCreateComponent,
    canActivate: [() => whenTrue(inject(FlightState).flightCreateVm.initiallyLoaded)]
}];
