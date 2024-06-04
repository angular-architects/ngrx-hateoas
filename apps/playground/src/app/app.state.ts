import { signalStore, withHooks } from "@ngrx/signals";
import { withInitialHypermediaResource, withLinkedHypermediaResource } from "@angular-architects/ngrx-hateoas";

type UserInfo = {
    name: string,
    preferred_username: string
}

const initialUserInfo: UserInfo = {
    name: '',
    preferred_username: ''
};

export type RootApi = {
    apiName: string;
}

const initialRootModel: RootApi = {
    apiName: ''
}

export const AppState = signalStore(
    { providedIn: 'root' },
    withInitialHypermediaResource('rootApi', initialRootModel, 'http://localhost:5100/api'),
    withLinkedHypermediaResource('userInfo', initialUserInfo),
    withHooks({
        onInit(store) {
            store.connectUserInfo(store.rootApi.resource, 'userinfo');
        }
    })
);
