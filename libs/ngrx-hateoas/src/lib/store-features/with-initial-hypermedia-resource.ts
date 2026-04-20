import { SignalStoreFeature, signalStoreFeature, withHooks } from "@ngrx/signals";
import { withHypermediaResource, HypermediaResourceStoreState, HypermediaResourceStoreMethods, generateLoadHypermediaResourceFromUrlMethodName } from "./with-hypermedia-resource";
import { Signal } from "@angular/core";

export type InitialUrl = string | Promise<string>;

export type InitialUrlOrResolver = InitialUrl | (() => InitialUrl);

export function withInitialHypermediaResource<ResourceName extends string, TResource>(
    resourceName: ResourceName, initialValue: TResource, url: InitialUrlOrResolver): SignalStoreFeature<
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
export function withInitialHypermediaResource<ResourceName extends string, TResource>(resourceName: ResourceName, initialValue: TResource, url: InitialUrlOrResolver) {

    const loadFromUrlMethodName = generateLoadHypermediaResourceFromUrlMethodName(resourceName);

    return signalStoreFeature(
        withHypermediaResource<ResourceName, TResource>(resourceName, initialValue),
        withHooks({
            async onInit(store) {
                let initialUrl: string;
                if(typeof url === 'string') {
                    initialUrl = url;
                } else if (url instanceof Promise) {
                    initialUrl = await url;
                } else if (typeof url === 'function') {
                    const initialUrlPromiseOrResolver = url();
                    if (typeof initialUrlPromiseOrResolver === 'string') initialUrl = initialUrlPromiseOrResolver;
                    else if (initialUrlPromiseOrResolver instanceof Promise) initialUrl = await initialUrlPromiseOrResolver;
                    else throw new Error('Invalid initial url resolver return type. Expected string or Promise<string>.');
                } else {
                    throw new Error('Invalid initial url type. Expected string, Promise<string>, function returning string, or function returning Promise<string>.');
                }

                ((store as Record<string, unknown>)[loadFromUrlMethodName] as (url: string) => void)(initialUrl);
            }
        })
    );
}
