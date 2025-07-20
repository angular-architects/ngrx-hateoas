import { Signal, computed, inject } from "@angular/core";
import { SignalStoreFeature, SignalStoreFeatureResult, StateSignals, patchState, signalStoreFeature, withHooks, withMethods, withState } from "@ngrx/signals";
import { concatMap, map, pipe, tap } from "rxjs";
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { isValidActionVerb } from "../util/is-valid-action-verb";
import { isValidHref } from "../util/is-valid-href";
import { RequestService } from "../services/request.service";
import { HateoasService } from "../services/hateoas.service";
import { defaultHypermediaActionState, HypermediaActionStateProps } from "./with-hypermedia-action";
import { Resource, ResourceAction } from "../models";
import { HttpResponse } from "@angular/common/http";

export type CollectionKey = string | number;

export type HypermediaCollectionActionStateProps = { 
    method: Record<CollectionKey, '' | 'PUT' | 'POST' | 'DELETE'>
    href: Record<CollectionKey, string>
    isAvailable: Record<CollectionKey, boolean>
    isExecuting: Record<CollectionKey, boolean> 
    hasError: Record<CollectionKey, boolean>
    error: Record<CollectionKey, unknown>
}

const defaultHypermediaCollectionActionState: HypermediaCollectionActionStateProps = {
    method: {},
    href: {},
    isAvailable: {},
    isExecuting: {},
    hasError: {},
    error: {}
}

export type HypermediaCollectionActionStoreState<ActionName extends string> = 
{ 
    [K in `${ActionName}State`]: HypermediaCollectionActionStateProps
};

export type ExecuteHypermediaCollectionActionMethod<ActionName extends string> = { 
    [K in ActionName]: (id: CollectionKey) => Promise<HttpResponse<unknown>>
};

export function generateExecuteHypermediaCollectionActionMethodName(actionName: string) {
    return actionName;
}

export type ConnectHypermediaCollectionActionMethod<ActionName extends string> = { 
    [K in ActionName as `_connect${Capitalize<ActionName>}`]: (resourceLink: Signal<unknown[]>, idKeyName: string, action: string) => void
};

export function generateConnectHypermediaCollectionActionMethodName(actionName: string) {
    return `_connect${actionName.charAt(0).toUpperCase() + actionName.slice(1)}`;
}

export type HypermediaCollectionActionMethods<ActionName extends string> = 
    ExecuteHypermediaCollectionActionMethod<ActionName> & ConnectHypermediaCollectionActionMethod<ActionName>

type StoreForCollectionActionLinkRoot<Input extends SignalStoreFeatureResult> = StateSignals<Input['state']>;
        
type CollectionActionLinkRootFn<Store extends SignalStoreFeatureResult, ArrayResource extends Resource> = (store: StoreForCollectionActionLinkRoot<Store>) => Signal<ArrayResource[]>

type CollectionActionOptions<ArrayResource extends Resource> = {
    idLookup: (arrayResource: ArrayResource) => CollectionKey;
    resourceLookup: (arrayResource: ArrayResource) => Resource;
}

const defaultCollectionActionOptions: CollectionActionOptions<Resource> = {
    idLookup: arrayResource => {
        if('id' in arrayResource && ((typeof arrayResource['id'] === 'string' || typeof arrayResource['id'] === 'number'))) return arrayResource['id'];
        else throw new Error("The resources in the array needs to have a key 'id' with a string or number as type or specify an 'idLookup' in the options of the signal store feature");
    },
    resourceLookup: arrayResource => arrayResource
}

function getState(store: unknown, stateKey: string): HypermediaCollectionActionStateProps {
    return (store as Record<string, Signal<HypermediaCollectionActionStateProps>>)[stateKey]()
}

function updateState(stateKey: string, partialState: Partial<HypermediaCollectionActionStateProps>) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (state: any) => ({ [stateKey]: { ...state[stateKey], ...partialState } });
}

function toResourceMap<ArrayResource extends Resource>(resources: ArrayResource[], options: CollectionActionOptions<ArrayResource>): Record<CollectionKey, Resource> {
    const result: Record<CollectionKey, Resource> = {};
    resources.forEach(resource => result[options.idLookup(resource)] = options.resourceLookup(resource));
    return result;
}

function updateItemState(stateKey: string, id: CollectionKey, itemState: Partial<HypermediaActionStateProps> ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (state: { [K in any]: HypermediaCollectionActionStateProps}) => ({ [stateKey]: { 
        href: itemState.href !== undefined ? { ...state[stateKey].href, [id]: itemState.href } : state[stateKey].href,
        method: itemState.method !== undefined ? { ...state[stateKey].method, [id]: itemState.method } : state[stateKey].method,
        isAvailable: itemState.isAvailable !== undefined ? { ...state[stateKey].isAvailable, [id]: itemState.isAvailable } : state[stateKey].isAvailable,
        isExecuting: itemState.isExecuting !== undefined ? { ...state[stateKey].isExecuting, [id]: itemState.isExecuting } : state[stateKey].isExecuting,
        hasError: itemState.hasError !== undefined ? { ...state[stateKey].hasError, [id]: itemState.hasError } : state[stateKey].hasError,
        error: itemState.error !== undefined ? { ...state[stateKey].error, [id]: itemState.error } : state[stateKey].error
    } satisfies HypermediaCollectionActionStateProps
 });
}

export function withHypermediaCollectionAction<ActionName extends string, Input extends SignalStoreFeatureResult, ArrayResource extends Resource>(
    actionName: ActionName,
    linkRootFn: CollectionActionLinkRootFn<Input, ArrayResource>,
    actionMetaName: string,
    options: Partial<CollectionActionOptions<ArrayResource>>): SignalStoreFeature<
        Input,
        Input & {
            state: HypermediaCollectionActionStoreState<ActionName>;
            methods: HypermediaCollectionActionMethods<ActionName>;
        }
    >;
export function withHypermediaCollectionAction<ActionName extends string, Input extends SignalStoreFeatureResult, ArrayResource extends Resource>(
    actionName: ActionName,
    linkRootFn: CollectionActionLinkRootFn<Input, ArrayResource>,
    actionMetaName: string): SignalStoreFeature<
        Input,
        Input & {
            state: HypermediaCollectionActionStoreState<ActionName>;
            methods: HypermediaCollectionActionMethods<ActionName>;
        }
    >;
export function withHypermediaCollectionAction<ActionName extends string, Input extends SignalStoreFeatureResult, ArrayResource extends Resource>(
    actionName: ActionName,
    linkRootFn: CollectionActionLinkRootFn<Input, ArrayResource>,
    actionMetaName: string,
    options: Partial<CollectionActionOptions<ArrayResource>> = {}) {

    const fullOptions = { ...defaultCollectionActionOptions, ...options };
    const stateKey = `${actionName}State`;
    const executeMethodName = generateExecuteHypermediaCollectionActionMethodName(actionName);
    let linkRoot: Signal<ArrayResource[]> | undefined = undefined;
    let internalResourceMap: Signal<Record<CollectionKey, Resource>> | undefined = undefined;

    return signalStoreFeature(
        withState({
           [stateKey]: defaultHypermediaCollectionActionState 
        }),
        withMethods(store => {
            const requestService = inject(RequestService);

            const executeMethod = async (id: CollectionKey): Promise<HttpResponse<unknown>> => {
                if(getState(store, stateKey).isAvailable[id] && internalResourceMap) {
                    const method = getState(store, stateKey).method[id];
                    const href = getState(store, stateKey).href[id];

                    if(!method || !href) throw new Error('Action is not available');

                    const body = method !== 'DELETE' ? internalResourceMap()[id] : undefined

                    patchState(store, 
                        updateItemState(stateKey, id, { 
                            isExecuting: true, 
                            hasError: false,
                            error: null 
                        }));

                    try {
                        const response = await requestService.request(method, href, body);
                        patchState(store, updateItemState(stateKey, id, { isExecuting: false } ));
                        return response;
                    } catch(e) {
                        patchState(store, updateItemState(stateKey, id, { isExecuting: false, hasError: true, error: e } ));
                        throw e;
                    } 
                } else {
                    throw new Error('Action is not available');
                }
            }

            return {
                [executeMethodName]: executeMethod
            };
        }),
        withHooks({
            onInit(store, hateoasService = inject(HateoasService)) {
                linkRoot = linkRootFn(store as unknown as StoreForCollectionActionLinkRoot<Input>);
                internalResourceMap = computed(() => toResourceMap(linkRoot!(), fullOptions));
                // Wire up linked object with state
                rxMethod<ArrayResource[]>(pipe( 
                    tap(() => patchState(store, updateState(stateKey, defaultHypermediaCollectionActionState))),
                    concatMap(arrayResources => arrayResources),
                    map(arrayResource => [fullOptions.idLookup(arrayResource), fullOptions.resourceLookup(arrayResource)] satisfies [CollectionKey, Resource] as [CollectionKey, Resource]),
                    map(([id, resource]) => [id, hateoasService.getAction(resource, actionMetaName)] satisfies [CollectionKey, ResourceAction | undefined ] as [CollectionKey, ResourceAction | undefined ]),
                    map(([id, action]) => {
                        const actionState: HypermediaActionStateProps = { ...defaultHypermediaActionState };
                        if(action && isValidHref(action.href) && isValidActionVerb(action.method)) {
                            actionState.href = action.href;
                            actionState.method = action.method;
                            actionState.isAvailable = true;
                        }
                        return [id, actionState] satisfies [CollectionKey, HypermediaActionStateProps] as [CollectionKey, HypermediaActionStateProps];
                    }),
                    tap(([id, actionState]) => patchState(store, updateItemState(stateKey, id, actionState)))
                ))(linkRoot);
            }
        })
    );
}
