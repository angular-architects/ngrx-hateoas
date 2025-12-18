---
sidebar_position: 2
---

# withExperimentalDeepWritableStateCopy
Creates a writable copy of selected state signals. The copy is linked to the original signals. If the original state signals change, the writable copy will reflect those changes. Writing to the writable copy will not update the original state signals. Furthermore the wiritable copy is also a deep writable signal so that you get fine grained reactivity when working with your copy and additionally you can write deeply nested properties.

:::warning
This feature is experimental and might change or be removed in future versions.
:::

## API
```ts
function withExperimentalDeepWritableStateCopy<Input extends SignalStoreFeatureResult, StateSelection extends ObjectWithSignalsForStateCopy>(
    stateMapFn: (store: StateSignals<Input['state']>) => StateSelection
): SignalStoreFeature;
```

* **stateMapFn**: A selector function that receives the store's state signals and returns an object describing which signals (and nested signal objects) should be exposed as a deep writable copy. The object can also contain nested objects, which will be recursively mapped. The result of the function shall comply with the following type definition:

    ```ts
    type ObjectWithSignalsForDeepStateCopy = {
        [key: string]: Signal<unknown> | ObjectWithSignalsForDeepStateCopy;
    }
    ```

## Props
This feature adds a set of properties to the interface of the store that are created with the following type definition:

```ts
type DeepWritableStateCopy<State extends ObjectWithSignalsForDeepStateCopy> = {
    [Key in keyof State]: State[Key] extends ObjectWithSignalsForDeepStateCopy ? 
    DeepWritableStateCopy<State[Key]> 
    : State[Key] extends Signal<infer InnerType> ? 
    DeepWritableSignal<InnerType> : never;
};
```
In short this means that each signal you put to the `ObjectWithSignalsForDeepStateCopy` will be mapped to a `DeepWritableSignal<InnerType>`, where `InnerType` is the type contained in the original signal. Nested objects will be recursively mapped to the same shape.

