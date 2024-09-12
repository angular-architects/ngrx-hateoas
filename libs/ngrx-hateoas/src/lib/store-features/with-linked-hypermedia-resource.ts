import { Signal, computed, inject } from "@angular/core";
import { SignalStoreFeature, patchState, signalStoreFeature, withMethods, withState } from "@ngrx/signals";
import { filter, map, pipe, switchMap, tap } from "rxjs";
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { isValidHref } from "../util/is-valid-href";
import { DeepPatchableSignal, toDeepPatchableSignal } from "../util/deep-patchable-signal";
import { RequestService } from "../services/request.service";
import { HateoasService } from "../services/hateoas.service";

export type LinkedHypermediaResourceProps<TResource> = { 
    url: string, 
    isLoading: boolean,
    isAvailable: boolean,
    initiallyLoaded: boolean,
    resource: TResource
}

export type LinkedHypermediaResourceState<ResourceName extends string, TResource> = 
{ 
    [K in ResourceName]: LinkedHypermediaResourceProps<TResource>
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
    resource: unknown,
    linkName: string
}

function getState<TResource>(store: unknown, stateKey: string): LinkedHypermediaResourceProps<TResource> {
    return (store as Record<string, Signal<LinkedHypermediaResourceProps<TResource>>>)[stateKey]()
}

export function withLinkedHypermediaResource<ResourceName extends string, TResource>(
    resourceName: ResourceName, initialValue: TResource): SignalStoreFeature<
        { state: object; computed: Record<string, Signal<unknown>>; methods: Record<string, Function> },
        {
            state: LinkedHypermediaResourceState<ResourceName, TResource>;
            computed: Record<string, Signal<unknown>>;
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
           [stateKey]: {
            url: '',
            isLoading: false,
            isAvailable: false,
            initiallyLoaded: false,
            resource: initialValue,
           } 
        }),
        withMethods((store, requestService = inject(RequestService)) => {

            const hateoasService = inject(HateoasService);

            const rxConnectToLinkRoot = rxMethod<linkedRxInput>(
                pipe( 
                    map(input => hateoasService.getLink(input.resource, input.linkName)?.href),
                    filter(href => isValidHref(href)),
                    map(href => href!),
                    filter(href => getState(store, stateKey).url !== href),
                    tap(href => patchState(store, { [stateKey]: { ...getState<TResource>(store, stateKey), url: href, isLoading: true, isAvailable: true } })),
                    switchMap(href => requestService.request<TResource>('GET', href)),
                    tap(resource => patchState(store, { [stateKey]: { ...getState<TResource>(store, stateKey), resource, isLoading: false, initiallyLoaded: true } }))
                )
            );

            const patchableSignal = toDeepPatchableSignal<TResource>(newVal => patchState(store, { [stateKey]: { ...getState<TResource>(store, stateKey), resource: newVal } }), (store as Record<string, LinkedHypermediaResourceProps<Signal<TResource>>>)[stateKey].resource);

            return {
                [connectMehtodName]: (linkRoot: Signal<unknown>, linkName: string) => { 
                    const input = computed(() => ({ resource: linkRoot(), linkName }));
                    rxConnectToLinkRoot(input);
                },
                [reloadMethodName]: async (): Promise<void> => {
                    const currentUrl = getState(store, stateKey).url;
                    if(currentUrl) {
                        patchState(store, { [stateKey]: { ...getState<TResource>(store, stateKey), isLoading: true } });

                        try {
                            const resource = await requestService.request<TResource>('GET', currentUrl);
                            patchState(store, { [stateKey]: { ...getState<TResource>(store, stateKey), isLoading: false, resource } });
                        } catch(e) {
                            patchState(store, { [stateKey]: { ...getState<TResource>(store, stateKey), isLoading: false, resource: initialValue } });
                            throw e;
                        }
                    }
                },
                [getAsPatchableMethodName]: (): DeepPatchableSignal<TResource> => {
                    return patchableSignal;
                }
            };
        })
    );
}
