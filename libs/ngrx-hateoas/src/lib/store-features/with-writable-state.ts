import { Signal, WritableSignal } from "@angular/core";
import { DeepSignal, signalStoreFeature, SignalStoreFeature, SignalStoreFeatureResult, StateSignals, withProps } from "@ngrx/signals";

type StoreForWritableStateRoot<Input extends SignalStoreFeatureResult> = StateSignals<Input['state']>;

export type WritableDeepSignal<T> = WritableSignal<T> & DeepSignal<T>;

export type ObjectWithSignals = Record<string, Signal<unknown> | Record<string, Signal<unknown>>>;

export type WritableStateSignals<State extends ObjectWithSignals> = {
        [Key in keyof State]: State[Key] extends ObjectWithSignals ? 
        WritableStateSignals<State[Key]> 
        : State[Key] extends Signal<infer InnerType> ? 
        WritableDeepSignal<InnerType> : never;
      };

type StateMapFn<T extends SignalStoreFeatureResult, R extends ObjectWithSignals> = (store: StoreForWritableStateRoot<T>) => R

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
        withProps(store => stateMapFn(store as unknown as StoreForWritableStateRoot<Input>))
    );
}