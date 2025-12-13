import { isSignal, linkedSignal, Signal } from "@angular/core";
import { signalStoreFeature, SignalStoreFeature, SignalStoreFeatureResult, StateSignals, withProps } from "@ngrx/signals";
import { deepWritableFromSignal, DeepWritableSignal } from "../util/deep-writeable-signal";

type StoreForDeepWritableStateCopy<Input extends SignalStoreFeatureResult> = StateSignals<Input['state']>;

export type ObjectWithSignalsForDeepStateCopy = {
    [key: string]: Signal<unknown> | ObjectWithSignalsForDeepStateCopy;
}

export type DeepWritableStateCopy<State extends ObjectWithSignalsForDeepStateCopy> = {
        [Key in keyof State]: State[Key] extends ObjectWithSignalsForDeepStateCopy ? 
        DeepWritableStateCopy<State[Key]> 
        : State[Key] extends Signal<infer InnerType> ? 
        DeepWritableSignal<InnerType> : never;
      };

type SelectStateFn<Input extends SignalStoreFeatureResult, StateSelection extends ObjectWithSignalsForDeepStateCopy> = (store: StoreForDeepWritableStateCopy<Input>) => StateSelection

function toDeepWritableStateCopy<T extends ObjectWithSignalsForDeepStateCopy>(stateSelection: T): DeepWritableStateCopy<T> {
    const result: ObjectWithSignalsForDeepStateCopy = {};
    for (const key in stateSelection) {
        const value = stateSelection[key];

        if(isSignal(value)) {
            const stateCopy = linkedSignal(() => value());
            result[key] = deepWritableFromSignal(stateCopy);
        } else {
            result[key] = toDeepWritableStateCopy(value as ObjectWithSignalsForDeepStateCopy);
        }
    }
    return result as DeepWritableStateCopy<T>;
}

export function withExperimentalDeepWritableStateCopy<Input extends SignalStoreFeatureResult, StateSelection extends ObjectWithSignalsForDeepStateCopy>(
    stateMapFn: SelectStateFn<Input, StateSelection>
): SignalStoreFeature<
    Input,
    Input & {
        props: DeepWritableStateCopy<ReturnType<SelectStateFn<Input, StateSelection>>>;
    }
>;
export function withExperimentalDeepWritableStateCopy<Input extends SignalStoreFeatureResult, StateSelection extends ObjectWithSignalsForDeepStateCopy>(
    stateMapFn: SelectStateFn<Input, StateSelection>
) {
    return signalStoreFeature(
        withProps(store => toDeepWritableStateCopy(stateMapFn(store as unknown as StoreForDeepWritableStateCopy<Input>)))
    );
}