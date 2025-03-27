import { inject, Signal } from "@angular/core";
import { SignalStoreFeature, patchState, signalStoreFeature, withMethods, withState } from "@ngrx/signals";
import { DeepPatchableSignal, toDeepPatchableSignal } from "../util/deep-patchable-signal";
import { HateoasService } from "../services/hateoas.service";
import { RequestService } from "../services/request.service";

export type HypermediaResourceStateProps = {
    url: string, 
    isLoading: boolean,
    isLoaded: boolean
}

export type HypermediaResourceData<ResourceName extends string, TResource> = { 
    [K in `${ResourceName}`]: TResource
};

export type HypermediaResourceState<ResourceName extends string> = { 
    [K in `${ResourceName}State`]: HypermediaResourceStateProps
};

export type HypermediaResourceStoreState<ResourceName extends string, TResource> = 
    HypermediaResourceData<ResourceName, TResource>
    & HypermediaResourceState<ResourceName>;

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

export type HypermediaResourceStoreMethods<ResourceName extends string, TResource> = 
    LoadHypermediaResourceFromUrlMethod<ResourceName>
    & LoadHypermediaResourceFromLinkMethod<ResourceName> 
    & ReloadHypermediaResourceMethod<ResourceName>
    & GetAsPatchableHypermediaResourceMethod<ResourceName, TResource>;

function getData<TResource>(store: unknown, dataKey: string): TResource {
    return (store as Record<string, Signal<TResource>>)[dataKey]()
}

function getState(store: unknown, stateKey: string): HypermediaResourceStateProps {
    return (store as Record<string, Signal<HypermediaResourceStateProps>>)[stateKey]()
}

function updateData<TResource>(dataKey: string, data: TResource) {
    return () => ({ [dataKey]: data});
}

function updateState(stateKey: string, partialState: Partial<HypermediaResourceStateProps>) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (state: any) => ({ [stateKey]: { ...state[stateKey], ...partialState } });
}

export function withHypermediaResource<ResourceName extends string, TResource>(
    resourceName: ResourceName, initialValue: TResource): SignalStoreFeature<
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
export function withHypermediaResource<ResourceName extends string, TResource>(resourceName: ResourceName, initialValue: TResource) {

    const dataKey = `${resourceName}`;
    const stateKey = `${resourceName}State`;
    const loadFromUrlMethodName = generateLoadHypermediaResourceFromUrlMethodName(resourceName);
    const loadFromLinkMethodName = generateLoadHypermediaResourceFromLinkMethodName(resourceName);
    const reloadMethodName = generateReloadHypermediaResourceMethodName(resourceName);
    const getAsPatchableMethodName = generateGetAsPatchableHypermediaResourceMethodName(resourceName);

    return signalStoreFeature(
        withState({
           [stateKey]: {
            url: '',
            isLoading: false,
            isLoaded: false
           },
           [dataKey]: initialValue 
        }),
        withMethods((store) => {

            const requestService = inject(RequestService); 
            const hateoasService = inject(HateoasService);

            const patchableSignal = toDeepPatchableSignal<TResource>(newVal => patchState(store, { [dataKey]: newVal }), (store as Record<string, Signal<TResource>>)[dataKey]);
            
            const loadFromUrlMethod = async (url: string | null, fromCache = false): Promise<void> => {
                if(!url) {
                    patchState(store, 
                               updateData(dataKey, initialValue), 
                               updateState(stateKey, { url: '', isLoading: false, isLoaded: false }));
                    return Promise.resolve();
                } else {
                    if(!fromCache || hateoasService.getLink(getData(store, dataKey), 'self')?.href !== url) {
                        patchState(store, updateState(stateKey, { url: '', isLoading: true }));

                        try {
                            const response = await requestService.request<TResource>('GET', url);
                            if (!response.body) {
                                throw new Error(`Response body is empty for URL: ${url}`);
                            }
                            patchState(store, 
                                       updateData(dataKey, response.body), 
                                       updateState(stateKey, { url, isLoading: false, isLoaded: true }));
                        } catch(e) {
                            patchState(store,
                                       updateData(dataKey, initialValue),
                                       updateState(stateKey, { url, isLoading: false }));
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
                const selfUrl = hateoasService.getLink(getData(store, dataKey), 'self')?.href;
                const url = selfUrl ?? getState(store, stateKey).url;
                if(url) {
                    patchState(store, updateState(stateKey, { url, isLoading: true }));
                    
                    try {
                        const response = await requestService.request<TResource>('GET', url);
                        if (!response.body) {
                            throw new Error(`Response body is empty for URL: ${url}`);
                        }
                        patchState(store, updateData(dataKey, response.body), updateState(stateKey, { isLoading: false }));
                    } catch(e) {
                        patchState(store, updateData(dataKey, initialValue), updateState(stateKey, { isLoading: false }));
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
