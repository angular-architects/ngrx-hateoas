import { SignalStoreFeature, signalStoreFeature, withHooks } from "@ngrx/signals";
import { withHypermediaResource, HypermediaResourceStoreState, HypermediaResourceStoreMethods, generateLoadHypermediaResourceFromUrlMethodName } from "./with-hypermedia-resource";
import { Signal } from "@angular/core";

export function withInitialHypermediaResource<ResourceName extends string, TResource>(
    resourceName: ResourceName, initialValue: TResource, url: string | (() => string)): SignalStoreFeature<
        { 
            state: object; computed: Record<string, Signal<unknown>>; methods: Record<string, Function> },
        {
            state: HypermediaResourceStoreState<ResourceName, TResource>;
            computed: Record<string, Signal<unknown>>;
            methods: HypermediaResourceStoreMethods<ResourceName, TResource>;
        }
    >;
export function withInitialHypermediaResource<ResourceName extends string, TResource>(resourceName: ResourceName, initialValue: TResource, url: string | (() => string)) {

    const loadFromUrlMethodName = generateLoadHypermediaResourceFromUrlMethodName(resourceName);

    return signalStoreFeature(
        withHypermediaResource<ResourceName, TResource>(resourceName, initialValue),
        withHooks({
            onInit(store) {
                let initialUrl;
                if(typeof url === 'string') {
                    initialUrl = url;
                } else {
                    initialUrl = url();
                }
                
                (store[loadFromUrlMethodName] as (url: string) => void)(initialUrl);
            }
        })
    );
}
