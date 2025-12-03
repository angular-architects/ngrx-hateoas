import { isSignal, linkedSignal, Signal, WritableSignal } from "@angular/core";
import { DeepSignal, signalStoreFeature, SignalStoreFeature, SignalStoreFeatureResult, StateSignals, withProps } from "@ngrx/signals";

type StoreForWritableStateRoot<Input extends SignalStoreFeatureResult> = StateSignals<Input['state']>;

export type WritableDeepSignal<T> = WritableSignal<T> & DeepSignal<T>;

export type ObjectWithSignals = {
    [key: string]: Signal<unknown> | ObjectWithSignals;
}

export type WritableStateSignals<State extends ObjectWithSignals> = {
        [Key in keyof State]: State[Key] extends ObjectWithSignals ? 
        WritableStateSignals<State[Key]> 
        : State[Key] extends Signal<infer InnerType> ? 
        WritableDeepSignal<InnerType> : never;
      };

type StateMapFn<T extends SignalStoreFeatureResult, R extends ObjectWithSignals> = (store: StoreForWritableStateRoot<T>) => R

function toWritableStateSignals<T extends ObjectWithSignals>(input: T): WritableStateSignals<T> {
    const result: ObjectWithSignals = {};
    for (const key in input) {
        const value = input[key];

        if(isSignal(value)) {
            result[key] = linkedSignal(() => value());
        } else {
            result[key] = toWritableStateSignals(value as ObjectWithSignals);
        }
    }
    return result as WritableStateSignals<T>;
}

export function withWritableState<Input extends SignalStoreFeatureResult, R extends ObjectWithSignals>(
    stateMapFn: StateMapFn<Input, R>
): SignalStoreFeature<
    Input,
    Input & {
        props: WritableStateSignals<ReturnType<StateMapFn<Input, R>>>;
    }
>;
export function withWritableState<Input extends SignalStoreFeatureResult, R extends ObjectWithSignals>(
    stateMapFn: StateMapFn<Input, R>
) {
    return signalStoreFeature(
        withProps(store => toWritableStateSignals(stateMapFn(store as unknown as StoreForWritableStateRoot<Input>)))
    );
}