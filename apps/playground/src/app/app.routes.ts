import { Routes } from '@angular/router';
import { CORE_ROUTES } from './core/core.routes';
import { FLIHGT_ROUTES } from './flight/flight.routes';
import { whenTrue } from '../../../../dist/ngrx-hateoas';
import { inject } from '@angular/core';
import { AppState } from './app.state';

export const routes: Routes = [{
    path: '',
    pathMatch: 'full',
    redirectTo: '/core'
}, {
    path: "core",
    //canActivate: [() => whenTrue(inject(AppState).rootApi.isLoaded)],
    children: CORE_ROUTES
}, {
    path: "flight",
    canActivate: [() => whenTrue(inject(AppState).rootApi.isLoaded)],
    children: FLIHGT_ROUTES
}, {
    path: '**',
    redirectTo: '/core'
}];
