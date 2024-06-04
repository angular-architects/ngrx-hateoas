import { ActivatedRoute, ActivatedRouteSnapshot, Router, Routes } from "@angular/router";
import { FlightCreateComponent } from ".//flight-create/flight-create.component";
import { FlightEditComponent } from "./flight-edit/flight-edit.component";
import { FlightSearchComponent } from "./flight-search/flight-search.component";
import { inject } from "@angular/core";
import { FlightState } from "./flight.state";
import { HateoasService, whenTrue } from "@angular-architects/ngrx-hateoas"
import { AppState } from "../app.state";

export const FLIHGT_ROUTES: Routes = [{
    path: '',
    pathMatch: 'full',
    redirectTo: 'search'
}, {
    path: "search",
    component: FlightSearchComponent,
    canActivate: [ async (routeSnapshot: ActivatedRouteSnapshot) => {
        const appState = inject(AppState);
        const hateoasService = inject(HateoasService);
        const router = inject(Router);
        const activatedRoute = inject(ActivatedRoute);
        await whenTrue(appState.rootApi.isLoaded);
        const flightSearchVmUrl = hateoasService.getLink(appState.rootApi.resource(), 'flightSearchVm')?.href;
        const path = routeSnapshot.pathFromRoot;
        router.navigate(['/flight/search', flightSearchVmUrl]);
        return false;
    }]
}, {
    path: "search/:url",
    component: FlightSearchComponent,
    canActivate: [(routeSnapshot: ActivatedRouteSnapshot) => inject(FlightState).loadFlightSearchVm(routeSnapshot.paramMap.get('url'), true)]
}, {
    path: "edit/:url",
    component: FlightEditComponent,
    canActivate: [(routeSnapshot: ActivatedRouteSnapshot) => inject(FlightState).loadFlightEditVm(routeSnapshot.paramMap.get('url'), true)]
}, {
    path: "create",
    component: FlightCreateComponent,
    canActivate: [ () => whenTrue(inject(FlightState).flightCreateVm.initiallyLoaded) ]
}];
