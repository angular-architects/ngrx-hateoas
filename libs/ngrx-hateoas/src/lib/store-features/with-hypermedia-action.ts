import { Signal, computed, inject } from "@angular/core";
import { SignalStoreFeature, patchState, signalStoreFeature, withMethods, withState } from "@ngrx/signals";
import { filter, map, pipe, tap } from "rxjs";
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { isValidActionVerb } from "../util/is-valid-action-verb";
import { isValidHref } from "../util/is-valid-href";
import { RequestService } from "../services/request.service";
import { HateoasService } from "../services/hateoas.service";

export type HypermediaActionProps = { 
    href: string
    method: 'PUT' | 'POST' | 'DELETE',
    isAvailable: boolean
    isExecuting: boolean 
    hasExecutedSuccessfully: boolean
    hasExecutedWithError: boolean
    hasError: boolean
    error: unknown
}

export type HypermediaActionState<ActionName extends string> = 
{ 
    [K in ActionName]: HypermediaActionProps
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
    resource: unknown,
    action: string
}

function getState(store: unknown, stateKey: string): HypermediaActionProps {
    return (store as Record<string, Signal<HypermediaActionProps>>)[stateKey]()
}

export function withHypermediaAction<ActionName extends string>(
    actionName: ActionName): SignalStoreFeature<
        { state: object; computed: Record<string, Signal<unknown>>; methods: Record<string, Function> },
        {
            state: HypermediaActionState<ActionName>;
            computed: Record<string, Signal<unknown>>;
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
            error: null as unknown
           }
        }),
        withMethods((store, requestService = inject(RequestService)) => {

            const hateoasService = inject(HateoasService);
            let internalResourceLink: Signal<unknown> | null = null;

            const rxConnectToResource = rxMethod<actionRxInput>(
                pipe( 
                    tap(() => patchState(store, { [stateKey]: { ...getState(store, stateKey), href: '', method: '', isAvailable: false } })),
                    map(input => hateoasService.getAction(input.resource, input.action)),
                    filter(action => isValidHref(action?.href) && isValidActionVerb(action?.method)),
                    map(action => action!),
                    tap(action => patchState(store, { [stateKey]: { ...getState(store, stateKey), href: action.href, method: action.method, isAvailable: true } }))
                )
            );

            return {
                [executeMethodName]: async (): Promise<void> => {
                    if(getState(store, stateKey).isAvailable && internalResourceLink !== null) {
                        const method = getState(store, stateKey).method;
                        const href = getState(store, stateKey).href;
                        const body = method !== 'DELETE' ? internalResourceLink() : undefined

                        patchState(store, { [stateKey]: { ...getState(store, stateKey), 
                                                          isExecuting: true, 
                                                          hasExecutedSuccessfully: false,
                                                          hasExecutedWithError: false,
                                                          hasError: false,
                                                           error: null 
                                                        } });

                        try {
                            await requestService.request(method, href, body);
                            patchState(store, { [stateKey]: { ...getState(store, stateKey), isExecuting: false, hasExecutedSuccessfully: true } });
                        } catch(e) {
                            patchState(store, { [stateKey]: { ...getState(store, stateKey), isExecuting: false, hasExecutedWithError: true, hasError: true, error: e } });
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
