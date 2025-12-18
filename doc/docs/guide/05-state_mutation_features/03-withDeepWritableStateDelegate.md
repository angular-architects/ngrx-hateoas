---
sidebar_position: 3
---

# withExperimentalDeepWritableStateDelegate
Create a writable signals that are linked to the original state signals. If the original state signals change, the writable signals will reflect those changes. Writing to the writable signals will directly update the original state signals. Furthermore the wiritable signals are also deep writable signals so that you get fine grained reactivity when working with them and additionally you can write deeply nested properties.

:::warning
This feature is experimental and might change or be removed in future versions.
:::

## API
```ts
function withExperimentalDeepWritableStateDelegate<Input extends SignalStoreFeatureResult, StateSelection extends ObjectWithDeepWritableSignals>(
    stateMapFn: SelectStateFn<Input, StateSelection>
): SignalStoreFeature
```

* **stateMapFn**: A selector function that receives the store's state delegates as writable signals and returns an object describing which signals (and nested signal objects) should be exposed as a deep writable delegates. The object can also contain nested objects. The result of the function shall comply with the following type definition:

    ```ts
    type ObjectWithDeepWritableSignals = {
        [key: string]: WritableSignal<unknown> | DeepWritableSignal<object> | ObjectWithDeepWritableSignals;
    }
    ```

## Props
This feature adds a set of properties to the interface of the store that are created with the following type definition:

```ts
type DeepWritableStateDelegate<State extends ObjectWithDeepWritableSignals> = {
    [Key in keyof State]: State[Key] extends ObjectWithDeepWritableSignals ? 
    DeepWritableStateDelegate<State[Key]> 
    : State[Key] extends Signal<infer InnerType> ? 
    DeepWritableSignal<InnerType> : never;
};
```
In short this means that each signal you put to the `ObjectWithDeepWritableSignals` will be mapped to a `DeepWritableStateDelegate<InnerType>`, where `InnerType` is the type contained in the original signal. Nested objects will be recursively mapped to the same shape.

