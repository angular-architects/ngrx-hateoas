import { withLinkedHypermediaResource } from "@angular-architects/ngrx-hateoas";
import { inject } from "@angular/core";
import { signalStore, withHooks } from "@ngrx/signals";
import { AppState } from "../app.state";
import { initialHomeVm } from "./core.entities";

export const CoreState = signalStore(
  { providedIn: 'root' },
  withLinkedHypermediaResource('homeVm', initialHomeVm),
  withHooks({
    onInit(store) {
      store._connectHomeVm(inject(AppState).rootApi, 'homeVm')
    }
  })
);
