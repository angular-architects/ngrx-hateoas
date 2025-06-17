import { initialDynamicResource, linkedHypermediaResource, withInitialHypermediaResource, withLinkedHypermediaResource } from "@angular-architects/ngrx-hateoas";
import { inject } from "@angular/core";
import { signalStore, withFeature, withHooks } from "@ngrx/signals";

export const AppStore = signalStore(
  { providedIn: 'root' },
  withInitialHypermediaResource('rootApi', initialDynamicResource, 'http://localhost:5100/api'),
  linkedHypermediaResource('userInfo', { name: '', preferred_username: '' }, (store) => store.rootApi, 'userinfo' )
  // withLinkedHypermediaResource('userInfo', { name: '', preferred_username: '' }),
  // withHooks({
  //   onInit(store) {
  //       store._connectUserInfo(store.rootApi, 'userinfo')
  //   }
  // })
);
