import { computed, isSignal, Signal, WritableSignal } from "@angular/core";
import { DeepSignal, patchState, signalStoreFeature, SignalStoreFeature, SignalStoreFeatureResult, StateSignals, withProps, WritableStateSource } from "@ngrx/signals";
import { DeepWritableSignal, toDeepWritableSignal } from "../util/deep-writeable-signal";

export type ObjectWithDeepWritableSignals = {
    [key: string]: WritableSignal<unknown> | DeepWritableSignal<object> | ObjectWithDeepWritableSignals;
}

type MappedStoreState<Input extends SignalStoreFeatureResult> = {
    [Key in keyof StateSignals<Input['state']>]: StateSignals<Input['state']>[Key] extends DeepSignal<infer InnerType> ? DeepWritableSignal<InnerType> : WritableSignal<unknown>;
}

export type DeepWritableStateDelegate<State extends ObjectWithDeepWritableSignals> = {
        [Key in keyof State]: State[Key] extends ObjectWithDeepWritableSignals ? 
        DeepWritableStateDelegate<State[Key]> 
        : State[Key] extends Signal<infer InnerType> ? 
        DeepWritableSignal<InnerType> : never;
      };

type SelectStateFn<Input extends SignalStoreFeatureResult, StateSelection extends ObjectWithDeepWritableSignals> = (store: MappedStoreState<Input>) => StateSelection

export function withExperimentalDeepWritableStateDelegate<Input extends SignalStoreFeatureResult, StateSelection extends ObjectWithDeepWritableSignals>(
    stateMapFn: SelectStateFn<Input, StateSelection>
): SignalStoreFeature<
    Input,
    Input & {
        props: DeepWritableStateDelegate<ReturnType<SelectStateFn<Input, StateSelection>>>;
    }
>;
export function withExperimentalDeepWritableStateDelegate<Input extends SignalStoreFeatureResult, StateSelection extends ObjectWithDeepWritableSignals>(
    stateMapFn: SelectStateFn<Input, StateSelection>
) {
    return signalStoreFeature(
        withProps((store: WritableStateSource<object> & Record<string, Signal<unknown>>) => {
            const mappedStoreState: ObjectWithDeepWritableSignals = {};
            for (const key in store) {
                if (isSignal(store[key])) {
                    mappedStoreState[key] = toDeepWritableSignal<unknown>(newVal => patchState(store, { [key]: newVal }), computed(() => store[key]()));
                }
            }
            return stateMapFn(mappedStoreState as MappedStoreState<Input>)
        })
    );
}