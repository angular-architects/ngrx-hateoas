import { Signal, computed, inject } from "@angular/core";
import { SignalStoreFeature, patchState, signalStoreFeature, withMethods, withState } from "@ngrx/signals";
import { from, map, mergeMap, pipe, tap } from "rxjs";
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { isValidActionVerb } from "../util/is-valid-action-verb";
import { isValidHref } from "../util/is-valid-href";
import { RequestService } from "../services/request.service";
import { HateoasService } from "../services/hateoas.service";
import { defaultHypermediaActionState, HypermediaActionStateProps } from "./with-hypermedia-action";
import { ResourceAction } from "../models";

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
    [K in ActionName]: (id: CollectionKey) => Promise<void>
};

export function generateExecuteHypermediaCollectionActionMethodName(actionName: string) {
    return actionName;
}

export type ConnectHypermediaCollectionActionMethod<ActionName extends string> = { 
    [K in ActionName as `_connect${Capitalize<ActionName>}`]: (linkRoot: Signal<unknown[]>, action: string) => void
};

export function generateConnectHypermediaCollectionActionMethodName(actionName: string) {
    return `_connect${actionName.charAt(0).toUpperCase() + actionName.slice(1)}`;
}

export type HypermediaCollectionActionMethods<ActionName extends string> = 
    ExecuteHypermediaCollectionActionMethod<ActionName> & ConnectHypermediaCollectionActionMethod<ActionName>

type ActionRxInput = {
    resource: unknown[],
    idLookup: (resource: unknown) => CollectionKey,
    action: string
}

function getState(store: unknown, stateKey: string): HypermediaCollectionActionStateProps {
    return (store as Record<string, Signal<HypermediaCollectionActionStateProps>>)[stateKey]()
}

function updateState(stateKey: string, partialState: Partial<HypermediaCollectionActionStateProps>) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (state: any) => ({ [stateKey]: { ...state[stateKey], ...partialState } });
}

function toResourceMap(resources: unknown[], idLookup: (resource: unknown) => CollectionKey): Record<CollectionKey, unknown> {
    const result: Record<CollectionKey, unknown> = {};
    resources.forEach(resource => result[idLookup(resource)] = resource);
    return result;
}

function updateItemState(stateKey: string, id: CollectionKey, itemState: Partial<HypermediaActionStateProps> ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (state: { [K in any]: HypermediaCollectionActionStateProps}) => ({ [stateKey]: { 
        href: itemState.href ? { ...state[stateKey].href, [id]: itemState.href } : state[stateKey].href,
        method: itemState.method ? { ...state[stateKey].method, [id]: itemState.method } : state[stateKey].method,
        isAvailable: itemState.isAvailable ? { ...state[stateKey].isAvailable, [id]: itemState.isAvailable } : state[stateKey].isAvailable,
        isExecuting: itemState.isExecuting ? { ...state[stateKey].isExecuting, [id]: itemState.isExecuting } : state[stateKey].isExecuting,
        hasExecutedSuccessfully: itemState.hasExecutedSuccessfully ? { ...state[stateKey].hasExecutedSuccessfully, [id]: itemState.hasExecutedSuccessfully } : state[stateKey].hasExecutedSuccessfully,
        hasExecutedWithError: itemState.hasExecutedWithError ? { ...state[stateKey].hasExecutedWithError, [id]: itemState.hasExecutedWithError } : state[stateKey].hasExecutedWithError,
        hasError: itemState.hasError ? { ...state[stateKey].hasError, [id]: itemState.hasError } : state[stateKey].hasError,
        error: itemState.error ? { ...state[stateKey].error, [id]: itemState.error } : state[stateKey].error
    } satisfies HypermediaCollectionActionStateProps
 });
}

export function withHypermediaCollectionAction<ActionName extends string>(
    actionName: ActionName): SignalStoreFeature<
        { 
            state: object;
            computed: Record<string, Signal<unknown>>;
            methods: Record<string, Function> 
        },
        {
            state: HypermediaCollectionActionStoreState<ActionName>;
            computed: Record<string, Signal<unknown>>;
            methods: HypermediaCollectionActionMethods<ActionName>;
        }
    >;
export function withHypermediaCollectionAction<ActionName extends string>(actionName: ActionName) {

    const stateKey = `${actionName}State`;
    const executeMethodName = generateExecuteHypermediaCollectionActionMethodName(actionName);
    const connectMehtodName = generateConnectHypermediaCollectionActionMethodName(actionName);

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
                            map(resource => [resource, hateoasService.getAction(resource, input.action)] satisfies [unknown, ResourceAction | undefined ] as [unknown, ResourceAction | undefined ]),
                            map(([resource, action]) => {
                                const actionState: HypermediaActionStateProps = defaultHypermediaActionState;
                                if(action && isValidHref(action.href) && isValidActionVerb(action.method)) {
                                    actionState.href = action.href;
                                    actionState.method = action.method;
                                }
                                return [resource, actionState] satisfies [unknown, HypermediaActionStateProps] as [unknown, HypermediaActionStateProps];
                            }),
                            tap(([resource, actionState]) => patchState(store, updateItemState(stateKey, input.idLookup(resource), actionState)))
                        ))
                )
            );

            return {
                [executeMethodName]: async (id: CollectionKey): Promise<void> => {
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
                            await requestService.request(method, href, body);
                            patchState(store, updateItemState(stateKey, id, { isExecuting: false, hasExecutedSuccessfully: true } ));
                        } catch(e) {
                            patchState(store, updateItemState(stateKey, id, { isExecuting: false, hasExecutedWithError: true, hasError: true, error: e } ));
                            throw e;
                        } 
                    }
                },
                [connectMehtodName]: (resourceLink: Signal<unknown[]>, idLookup: (resource: unknown) => CollectionKey, action: string) => { 
                    if(!internalResourceMap) {
                        internalResourceMap = computed(() => toResourceMap(resourceLink(), idLookup));
                        const input = computed(() => ({ resource: resourceLink(), idLookup, action }));
                        rxConnectToResource(input);
                    }
                }
            };
        })
    );
}
