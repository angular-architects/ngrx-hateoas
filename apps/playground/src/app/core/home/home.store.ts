import { linkedHypermediaResource, withLinkedHypermediaResource } from "@angular-architects/ngrx-hateoas";
import { inject } from "@angular/core";
import { signalStore, withHooks } from "@ngrx/signals";
import { FlightManagementSummary, FlightShoppingSummary } from "../core.entities";
import { AppStore } from "../../app.store";

export type HomeVm = {
  flightManagementSummary: FlightManagementSummary;
  flightShoppingSummary: FlightShoppingSummary;
};

export const initialHomeVm: HomeVm = {
  flightManagementSummary: {
      flightCount: 0,
      passengerCount: 0, 
      averagePassengerCountPerFlight: 0
  },
  flightShoppingSummary: {
      maxBasePrice: 0,
      minBasePrice: 0,
      averagePrice: 0
  }
}

export const HomeStore = signalStore(
  { providedIn: 'root' },
  linkedHypermediaResource('homeVm', initialHomeVm, () => inject(AppStore).rootApi, 'homeVm')
  // withLinkedHypermediaResource('homeVm', initialHomeVm),
  // withHooks({
  //   onInit(store) {
  //     store._connectHomeVm(inject(AppStore).rootApi, 'homeVm')
  //   }
  // })
);
