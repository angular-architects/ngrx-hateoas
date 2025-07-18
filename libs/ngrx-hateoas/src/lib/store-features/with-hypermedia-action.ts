import { Signal, computed, inject } from "@angular/core";
import { SignalStoreFeature, SignalStoreFeatureResult, StateSignals, patchState, signalStoreFeature, withComputed, withHooks, withMethods, withState } from "@ngrx/signals";
import { filter, map, pipe, tap } from "rxjs";
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { isValidActionVerb } from "../util/is-valid-action-verb";
import { isValidHref } from "../util/is-valid-href";
import { RequestService } from "../services/request.service";
import { HateoasService } from "../services/hateoas.service";
import { HttpResponse } from "@angular/common/http";
import { Resource } from "../models";

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
    [K in ActionName]: () => Promise<HttpResponse<unknown>>
};

export function generateExecuteHypermediaActionMethodName(actionName: string) {
    return actionName;
}

export type HypermediaActionMethods<ActionName extends string> = 
    ExecuteHypermediaActionMethod<ActionName>

type StoreForActionLinkRoot<Input extends SignalStoreFeatureResult> = StateSignals<Input['state']>;
    
type ActionLinkRootFn<T extends SignalStoreFeatureResult> = (store: StoreForActionLinkRoot<T>) => Signal<Resource>
    
type LinkedActionRxInput = {
    resource: Resource,
    actionMetaName: string
}

function getState(store: unknown, stateKey: string): HypermediaActionStateProps {
    return (store as Record<string, Signal<HypermediaActionStateProps>>)[stateKey]()
}

function updateState(stateKey: string, partialState: Partial<HypermediaActionStateProps>) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (state: any) => ({ [stateKey]: { ...state[stateKey], ...partialState } });
}

export function withHypermediaAction<ActionName extends string, Input extends SignalStoreFeatureResult>(
    actionName: ActionName,
    linkRootFn: ActionLinkRootFn<Input>, 
    actionMetaName: string): SignalStoreFeature<
        Input,
        Input & {
            state: HypermediaActionStoreState<ActionName>;
            methods: HypermediaActionMethods<ActionName>;
        }
    >;
export function withHypermediaAction<ActionName extends string, Input extends SignalStoreFeatureResult>(
    actionName: ActionName,
    linkRootFn: ActionLinkRootFn<Input>, 
    actionMetaName: string) {

    const stateKey = `${actionName}State`;
    const executeMethodName = generateExecuteHypermediaActionMethodName(actionName);

    return signalStoreFeature(
        withState({
           [stateKey]: defaultHypermediaActionState
        }),
        withComputed(store => {
            const linkRoot = linkRootFn(store as unknown as StoreForActionLinkRoot<Input>);
            return {
                _linkRoot: linkRoot,
                _linkedActionRxInput: computed(() => ({ resource: linkRoot(), actionMetaName }))
            }
        }),
        withMethods(store => {
            const requestService = inject(RequestService);
            const hateoasService = inject(HateoasService);

            const executeMethod = async (): Promise<HttpResponse<unknown>> => {
                if(getState(store, stateKey).isAvailable) {
                    const method = getState(store, stateKey).method;
                    const href = getState(store, stateKey).href;

                    if(!method || !href) throw new Error('Action is not available');

                    const body = method !== 'DELETE' ? store._linkRoot() : undefined

                    patchState(store, 
                        updateState(stateKey, { 
                            isExecuting: true, 
                            hasExecutedSuccessfully: false,
                            hasExecutedWithError: false,
                            hasError: false,
                            error: null 
                        }));

                    try {
                        const response = await requestService.request(method, href, body);
                        patchState(store, updateState(stateKey, { isExecuting: false, hasExecutedSuccessfully: true } ));
                        return response;
                    } catch(e) {
                        patchState(store, updateState(stateKey, { isExecuting: false, hasExecutedWithError: true, hasError: true, error: e } ));
                        throw e;
                    } 
                } else {
                    throw new Error('Action is not available');
                }
            };

            const rxConnectToResourceMethod = rxMethod<LinkedActionRxInput>(
                    pipe( 
                        tap(() => patchState(store, updateState(stateKey, { href: '', method: '', isAvailable: false } ))),
                        map(input => hateoasService.getAction(input.resource, input.actionMetaName)),
                        filter(action => isValidHref(action?.href) && isValidActionVerb(action?.method)),
                        map(action => action!),
                        tap(action => patchState(store, updateState(stateKey, { href: action.href, method: action.method, isAvailable: true } )))
                    )
                );

            return {
                [executeMethodName]: executeMethod,
                _rxConnectToResource: rxConnectToResourceMethod
            };
        }),
        withHooks({
            onInit(store) {
                store._rxConnectToResource(store._linkedActionRxInput);
            }
        })
    );
}
