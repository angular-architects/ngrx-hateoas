import { Routes } from '@angular/router';
import { CORE_ROUTES } from './core/core.routes';
import { FLIHGT_ROUTES } from './flight/flight.routes';
import { whenTrue } from '@angular-architects/ngrx-hateoas';
import { inject } from '@angular/core';
import { AppStore } from './app.store';

export const routes: Routes = [{
    path: '',
    pathMatch: 'full',
    redirectTo: '/core'
}, {
    path: "core",
    children: CORE_ROUTES
}, {
    path: "flight",
    canActivate: [() => whenTrue(inject(AppStore).rootApiState.isLoaded)],
    children: FLIHGT_ROUTES
}, {
    path: '**',
    redirectTo: '/core'
}];
