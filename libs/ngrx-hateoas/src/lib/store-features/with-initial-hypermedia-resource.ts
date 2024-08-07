import { SignalStoreFeature, signalStoreFeature, withHooks } from "@ngrx/signals";
import { withHypermediaResource, HypermediaResourceState, HypermediaResourceMethods, generateLoadHypermediaResourceFromUrlMethodName } from "./with-hypermedia-resource";

export function withInitialHypermediaResource<ResourceName extends string, TResource>(
    resourceName: ResourceName, initialValue: TResource, url: string | (() => string)): SignalStoreFeature<
        { state: {}; computed: {}; methods: {} },
        {
            state: HypermediaResourceState<ResourceName, TResource>;
            computed: {},
            methods: HypermediaResourceMethods<ResourceName, TResource>;
        }
    >;
export function withInitialHypermediaResource<ResourceName extends string, TResource>(resourceName: ResourceName, initialValue: TResource, url: string | (() => string)) {

    const loadFromUrlMethodName = generateLoadHypermediaResourceFromUrlMethodName(resourceName);

    return signalStoreFeature(
        withHypermediaResource<ResourceName, TResource>(resourceName, initialValue),
        withHooks({
            onInit(store: any) {
                let initialUrl;
                if(typeof url === 'string') {
                    initialUrl = url;
                } else {
                    initialUrl = url();
                }
                store[loadFromUrlMethodName](initialUrl);
            }
        })
    );
}
