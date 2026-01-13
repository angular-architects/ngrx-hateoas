import { Routes } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { whenTrue } from "@angular-architects/ngrx-hateoas";
import { inject } from "@angular/core";
import { HomeStore } from "./home/home.store";

export const CORE_ROUTES: Routes = [{
    path: '',
    pathMatch: 'full',
    redirectTo: 'home'
}, {
    path: 'home',
    component: HomeComponent,
    canActivate: [ () => whenTrue(inject(HomeStore).homeVmState.isLoaded) ]
}];
