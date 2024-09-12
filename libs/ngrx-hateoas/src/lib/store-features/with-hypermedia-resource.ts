import { inject, Signal } from "@angular/core";
import { SignalStoreFeature, patchState, signalStoreFeature, withMethods, withState } from "@ngrx/signals";
import { DeepPatchableSignal, toDeepPatchableSignal } from "../util/deep-patchable-signal";
import { HateoasService } from "../services/hateoas.service";
import { RequestService } from "../services/request.service";

export type HypermediaResourceProps<TResource> = {
    url: string, 
        isLoading: boolean,
        isLoaded: boolean,
        resource: TResource
}

export type HypermediaResourceState<ResourceName extends string, TResource> = { 
    [K in ResourceName]: HypermediaResourceProps<TResource>
};

export type LoadHypermediaResourceFromUrlMethod<ResourceName extends string> = { 
    [K in ResourceName as `load${Capitalize<ResourceName>}FromUrl`]: (url: string | null, fromCache?: boolean) => Promise<void>
};

export function generateLoadHypermediaResourceFromUrlMethodName(resourceName: string) {
    return `load${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)}FromUrl`;
}

export type LoadHypermediaResourceFromLinkMethod<ResourceName extends string> = { 
    [K in ResourceName as `load${Capitalize<ResourceName>}FromLink`]: (linkRoot: unknown, linkName: string) => Promise<void>
};

export function generateLoadHypermediaResourceFromLinkMethodName(resourceName: string) {
    return `load${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)}FromLink`;
}

export type ReloadHypermediaResourceMethod<ResourceName extends string> = { 
    [K in ResourceName as `reload${Capitalize<ResourceName>}`]: () => Promise<void>
};

export function generateReloadHypermediaResourceMethodName(resourceName: string) {
    return `reload${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)}`;
}

export type GetAsPatchableHypermediaResourceMethod<ResourceName extends string, TResource> = { 
    [K in ResourceName as `get${Capitalize<ResourceName>}AsPatchable`]: () => DeepPatchableSignal<TResource>
};

export function generateGetAsPatchableHypermediaResourceMethodName(resourceName: string) {
    return `get${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)}AsPatchable`;
}

export type HypermediaResourceMethods<ResourceName extends string, TResource> = 
    LoadHypermediaResourceFromUrlMethod<ResourceName>
    & LoadHypermediaResourceFromLinkMethod<ResourceName> 
    & ReloadHypermediaResourceMethod<ResourceName>
    & GetAsPatchableHypermediaResourceMethod<ResourceName, TResource>;

function getState<TResource>(store: unknown, stateKey: string): HypermediaResourceProps<TResource> {
    return (store as Record<string, Signal<HypermediaResourceProps<TResource>>>)[stateKey]()
}

export function withHypermediaResource<ResourceName extends string, TResource>(
    resourceName: ResourceName, initialValue: TResource): SignalStoreFeature<
        { state: object; computed: Record<string, Signal<unknown>>; methods: Record<string, Function> },
        {
            state: HypermediaResourceState<ResourceName, TResource>;
            computed: Record<string, Signal<unknown>>;
            methods: HypermediaResourceMethods<ResourceName, TResource>;
        }
    >;
export function withHypermediaResource<ResourceName extends string, TResource>(resourceName: ResourceName, initialValue: TResource) {

    const stateKey = `${resourceName}`;
    const loadFromUrlMethodName = generateLoadHypermediaResourceFromUrlMethodName(resourceName);
    const loadFromLinkMethodName = generateLoadHypermediaResourceFromLinkMethodName(resourceName);
    const reloadMethodName = generateReloadHypermediaResourceMethodName(resourceName);
    const getAsPatchableMethodName = generateGetAsPatchableHypermediaResourceMethodName(resourceName);

    return signalStoreFeature(
        withState({
           [stateKey]: {
            url: '',
            isLoading: false,
            isLoaded: false,
            resource: initialValue,
           } 
        }),
        withMethods((store) => {

            const requestService = inject(RequestService); 
            const hateoasService = inject(HateoasService);

            const patchableSignal = toDeepPatchableSignal<TResource>(newVal => patchState(store, { [stateKey]: { ...getState(store, stateKey), resource: newVal } }), (store as Record<string, HypermediaResourceProps<Signal<TResource>>>)[stateKey].resource);
            
            const loadFromUrlMethod = async (url: string | null, fromCache = false): Promise<void> => {
                if(!url) {
                    patchState(store, { [stateKey]: { ...getState(store, stateKey), url: '', isLoading: false, isLoaded: false, resource: initialValue } });
                    return Promise.resolve();
                } else {
                    if(!fromCache || hateoasService.getLink(getState<TResource>(store, stateKey).resource, 'self')?.href !== url) {
                        patchState(store, { [stateKey]: { ...getState<TResource>(store, stateKey), url: '', isLoading: true } });

                        try {
                            const resource = await requestService.request<TResource>('GET', url);
                            patchState(store, { [stateKey]: { ...getState(store, stateKey), url, isLoading: false, isLoaded: true, resource} });
                        } catch(e) {
                            patchState(store, { [stateKey]: { ...getState(store, stateKey), url, isLoading: false, resource: initialValue} });
                            throw e;
                        }   
                    }
                } 
            };

            const loadFromLinkMethod = async (linkRoot: unknown, linkName: string): Promise<void> => {
                const link = hateoasService.getLink(linkRoot, linkName);
                if(link) {
                    await loadFromUrlMethod(link.href);
                }
            };

            const reloadMethod = async (): Promise<void> => {
                const selfUrl = hateoasService.getLink(getState(store, stateKey).resource, 'self')?.href;
                const url = selfUrl ?? getState(store, stateKey).url;
                if(url) {
                    patchState(store, { [stateKey]: { ...getState<TResource>(store, stateKey), isLoading: true, url } });
                    
                    try {
                        const resource = await requestService.request<TResource>('GET', url);
                        patchState(store, { [stateKey]: { ...getState(store, stateKey), isLoading: false, resource } });
                    } catch(e) {
                        patchState(store, { [stateKey]: { ...getState(store, stateKey), isLoading: false, resource: initialValue } });
                        throw e;
                    }
                }
                return Promise.resolve();
            };

            const getAsPatchableMethod = (): DeepPatchableSignal<TResource> => {
                return patchableSignal;
            };

            return {
                [loadFromUrlMethodName]: loadFromUrlMethod,
                [loadFromLinkMethodName]: loadFromLinkMethod,
                [reloadMethodName]: reloadMethod,
                [getAsPatchableMethodName]: getAsPatchableMethod
            };
        })
    );
}
