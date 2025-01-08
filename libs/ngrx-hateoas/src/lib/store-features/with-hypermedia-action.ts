import { Signal, computed, inject } from "@angular/core";
import { SignalStoreFeature, patchState, signalStoreFeature, withMethods, withState } from "@ngrx/signals";
import { filter, map, pipe, tap } from "rxjs";
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { isValidActionVerb } from "../util/is-valid-action-verb";
import { isValidHref } from "../util/is-valid-href";
import { RequestService } from "../services/request.service";
import { HateoasService } from "../services/hateoas.service";

export type HypermediaActionStateProps = { 
    method: '' | 'PUT' | 'POST' | 'DELETE'
    href: string
    isAvailable: boolean
    isExecuting: boolean 
    hasExecutedSuccessfully: boolean
    hasExecutedWithError: boolean
    hasError: boolean
    error: unknown
}

export const defaultHypermediaActionState: HypermediaActionStateProps = {
    href: '',
    method: '',
    isAvailable: false,
    isExecuting: false,
    hasExecutedSuccessfully: false,
    hasExecutedWithError: false,
    hasError: false,
    error: null as unknown
}

export type HypermediaActionStoreState<ActionName extends string> = 
{ 
    [K in `${ActionName}State`]: HypermediaActionStateProps
};

export type ExecuteHypermediaActionMethod<ActionName extends string> = { 
    [K in ActionName]: () => Promise<void>
};

export function generateExecuteHypermediaActionMethodName(actionName: string) {
    return actionName;
}

export type ConnectHypermediaActionMethod<ActionName extends string> = { 
    [K in ActionName as `_connect${Capitalize<ActionName>}`]: (linkRoot: Signal<unknown>, action: string) => void
};

export function generateConnectHypermediaActionMethodName(actionName: string) {
    return `_connect${actionName.charAt(0).toUpperCase() + actionName.slice(1)}`;
}

export type HypermediaActionMethods<ActionName extends string> = 
    ExecuteHypermediaActionMethod<ActionName> & ConnectHypermediaActionMethod<ActionName>

type actionRxInput = {
    resource: unknown,
    action: string
}

function getState(store: unknown, stateKey: string): HypermediaActionStateProps {
    return (store as Record<string, Signal<HypermediaActionStateProps>>)[stateKey]()
}

function updateState(stateKey: string, partialState: Partial<HypermediaActionStateProps>) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (state: any) => ({ [stateKey]: { ...state[stateKey], ...partialState } });
}

export function withHypermediaAction<ActionName extends string>(
    actionName: ActionName): SignalStoreFeature<
        { 
            state: object;
            computed: Record<string, Signal<unknown>>;
            methods: Record<string, Function> 
        },
        {
            state: HypermediaActionStoreState<ActionName>;
            computed: Record<string, Signal<unknown>>;
            methods: HypermediaActionMethods<ActionName>;
        }
    >;
export function withHypermediaAction<ActionName extends string>(actionName: ActionName) {

    const stateKey = `${actionName}State`;
    const executeMethodName = generateExecuteHypermediaActionMethodName(actionName);
    const connectMethodName = generateConnectHypermediaActionMethodName(actionName);

    return signalStoreFeature(
        withState({
           [stateKey]: defaultHypermediaActionState
        }),
        withMethods((store, requestService = inject(RequestService)) => {

            const hateoasService = inject(HateoasService);
            let internalResourceLink: Signal<unknown> | undefined;

            const rxConnectToResource = rxMethod<actionRxInput>(
                pipe( 
                    tap(() => patchState(store, updateState(stateKey, { href: '', method: '', isAvailable: false } ))),
                    map(input => hateoasService.getAction(input.resource, input.action)),
                    filter(action => isValidHref(action?.href) && isValidActionVerb(action?.method)),
                    map(action => action!),
                    tap(action => patchState(store, updateState(stateKey, { href: action.href, method: action.method, isAvailable: true } )))
                )
            );

            return {
                [executeMethodName]: async (): Promise<void> => {
                    if(getState(store, stateKey).isAvailable && internalResourceLink) {
                        const method = getState(store, stateKey).method;
                        const href = getState(store, stateKey).href;

                        if(!method || !href) throw new Error('Action is not available');

                        const body = method !== 'DELETE' ? internalResourceLink() : undefined

                        patchState(store, 
                            updateState(stateKey, { 
                                isExecuting: true, 
                                hasExecutedSuccessfully: false,
                                hasExecutedWithError: false,
                                hasError: false,
                                error: null 
                            }));

                        try {
                            await requestService.request(method, href, body);
                            patchState(store, updateState(stateKey, { isExecuting: false, hasExecutedSuccessfully: true } ));
                        } catch(e) {
                            patchState(store, updateState(stateKey, { isExecuting: false, hasExecutedWithError: true, hasError: true, error: e } ));
                            throw e;
                        } 
                    }
                },
                [connectMethodName]: (resourceLink: Signal<unknown>, action: string) => { 
                    if(!internalResourceLink) {
                        internalResourceLink = resourceLink;
                        const input = computed(() => ({ resource: resourceLink(), action }));
                        rxConnectToResource(input);
                    }
                }
            };
        })
    );
}
