import { Signal, computed, inject } from "@angular/core";
import { SignalStoreFeature, patchState, signalStoreFeature, withMethods, withState } from "@ngrx/signals";
import { filter, map, pipe, tap } from "rxjs";
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { isValidActionVerb, isValidUrl } from "../util/helpers";
import { RequestService } from "../services/request.service";

export type HypermediaActionState<ActionName extends string> = 
{ 
    [K in ActionName]: { 
        href: string
        method: string
        isAvailable: boolean
        isExecuting: boolean 
        hasExecutedSuccessfully: boolean
        hasExecutedWithError: boolean
        hasError: boolean
        error: any
    } 
};

export type ExecuteHypermediaActionMethod<ActionName extends string> = { 
    [K in ActionName as `execute${Capitalize<ActionName>}`]: () => Promise<void>
};

export function generateExecuteHypermediaActionMethodName(actionName: string) {
    return `execute${actionName.charAt(0).toUpperCase() + actionName.slice(1)}`;
}

export type ConnectHypermediaActionMethod<ActionName extends string> = { 
    [K in ActionName as `connect${Capitalize<ActionName>}`]: (linkRoot: Signal<unknown>, action: string) => void
};

export function generateConnectHypermediaActionMethodName(actionName: string) {
    return `connect${actionName.charAt(0).toUpperCase() + actionName.slice(1)}`;
}

export type HypermediaActionMethods<ActionName extends string> = 
    ExecuteHypermediaActionMethod<ActionName> & ConnectHypermediaActionMethod<ActionName>

type actionRxInput = {
    resource: any,
    action: string
}

export function withHypermediaAction<ActionName extends string>(
    actionName: ActionName): SignalStoreFeature<
        { state: {}; signals: {}; methods: {} },
        {
            state: HypermediaActionState<ActionName>;
            signals: {},
            methods: HypermediaActionMethods<ActionName>;
        }
    >;
export function withHypermediaAction<ActionName extends string>(actionName: ActionName) {

    const stateKey = `${actionName}`;
    const executeMethodName = generateExecuteHypermediaActionMethodName(actionName);
    const connectMehtodName = generateConnectHypermediaActionMethodName(actionName);

    return signalStoreFeature(
        withState({
           [stateKey]: {
            href: '',
            method: '',
            isAvailable: false,
            isExecuting: false,
            hasExecutedSuccessfully: false,
            hasExecutedWithError: false,
            hasError: false,
            error: null
           }
        }),
        withMethods((store: any, requestService = inject(RequestService)) => {

            let internalResourceLink: Signal<unknown> | null = null;

            const rxConnectToResource = rxMethod<actionRxInput>(
                pipe( 
                    // ToDo: use HateoasService
                    tap(_ => patchState(store, { [stateKey]: { ...store[stateKey](), href: '', method: '', isAvailable: false } })),
                    map(input => ({href: input.resource?._actions?.[input.action]?.href, method: input.resource?._actions?.[input.action]?.method})),
                    filter(actionMeta => isValidUrl(actionMeta.href) && isValidActionVerb(actionMeta.method)),
                    tap(actionMeta => patchState(store, { [stateKey]: { ...store[stateKey](), href: actionMeta.href, method: actionMeta.method, isAvailable: true } }))
                )
            );

            return {
                [executeMethodName]: async (): Promise<void> => {
                    if(store[stateKey].isAvailable() && internalResourceLink !== null) {
                        const method = store[stateKey].method();
                        const href = store[stateKey].href();
                        const body = method !== 'DELETE' ? internalResourceLink() : undefined

                        patchState(store, { [stateKey]: { ...store[stateKey](), 
                                                          isExecuting: true, 
                                                          hasExecutedSuccessfully: false,
                                                          hasExecutedWithError: false,
                                                          hasError: false,
                                                           error: null 
                                                        } });

                        try {
                            await requestService.request(method, href, body);
                            patchState(store, { [stateKey]: { ...store[stateKey](), isExecuting: false, hasExecutedSuccessfully: true } });
                        } catch(e) {
                            patchState(store, { [stateKey]: { ...store[stateKey](), isExecuting: false, hasExecutedWithError: true, hasError: true, error: e } });
                            throw e;
                        } 
                    }
                },
                [connectMehtodName]: (resourceLink: Signal<unknown>, action: string) => { 
                    if(internalResourceLink === null) {
                        internalResourceLink = resourceLink;
                        const input = computed(() => ({ resource: resourceLink(), action }));
                        rxConnectToResource(input);
                    }
                }
            };
        })
    );
}
