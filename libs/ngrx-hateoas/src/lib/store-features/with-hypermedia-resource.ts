import { inject } from "@angular/core";
import { SignalStoreFeature, patchState, signalStoreFeature, withMethods, withState } from "@ngrx/signals";
import { HttpClient } from "@angular/common/http";
import { DeepPatchableSignal, toDeepPatchableSignal } from "../util/deep-patchable-signal";

export type HypermediaResourceState<ResourceName extends string, TResource> = 
{ 
    [K in ResourceName]: { 
        url: string, 
        isLoading: boolean,
        isLoaded: boolean,
        resource: TResource
    }
};

export type LoadHypermediaResourceMethod<ResourceName extends string> = { 
    [K in ResourceName as `load${Capitalize<ResourceName>}`]: (url: string | null, fromCache?: boolean) => Promise<void>
};

export function generateLoadHypermediaResourceMethodName(resourceName: string) {
    return `load${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)}`;
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
    LoadHypermediaResourceMethod<ResourceName> 
    & ReloadHypermediaResourceMethod<ResourceName>
    & GetAsPatchableHypermediaResourceMethod<ResourceName, TResource>;

export function withHypermediaResource<ResourceName extends string, TResource>(
    resourceName: ResourceName, initialValue: TResource): SignalStoreFeature<
        { state: {}; signals: {}; methods: {} },
        {
            state: HypermediaResourceState<ResourceName, TResource>;
            signals: {},
            methods: HypermediaResourceMethods<ResourceName, TResource>;
        }
    >;
export function withHypermediaResource<ResourceName extends string, TResource>(resourceName: ResourceName, initialValue: TResource) {

    const stateKey = `${resourceName}`;
    const loadMethodName = generateLoadHypermediaResourceMethodName(resourceName);
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
        withMethods((store: any, httpClient = inject(HttpClient)) => {

            const patchableSignal = toDeepPatchableSignal<TResource>(newVal => patchState(store, { [stateKey]: { ...store[stateKey](), resource: newVal } }), store[stateKey].resource);
            
            return {
                [loadMethodName]: (url: string | null, fromCache: boolean = false): Promise<void> => {
                    if(!url) {
                        patchState(store, { [stateKey]: { ...store[stateKey](), url: '', isLoading: false, isLoaded: false, resource: initialValue } });
                        return Promise.resolve();
                    } else {
                        if(!fromCache || store[stateKey].resource()?._links?.['self']?.href !== url) {
                            patchState(store, { [stateKey]: { ...store[stateKey](), url: '', isLoading: true } });

                            return new Promise((resolve, reject) => {
                                httpClient.get<TResource>(url).subscribe({
                                    next: resource => {
                                        patchState(store, { [stateKey]: { ...store[stateKey](), url, isLoading: false, isLoaded: true, resource} });
                                        resolve();
                                    },
                                    error: () => {
                                        patchState(store, { [stateKey]: { ...store[stateKey](), url, isLoading: false, resource: initialValue} });
                                        reject();
                                    }
                                }); 
                            });
                            
                        } else {
                            return Promise.resolve();
                        }
                    } 
                },
                [reloadMethodName]: (): Promise<void> => {
                    const currentUrl = store[stateKey].url();
                    if(currentUrl) {
                        patchState(store, { [stateKey]: { ...store[stateKey](), isLoading: true } });
                        
                        return new Promise((resolve, reject) => {
                            httpClient.get<TResource>(currentUrl).subscribe({
                                next: resource => {
                                    patchState(store, { [stateKey]: { ...store[stateKey](), isLoading: false, resource } });
                                    resolve();
                                },
                                error: () => {
                                    patchState(store, { [stateKey]: { ...store[stateKey](), isLoading: false, resource: initialValue } });
                                    reject();
                                }
                            });
                        });

                    }
                    return Promise.resolve();
                },
                [getAsPatchableMethodName]: (): DeepPatchableSignal<TResource> => {
                    return patchableSignal;
                }
            };
        })
    );
}
