import { Signal, computed, inject } from "@angular/core";
import { SignalStoreFeature, patchState, signalStoreFeature, withMethods, withState } from "@ngrx/signals";
import { HttpClient } from "@angular/common/http";
import { filter, map, pipe, switchMap, tap } from "rxjs";
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { isValidUrl } from "../util/helpers";
import { DeepPatchableSignal, toDeepPatchableSignal } from "../util/deep-patchable-signal";

export type LinkedHypermediaResourceState<ResourceName extends string, TResource> = 
{ 
    [K in ResourceName]: { 
        url: string, 
        isLoading: boolean,
        isAvailable: boolean,
        initiallyLoaded: boolean,
        resource: TResource
    }
};

export type ConnectLinkedHypermediaResourceMethod<ResourceName extends string> = { 
    [K in ResourceName as `connect${Capitalize<ResourceName>}`]: (linkRoot: Signal<unknown>, linkName: string) => void
};

export function generateConnectLinkedHypermediaResourceMethodName(resourceName: string) {
    return `connect${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)}`;
}

export type ReloadLinkedHypermediaResourceMethod<ResourceName extends string> = { 
    [K in ResourceName as `reload${Capitalize<ResourceName>}`]: () => Promise<void>
};

export function generateReloadLinkedHypermediaResourceMethodName(resourceName: string) {
    return `reload${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)}`;
}

export type GetAsPatchableLinkedHypermediaResourceMethod<ResourceName extends string, TResource> = { 
    [K in ResourceName as `get${Capitalize<ResourceName>}AsPatchable`]: () => DeepPatchableSignal<TResource>
};

export function generateGetAsPatchableLinkedHypermediaResourceMethodName(resourceName: string) {
    return `get${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)}AsPatchable`;
}

export type LinkedHypermediaResourceMethods<ResourceName extends string, TResource> = 
    ConnectLinkedHypermediaResourceMethod<ResourceName> 
    & ReloadLinkedHypermediaResourceMethod<ResourceName>
    & GetAsPatchableLinkedHypermediaResourceMethod<ResourceName, TResource>;

type linkedRxInput = {
    resource: any,
    linkName: string
}

export function withLinkedHypermediaResource<ResourceName extends string, TResource>(
    resourceName: ResourceName, initialValue: TResource): SignalStoreFeature<
        { state: {}; signals: {}; methods: {} },
        {
            state: LinkedHypermediaResourceState<ResourceName, TResource>;
            signals: {},
            methods: LinkedHypermediaResourceMethods<ResourceName, TResource>;
        }
    >;
export function withLinkedHypermediaResource<ResourceName extends string, TResource>(resourceName: ResourceName, initialValue: TResource) {

    const stateKey = `${resourceName}`;
    const connectMehtodName = generateConnectLinkedHypermediaResourceMethodName(resourceName);
    const reloadMethodName = generateReloadLinkedHypermediaResourceMethodName(resourceName);
    const getAsPatchableMethodName = generateGetAsPatchableLinkedHypermediaResourceMethodName(resourceName);

    return signalStoreFeature(
        withState({
           [resourceName]: {
            url: '',
            isLoading: false,
            isAvailable: false,
            initiallyLoaded: false,
            resource: initialValue,
           } 
        }),
        withMethods((store: any, httpClient = inject(HttpClient)) => {

            const rxConnectToLinkRoot = rxMethod<linkedRxInput>(
                pipe( 
                    map(input => input.resource?._links?.[input.linkName]?.href),
                    filter(href => isValidUrl(href)),
                    tap(href => patchState(store, { [stateKey]: { ...store[stateKey](), url: href, isLoading: true, isAvailable: true } })),
                    switchMap(href => httpClient.get<TResource>(href)),
                    tap(resource => patchState(store, { [stateKey]: { ...store[stateKey](), resource, isLoading: false, initiallyLoaded: true } }))
                )
            );

            const patchableSignal = toDeepPatchableSignal<TResource>(newVal => patchState(store, { [stateKey]: { ...store[stateKey](), resource: newVal } }), store[stateKey].resource);

            return {
                [connectMehtodName]: (linkRoot: Signal<unknown>, linkName: string) => { 
                    const input = computed(() => ({ resource: linkRoot(), linkName }));
                    rxConnectToLinkRoot(input);
                },
                [reloadMethodName]: (): Promise<void> => {
                    const currentUrl = store[stateKey].url();
                    if(currentUrl) {
                        patchState(store, { [stateKey]: { ...store[stateKey](), isLoading: true } });

                        return new Promise((resolve, reject) => {
                            httpClient.get<TResource>(currentUrl).subscribe({
                                next: resource => {
                                    patchState(store, { [stateKey]: { ...store[stateKey](), isLoading: false, resource } });
                                    setTimeout(() => { console.log('loading done'); resolve()}, 3000);
                                    //resolve();
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
