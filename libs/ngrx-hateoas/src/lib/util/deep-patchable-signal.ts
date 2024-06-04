import { Signal, computed } from "@angular/core";

export interface Patchable<T> {
  patch(state: Partial<T>): void;
  set(state: T): void
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return value?.constructor === Object;
}

export type DeepPatchableSignal<T> = Signal<T> & Patchable<T> &
  (T extends Record<string, unknown>
    ? Readonly<{ [K in keyof T]: DeepPatchableSignal<T[K]> }>
    : unknown);

export function toDeepPatchableSignal<T>(patchFunc: (newVal: T) => void, signal: Signal<T>): DeepPatchableSignal<T> {
  return new Proxy(signal, {
    get(target: any, prop) {

      if (prop === 'patch' || prop === 'set') {
        return (newVal: T) => {
          patchFunc(newVal)
        }
      }

      if (!target[prop]) {
        target[prop] = computed(() => target() ? target()[prop] : undefined);
      }

      return toDeepPatchableSignal((newVal: T) => patchFunc({ 
          ...target(), 
          [prop]: isRecord(target[prop]()) ? { ...target[prop](), ...newVal } : newVal 
        }), 
        target[prop]);
    }
  });
}