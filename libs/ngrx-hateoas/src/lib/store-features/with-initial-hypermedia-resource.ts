import { SignalStoreFeature, signalStoreFeature, withHooks } from "@ngrx/signals";
import { withHypermediaResource, HypermediaResourceStoreState, HypermediaResourceStoreMethods, generateLoadHypermediaResourceFromUrlMethodName } from "./with-hypermedia-resource";
import { Signal } from "@angular/core";

export function withInitialHypermediaResource<ResourceName extends string, TResource>(
    resourceName: ResourceName, initialValue: TResource, url: string | (() => string)): SignalStoreFeature<
        { 
            state: object; 
            computed: Record<string, Signal<unknown>>; 
            methods: Record<string, Function>;
            props: object;
        },
        {
            state: HypermediaResourceStoreState<ResourceName, TResource>;
            computed: Record<string, Signal<unknown>>;
            methods: HypermediaResourceStoreMethods<ResourceName, TResource>;
            props: object;
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
    
                ((store as Record<string, unknown>)[loadFromUrlMethodName] as (url: string) => void)(initialUrl);
            }
        })
    );
}
