import { Signal, computed, inject } from "@angular/core";
import { SignalStoreFeature, patchState, signalStoreFeature, withMethods, withState } from "@ngrx/signals";
import { from, map, mergeMap, pipe, tap } from "rxjs";
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
    hasExecutedSuccessfully: Record<CollectionKey, boolean>
    hasExecutedWithError: Record<CollectionKey, boolean>
    hasError: Record<CollectionKey, boolean>
    error: Record<CollectionKey, unknown>
}

const defaultHypermediaCollectionActionState: HypermediaCollectionActionStateProps = {
    method: {},
    href: {},
    isAvailable: {},
    isExecuting: {},
    hasExecutedSuccessfully: {},
    hasExecutedWithError: {},
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

type ActionRxInput = {
    resource: Resource[],
    idLookup: (resource: Resource) => CollectionKey,
    action: string
}

function getState(store: unknown, stateKey: string): HypermediaCollectionActionStateProps {
    return (store as Record<string, Signal<HypermediaCollectionActionStateProps>>)[stateKey]()
}

function updateState(stateKey: string, partialState: Partial<HypermediaCollectionActionStateProps>) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (state: any) => ({ [stateKey]: { ...state[stateKey], ...partialState } });
}

function toResourceMap(resources: Resource[], idLookup: (resource: Resource) => CollectionKey): Record<CollectionKey, Resource> {
    const result: Record<CollectionKey, Resource> = {};
    resources.forEach(resource => result[idLookup(resource)] = resource);
    return result;
}

function updateItemState(stateKey: string, id: CollectionKey, itemState: Partial<HypermediaActionStateProps> ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (state: { [K in any]: HypermediaCollectionActionStateProps}) => ({ [stateKey]: { 
        href: itemState.href !== undefined ? { ...state[stateKey].href, [id]: itemState.href } : state[stateKey].href,
        method: itemState.method !== undefined ? { ...state[stateKey].method, [id]: itemState.method } : state[stateKey].method,
        isAvailable: itemState.isAvailable !== undefined ? { ...state[stateKey].isAvailable, [id]: itemState.isAvailable } : state[stateKey].isAvailable,
        isExecuting: itemState.isExecuting !== undefined ? { ...state[stateKey].isExecuting, [id]: itemState.isExecuting } : state[stateKey].isExecuting,
        hasExecutedSuccessfully: itemState.hasExecutedSuccessfully !== undefined ? { ...state[stateKey].hasExecutedSuccessfully, [id]: itemState.hasExecutedSuccessfully } : state[stateKey].hasExecutedSuccessfully,
        hasExecutedWithError: itemState.hasExecutedWithError !== undefined ? { ...state[stateKey].hasExecutedWithError, [id]: itemState.hasExecutedWithError } : state[stateKey].hasExecutedWithError,
        hasError: itemState.hasError !== undefined ? { ...state[stateKey].hasError, [id]: itemState.hasError } : state[stateKey].hasError,
        error: itemState.error !== undefined ? { ...state[stateKey].error, [id]: itemState.error } : state[stateKey].error
    } satisfies HypermediaCollectionActionStateProps
 });
}

export function withHypermediaCollectionAction<ActionName extends string>(
    actionName: ActionName): SignalStoreFeature<
        { 
            state: object;
            computed: Record<string, Signal<unknown>>;
            methods: Record<string, Function>;
            props: object;
        },
        {
            state: HypermediaCollectionActionStoreState<ActionName>;
            computed: Record<string, Signal<unknown>>;
            methods: HypermediaCollectionActionMethods<ActionName>;
            props: object;
        }
    >;
export function withHypermediaCollectionAction<ActionName extends string>(actionName: ActionName) {

    const stateKey = `${actionName}State`;
    const executeMethodName = generateExecuteHypermediaCollectionActionMethodName(actionName);
    const connectMethodName = generateConnectHypermediaCollectionActionMethodName(actionName);

    return signalStoreFeature(
        withState({
           [stateKey]: defaultHypermediaCollectionActionState 
        }),
        withMethods((store, requestService = inject(RequestService)) => {

            const hateoasService = inject(HateoasService);
            let internalResourceMap: Signal<Record<CollectionKey, unknown>> | undefined;

            const rxConnectToResource = rxMethod<ActionRxInput>(
                pipe( 
                    tap(() => patchState(store, updateState(stateKey, defaultHypermediaCollectionActionState))),
                    mergeMap(input => from(input.resource)
                        .pipe(
                            map(resource => [resource, hateoasService.getAction(resource, input.action)] satisfies [Resource, ResourceAction | undefined ] as [Resource, ResourceAction | undefined ]),
                            map(([resource, action]) => {
                                const actionState: HypermediaActionStateProps = { ...defaultHypermediaActionState };
                                if(action && isValidHref(action.href) && isValidActionVerb(action.method)) {
                                    actionState.href = action.href;
                                    actionState.method = action.method;
                                    actionState.isAvailable = true;
                                }
                                return [resource, actionState] satisfies [Resource, HypermediaActionStateProps] as [Resource, HypermediaActionStateProps];
                            }),
                            tap(([resource, actionState]) => patchState(store, updateItemState(stateKey, input.idLookup(resource), actionState)))
                        ))
                )
            );

            return {
                [executeMethodName]: async (id: CollectionKey): Promise<HttpResponse<unknown>> => {
                    if(getState(store, stateKey).isAvailable[id] && internalResourceMap) {
                        const method = getState(store, stateKey).method[id];
                        const href = getState(store, stateKey).href[id];

                        if(!method || !href) throw new Error('Action is not available');

                        const body = method !== 'DELETE' ? internalResourceMap()[id] : undefined

                        patchState(store, 
                            updateItemState(stateKey, id, { 
                                isExecuting: true, 
                                hasExecutedSuccessfully: false,
                                hasExecutedWithError: false,
                                hasError: false,
                                error: null 
                            }));

                        try {
                            const response = await requestService.request(method, href, body);
                            patchState(store, updateItemState(stateKey, id, { isExecuting: false, hasExecutedSuccessfully: true } ));
                            return response;
                        } catch(e) {
                            patchState(store, updateItemState(stateKey, id, { isExecuting: false, hasExecutedWithError: true, hasError: true, error: e } ));
                            throw e;
                        } 
                    } else {
                        throw new Error('Action is not available');
                    }
                },
                [connectMethodName]: (resourceLink: Signal<Resource[]>, idKeyName: string, action: string) => { 
                    if(!internalResourceMap) {
                        const idLookup = (resource: Resource) => { 
                            const id = resource[idKeyName];
                            if(typeof id === 'string' || typeof id === 'number') return id;
                            else throw new Error("The specified 'idKeyName' must point to a key with a value of type 'string' or 'number'");
                        };
                        internalResourceMap = computed(() => toResourceMap(resourceLink(), idLookup));
                        const input = computed(() => ({ resource: resourceLink(), idLookup, action }));
                        rxConnectToResource(input);
                    }
                }
            };
        })
    );
}
