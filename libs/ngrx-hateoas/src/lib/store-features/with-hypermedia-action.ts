import { Signal, inject } from "@angular/core";
import { SignalStoreFeature, SignalStoreFeatureResult, StateSignals, patchState, signalStoreFeature, withHooks, withMethods, withState } from "@ngrx/signals";
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
    hasError: boolean
    error: unknown
}

export const defaultHypermediaActionState: HypermediaActionStateProps = {
    href: '',
    method: '',
    isAvailable: false,
    isExecuting: false,
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

export type HypermediaActionMethods<ActionName extends string> = ExecuteHypermediaActionMethod<ActionName>

type StoreForActionLinkRoot<Input extends SignalStoreFeatureResult> = StateSignals<Input['state'] & Input['props']>;
    
type ActionLinkRootFn<T extends SignalStoreFeatureResult> = (store: StoreForActionLinkRoot<T>) => Signal<Resource | undefined>

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
    let linkRoot: Signal<Resource | undefined> | undefined = undefined;

    return signalStoreFeature(
        withState({
           [stateKey]: defaultHypermediaActionState
        }),
        withMethods((store, requestService = inject(RequestService)) => {
            const executeMethod = async (): Promise<HttpResponse<unknown>> => {
                if(getState(store, stateKey).isAvailable && linkRoot) {
                    const method = getState(store, stateKey).method;
                    const href = getState(store, stateKey).href;

                    if(!method || !href) throw new Error('Action is not available');

                    const body = method !== 'DELETE' ? linkRoot() : undefined

                    patchState(store, 
                        updateState(stateKey, { 
                            isExecuting: true, 
                            hasError: false,
                            error: null 
                        }));

                    try {
                        const response = await requestService.request(method, href, body);
                        patchState(store, updateState(stateKey, { isExecuting: false } ));
                        return response;
                    } catch(e) {
                        patchState(store, updateState(stateKey, { isExecuting: false, hasError: true, error: e } ));
                        throw e;
                    } 
                } else {
                    throw new Error('Action is not available');
                }
            };

            return {
                [executeMethodName]: executeMethod
            };
        }),
        withHooks({
            onInit(store, hateoasService = inject(HateoasService)) {
                linkRoot = linkRootFn(store as unknown as StoreForActionLinkRoot<Input>);
                // Wire up linked object with state
                rxMethod<Resource | undefined>(
                    pipe( 
                        tap(() => patchState(store, updateState(stateKey, { href: '', method: '', isAvailable: false } ))),
                        filter(resource => resource !== undefined),
                        map(resource => hateoasService.getAction(resource, actionMetaName)),
                        filter(action => isValidHref(action?.href) && isValidActionVerb(action?.method)),
                        tap(action => patchState(store, updateState(stateKey, { href: action!.href, method: action!.method, isAvailable: true } )))
                    )
                )(linkRoot);
            }
        })
    );
}
