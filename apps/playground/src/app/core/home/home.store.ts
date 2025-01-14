import { withLinkedHypermediaResource } from "@angular-architects/ngrx-hateoas";
import { inject } from "@angular/core";
import { signalStore, withHooks } from "@ngrx/signals";
import { AppStore } from "../../app.store";
import { initialHomeVm } from "../core.entities";

export const HomeStore = signalStore(
  { providedIn: 'root' },
  withLinkedHypermediaResource('homeVm', initialHomeVm),
  withHooks({
    onInit(store) {
      store._connectHomeVm(inject(AppStore).rootApi, 'homeVm')
    }
  })
);
