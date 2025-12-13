import { isSignal, linkedSignal, Signal, WritableSignal } from "@angular/core";
import { DeepSignal, signalStoreFeature, SignalStoreFeature, SignalStoreFeatureResult, StateSignals, withProps } from "@ngrx/signals";

type StoreForWritableStateCopy<Input extends SignalStoreFeatureResult> = StateSignals<Input['state']>;

export type WritableDeepSignal<T> = WritableSignal<T> & DeepSignal<T>;

export type ObjectWithSignalsForStateCopy = {
    [key: string]: Signal<unknown> | ObjectWithSignalsForStateCopy;
}

export type WritableStateCopy<State extends ObjectWithSignalsForStateCopy> = {
        [Key in keyof State]: State[Key] extends ObjectWithSignalsForStateCopy ? 
        WritableStateCopy<State[Key]> 
        : State[Key] extends Signal<infer InnerType> ? 
        WritableSignal<InnerType> : never;
      };

type SelectStateFn<Input extends SignalStoreFeatureResult, StateSelection extends ObjectWithSignalsForStateCopy> = (store: StoreForWritableStateCopy<Input>) => StateSelection

function toWritableStateCopy<T extends ObjectWithSignalsForStateCopy>(stateSelection: T): WritableStateCopy<T> {
    const result: ObjectWithSignalsForStateCopy = {};
    for (const key in stateSelection) {
        const value = stateSelection[key];

        if(isSignal(value)) {
            result[key] = linkedSignal(() => value());
        } else {
            result[key] = toWritableStateCopy(value as ObjectWithSignalsForStateCopy);
        }
    }
    return result as WritableStateCopy<T>;
}

export function withWritableStateCopy<Input extends SignalStoreFeatureResult, StateSelection extends ObjectWithSignalsForStateCopy>(
    stateMapFn: SelectStateFn<Input, StateSelection>
): SignalStoreFeature<
    Input,
    Input & {
        props: WritableStateCopy<ReturnType<SelectStateFn<Input, StateSelection>>>;
    }
>;
export function withWritableStateCopy<Input extends SignalStoreFeatureResult, StateSelection extends ObjectWithSignalsForStateCopy>(
    stateMapFn: SelectStateFn<Input, StateSelection>
) {
    return signalStoreFeature(
        withProps(store => toWritableStateCopy(stateMapFn(store as unknown as StoreForWritableStateCopy<Input>)))
    );
}