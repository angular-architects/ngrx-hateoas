import { signalStore, withHooks } from "@ngrx/signals";
import { withLinkedHypermediaResource } from "@angular-architects/ngrx-hateoas";
import { initialHomeVm } from "./home/home.models";
import { inject } from "@angular/core";
import { AppState } from "../app.state";

export const CoreState = signalStore(
    { providedIn: 'root' },
    withLinkedHypermediaResource('homeVm', initialHomeVm),
    withHooks({
        onInit(store) {
            store.connectHomeVm(inject(AppState).rootApi.resource, 'homeVm')
        }
    })
);
