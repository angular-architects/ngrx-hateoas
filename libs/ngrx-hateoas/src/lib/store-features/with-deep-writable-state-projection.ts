import { computed, isSignal, Signal } from '@angular/core';
import {
  patchState,
  signalStoreFeature,
  SignalStoreFeature,
  SignalStoreFeatureResult,
  StateSignals,
  withProps,
  WritableStateSource,
} from '@ngrx/signals';
import { DeepWritableSignal } from '../util/deep-writeable-signal';

export type DeepWritableStateProjectionSelection = {
  [key: string]: Signal<unknown> | DeepWritableStateProjectionSelection;
};

type ProjectedValue<Node> = Node extends Signal<infer Value>
  ? Value
  : Node extends DeepWritableStateProjectionSelection
    ? { [Key in keyof Node]: ProjectedValue<Node[Key]> }
    : never;

export type DeepWritableStateProjection<Selection extends DeepWritableStateProjectionSelection> = {
  [Key in keyof Selection]: DeepWritableSignal<ProjectedValue<Selection[Key]>>;
};

type MappedStoreState<Input extends SignalStoreFeatureResult> = {
  [Key in keyof StateSignals<Input['state']>]: StateSignals<Input['state']>[Key] extends Signal<infer Value>
    ? DeepWritableSignal<Value>
    : never;
};

type SelectStateFn<
  Input extends SignalStoreFeatureResult,
  Selection extends DeepWritableStateProjectionSelection,
> = (store: MappedStoreState<Input>) => Selection;

type StateRecord = Record<PropertyKey, unknown>;

type StateWrite = {
  path: PropertyKey[];
  value: unknown;
};

const statePath = Symbol('deepWritableStateProjectionPath');

type StateProjectionSignal<T> = DeepWritableSignal<T> & {
  [statePath]: PropertyKey[];
};

function isStateRecord(value: unknown): value is StateRecord {
  return value !== null && typeof value === 'object';
}

function setValueAtPath(currentValue: unknown, path: readonly PropertyKey[], value: unknown): unknown {
  if (path.length === 0) {
    return value;
  }

  const [key, ...remainingPath] = path;
  const currentRecord = isStateRecord(currentValue) ? currentValue : {};

  return {
    ...currentRecord,
    [key]: setValueAtPath(currentRecord[key], remainingPath, value),
  };
}

function createStateProjectionSignal<T>(
  source: Signal<T>,
  path: PropertyKey[],
  commit: (writes: StateWrite[]) => void,
): StateProjectionSignal<T> {
  const children = new Map<PropertyKey, DeepWritableSignal<unknown>>();

  return new Proxy(source, {
    get(target, property, receiver) {
      if (property === statePath) {
        return path;
      }

      if (property === 'set') {
        return (value: T) => commit([{ path, value }]);
      }

      if (property === 'update') {
        return (updateFn: (value: T) => T) => commit([{ path, value: updateFn(target()) }]);
      }

      if (property === 'asReadonly') {
        return () => target;
      }

      if (typeof property !== 'symbol') {
        const currentValue = target();
        if (isStateRecord(currentValue) && property in currentValue) {
          let child = children.get(property);
          if (!child) {
            child = createStateProjectionSignal(
              computed(() => (target() as StateRecord)[property]),
              [...path, property],
              commit,
            );
            children.set(property, child);
          }
          return child;
        }
      }

      return Reflect.get(target, property, receiver);
    },
  }) as StateProjectionSignal<T>;
}

function collectWrites(
  selection: Signal<unknown> | DeepWritableStateProjectionSelection,
  value: unknown,
  writes: StateWrite[],
): void {
  if (isSignal(selection)) {
    writes.push({
      path: (selection as StateProjectionSignal<unknown>)[statePath],
      value,
    });
    return;
  }

  const valueRecord = isStateRecord(value) ? value : {};
  for (const key of Object.keys(selection)) {
    collectWrites(selection[key], valueRecord[key], writes);
  }
}

function createCompositeProjectionSignal<Selection extends DeepWritableStateProjectionSelection>(
  selection: Selection,
  commit: (writes: StateWrite[]) => void,
): DeepWritableSignal<ProjectedValue<Selection>> {
  const children = Object.fromEntries(
    Object.entries(selection).map(([key, child]) => [
      key,
      isSignal(child) ? child : createCompositeProjectionSignal(child, commit),
    ]),
  ) as Record<string, Signal<unknown>>;

  const source = computed(() =>
    Object.fromEntries(Object.entries(children).map(([key, child]) => [key, child()])),
  ) as Signal<ProjectedValue<Selection>>;

  const set = (value: ProjectedValue<Selection>) => {
    const writes: StateWrite[] = [];
    collectWrites(selection, value, writes);
    commit(writes);
  };

  return new Proxy(source, {
    get(target, property, receiver) {
      if (property === 'set') {
        return set;
      }

      if (property === 'update') {
        return (updateFn: (value: ProjectedValue<Selection>) => ProjectedValue<Selection>) =>
          set(updateFn(target()));
      }

      if (property === 'asReadonly') {
        return () => target;
      }

      if (typeof property === 'string' && property in children) {
        return children[property];
      }

      return Reflect.get(target, property, receiver);
    },
  }) as DeepWritableSignal<ProjectedValue<Selection>>;
}

function createProjection<Selection extends DeepWritableStateProjectionSelection>(
  selection: Selection,
  commit: (writes: StateWrite[]) => void,
): DeepWritableStateProjection<Selection> {
  return Object.fromEntries(
    Object.entries(selection).map(([key, node]) => [
      key,
      isSignal(node) ? node : createCompositeProjectionSignal(node, commit),
    ]),
  ) as DeepWritableStateProjection<Selection>;
}

export function withDeepWritableStateProjection<
  Input extends SignalStoreFeatureResult,
  Selection extends DeepWritableStateProjectionSelection,
>(
  stateMapFn: SelectStateFn<Input, Selection>,
): SignalStoreFeature<
  Input,
  Input & {
    props: DeepWritableStateProjection<Selection>;
  }
>;
export function withDeepWritableStateProjection<
  Input extends SignalStoreFeatureResult,
  Selection extends DeepWritableStateProjectionSelection,
>(stateMapFn: SelectStateFn<Input, Selection>) {
  return signalStoreFeature(
    withProps((store: WritableStateSource<object> & Record<string, Signal<unknown>>) => {
      const commit = (writes: StateWrite[]) => {
        patchState(store, state => {
          let updatedState: unknown = state;
          for (const write of writes) {
            updatedState = setValueAtPath(updatedState, write.path, write.value);
          }
          return updatedState as object;
        });
      };

      const mappedStoreState: Record<string, DeepWritableSignal<unknown>> = {};
      for (const key in store) {
        if (isSignal(store[key])) {
          mappedStoreState[key] = createStateProjectionSignal(
            computed(() => store[key]()),
            [key],
            commit,
          );
        }
      }

      const selection = stateMapFn(mappedStoreState as MappedStoreState<Input>);
      return createProjection(selection, commit);
    }),
  );
}
