import { initialDynamicResource, withInitialHypermediaResource, withLinkedHypermediaResource } from "@angular-architects/ngrx-hateoas";
import { signalStore } from "@ngrx/signals";

export const AppStore = signalStore(
  { providedIn: 'root' },
  withInitialHypermediaResource('rootApi', initialDynamicResource, 'http://localhost:5100/api'),
  withLinkedHypermediaResource('userInfo', { name: '', preferred_username: '' }, store => store.rootApi, 'userinfo' )
);
