import { SignalStoreFeature, signalStoreFeature, withHooks } from "@ngrx/signals";
import { withHypermediaResource, HypermediaResourceState, HypermediaResourceMethods, generateLoadHypermediaResourceMethodName } from "./with-hypermedia-resource";

export function withInitialHypermediaResource<ResourceName extends string, TResource>(
    resourceName: ResourceName, initialValue: TResource, url: string): SignalStoreFeature<
        { state: {}; signals: {}; methods: {} },
        {
            state: HypermediaResourceState<ResourceName, TResource>;
            signals: {},
            methods: HypermediaResourceMethods<ResourceName, TResource>;
        }
    >;
export function withInitialHypermediaResource<ResourceName extends string, TResource>(resourceName: ResourceName, initialValue: TResource, url: string) {

    const loadMethodName = generateLoadHypermediaResourceMethodName(resourceName);

    return signalStoreFeature(
        withHypermediaResource<ResourceName, TResource>(resourceName, initialValue),
        withHooks({
            onInit(store: any) {
                store[loadMethodName](url);
            }
        })
    );
}