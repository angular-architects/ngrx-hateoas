---
sidebar_position: 4
---

# withDeepWritableStateProjection

`withDeepWritableStateProjection` creates a writable view composed from arbitrary parts of the store state. Every property returned by the selector is a deep writable signal. Nested object nodes are signals as well, not just containers for their child signals.

This makes it possible to create a form-shaped view without adding a synchronized copy of the selected state.

## Usage

```ts
import { signalStore, withState } from '@ngrx/signals';
import { withDeepWritableStateProjection } from '@angular-architects/ngrx-hateoas';

const FlightStore = signalStore(
  withState({
    search: {
      from: null as string | null,
      to: null as string | null,
    },
    settings: {
      travelClass: 'economy',
      language: 'en',
    },
  }),
  withDeepWritableStateProjection(store => ({
    searchForm: {
      route: {
        from: store.search.from,
        to: store.search.to,
      },
      travelClass: store.settings.travelClass,
    },
  })),
);
```

The projection and all of its nodes can be read as signals:

```ts
store.searchForm();
// {
//   route: { from: null, to: null },
//   travelClass: 'economy'
// }

store.searchForm.route();
// { from: null, to: null }

store.searchForm.route.from();
// null
```

Every node can also be written:

```ts
store.searchForm.route.from.set('Graz');

store.searchForm.route.set({
  from: 'Graz',
  to: 'Hamburg',
});

store.searchForm.update(form => ({
  ...form,
  travelClass: 'business',
}));
```

Writing a structure node distributes its value to all selected state properties below that node. Writes spanning multiple state roots are applied with a single `patchState` operation. State properties that are not part of the projection remain unchanged.

Changes made to the original state are immediately reflected by the projection. The projection therefore does not introduce an independent state copy and does not need explicit synchronization or reset behavior.

## API

```ts
function withDeepWritableStateProjection<
  Input extends SignalStoreFeatureResult,
  Selection extends DeepWritableStateProjectionSelection,
>(
  stateMapFn: (store: MappedStoreState<Input>) => Selection,
): SignalStoreFeature
```

The selector returns an object whose leaves are state signals. Objects may be nested to create the desired projection shape:

```ts
type DeepWritableStateProjectionSelection = {
  [key: string]: Signal<unknown> | DeepWritableStateProjectionSelection;
};
```

For every top-level property, the feature adds a `DeepWritableSignal` containing the recursively unwrapped values:

```ts
type ProjectedValue<Node> =
  Node extends Signal<infer Value>
    ? Value
    : Node extends DeepWritableStateProjectionSelection
      ? { [Key in keyof Node]: ProjectedValue<Node[Key]> }
      : never;

type DeepWritableStateProjection<Selection> = {
  [Key in keyof Selection]: DeepWritableSignal<ProjectedValue<Selection[Key]>>;
};
```

The generated writable signals support `set`, `update`, and `asReadonly` at the projection root, at every structure node, and at every selected leaf.
