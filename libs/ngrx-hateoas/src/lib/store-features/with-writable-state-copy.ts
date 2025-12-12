import { isSignal, linkedSignal, Signal, WritableSignal } from "@angular/core";
import { deepComputed, DeepSignal, signalStoreFeature, SignalStoreFeature, SignalStoreFeatureResult, StateSignals, withProps } from "@ngrx/signals";

type StoreForWritableStateCopy<Input extends SignalStoreFeatureResult> = StateSignals<Input['state']>;

export type WritableDeepSignal<T> = WritableSignal<T> & DeepSignal<T>;

export type ObjectWithSignals = {
    [key: string]: Signal<object> | ObjectWithSignals;
}

export type WritableStateCopy<State extends ObjectWithSignals> = {
        [Key in keyof State]: State[Key] extends ObjectWithSignals ? 
        WritableStateCopy<State[Key]> 
        : State[Key] extends Signal<infer InnerType> ? 
        WritableDeepSignal<InnerType> : never;
      };

type SelectStateFn<Input extends SignalStoreFeatureResult, StateSelection extends ObjectWithSignals> = (store: StoreForWritableStateCopy<Input>) => StateSelection

function toWritableStateCopy<T extends ObjectWithSignals>(stateSelection: T): WritableStateCopy<T> {
    const result: ObjectWithSignals = {};
    for (const key in stateSelection) {
        const value = stateSelection[key];

        if(isSignal(value)) {
            const stateCopySignal = linkedSignal(() => value());
            const deepComputedStateCopy: any = deepComputed(() => stateCopySignal());
            deepComputedStateCopy.set = (newValue: object) => stateCopySignal.set(newValue);
            result[key] = deepComputedStateCopy;
        } else {
            result[key] = toWritableStateCopy(value as ObjectWithSignals);
        }
    }
    return result as WritableStateCopy<T>;
}

export function withWritableStateCopy<Input extends SignalStoreFeatureResult, StateSelection extends ObjectWithSignals>(
    stateMapFn: SelectStateFn<Input, StateSelection>
): SignalStoreFeature<
    Input,
    Input & {
        props: WritableStateCopy<ReturnType<SelectStateFn<Input, StateSelection>>>;
    }
>;
export function withWritableStateCopy<Input extends SignalStoreFeatureResult, StateSelection extends ObjectWithSignals>(
    stateMapFn: SelectStateFn<Input, StateSelection>
) {
    return signalStoreFeature(
        withProps(store => toWritableStateCopy(stateMapFn(store as unknown as StoreForWritableStateCopy<Input>)))
    );
}