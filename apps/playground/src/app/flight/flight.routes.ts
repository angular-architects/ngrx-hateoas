import { ActivatedRouteSnapshot, Routes } from "@angular/router";
import { FlightCreateComponent } from ".//flight-create/flight-create.component";
import { FlightEditComponent } from "./flight-edit/flight-edit.component";
import { FlightSearchComponent } from "./flight-search/flight-search.component";
import { inject } from "@angular/core";
import { whenTrue } from "@angular-architects/ngrx-hateoas";
import { FlightSearchStore } from "./flight-search/flight-search.store";
import { FlightEditStore } from "./flight-edit/flight-edit.store";
import { FlightCreateStore } from "./flight-create/flight-create.store";
import { AppStore } from "../app.store";

export const FLIHGT_ROUTES: Routes = [{
    path: '',
    pathMatch: 'full',
    redirectTo: 'search'
}, {
    path: "search",
    component: FlightSearchComponent,
    canActivate: [() => inject(FlightSearchStore).loadFlightSearchVmFromLink(inject(AppStore).rootApi(), 'flightSearchVm')]
}, {
    path: "search/:url",
    component: FlightSearchComponent,
    canActivate: [(routeSnapshot: ActivatedRouteSnapshot) => inject(FlightSearchStore).loadFlightSearchVmFromUrl(routeSnapshot.paramMap.get('url'), true)]
}, {
    path: "edit/:url",
    component: FlightEditComponent,
    canActivate: [(routeSnapshot: ActivatedRouteSnapshot) => inject(FlightEditStore).loadFlightEditVmFromUrl(routeSnapshot.paramMap.get('url'), true)]
}, {
    path: "create",
    component: FlightCreateComponent,
    canActivate: [() => whenTrue(inject(FlightCreateStore).flightCreateVmState.isLoaded)]
}];
