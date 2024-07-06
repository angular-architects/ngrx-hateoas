import { initialDynamicResource, withInitialHypermediaResource, withLinkedHypermediaResource } from "@angular-architects/ngrx-hateoas";
import { signalStore, withHooks } from "@ngrx/signals";

export const AppState = signalStore(
  { providedIn: 'root' },
  withInitialHypermediaResource('rootApi', initialDynamicResource, 'http://localhost:5100/api'),
  withLinkedHypermediaResource('userInfo', { name: '', preferred_username: ''}),
    withHooks({
        onInit(store) {
            store.connectUserInfo(store.rootApi.resource, 'userinfo');
        }
    })
);
