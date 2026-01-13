---
sidebar_position: 2
---

# withWritableStateCopy
Creates a writable copy of selected state signals. The copy is linked to the original signals. If the state original signals change, the writable copy will reflect those changes. Writing to the writable copy will not update the original state signals. Furthermore the wiritable copy is also a deep signal so that you get fine grained reactivity when working with your copy.

## API
```ts
function withWritableStateCopy<Input extends SignalStoreFeatureResult, StateSelection extends ObjectWithSignalsForStateCopy>(
    stateMapFn: (store: StateSignals<Input['state']>) => StateSelection
): SignalStoreFeature;
```

* **stateMapFn**: A selector function that receives the store's state signals and returns an object describing which signals (and nested signal objects) should be exposed as a writable copy. The object can also contain nested objects, which will be recursively mapped. The result of the function shall comply with the following type definition:

  ```ts
  type ObjectWithSignalsForStateCopy = {
      [key: string]: Signal<unknown> | ObjectWithSignalsForStateCopy;
  }
  ```

## Props
This feature adds a set of properties to the interface of the store that are created with the following type definition:

```ts
type WritableStateCopy<State extends ObjectWithSignalsForStateCopy> = {
  [Key in keyof State]: State[Key] extends ObjectWithSignalsForStateCopy ? 
  WritableStateCopy<State[Key]> 
  : State[Key] extends Signal<infer InnerType> ? 
  WritableDeepSignal<InnerType> : never;
};
```
In short this means that each signal you put to the `ObjectWithSignalsForStateCopy` will be mapped to a `WritableDeepSignal<InnerType>`, where `InnerType` is the type contained in the original signal. Nested objects will be recursively mapped to the same shape.

