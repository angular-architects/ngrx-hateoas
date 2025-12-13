import { Signal, WritableSignal, linkedSignal, signal } from "@angular/core";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return value?.constructor === Object;
}

export type DeepWritableSignal<T> = WritableSignal<T> &
  (T extends Record<string, unknown> ? Readonly<{ [K in keyof T]: DeepWritableSignal<T[K]> }> : unknown);

export function deepWritableSignal<T>(initialValue: T) {
  const baseSignal = signal(initialValue);
  return deepWritableFromSignal(baseSignal);
}

export function deepWritableFromSignal<T>(baseSignal: WritableSignal<T>) {
  const setFunc = (newVal: T) => baseSignal.set(newVal);
  return toDeepWritableSignal(setFunc, baseSignal);
}

export function toDeepWritableSignal<T>(setFunc: (newVal: T) => void, signal: Signal<T>): DeepWritableSignal<T> {

  return new Proxy(signal, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get(target: any, prop) {

      console.log('getting from target', target());

      if (prop === 'set') {
        return (newVal: T) => setFunc(newVal);
      }

      if (prop === 'isDeepWritableSignal') {
        return true;
      }

      if (!target[prop]?.isDeepWritableSignal && target()[prop]) {
        const childSignal = linkedSignal(() => target()[prop]);
        const childSetFunc = (newVal: T) => setFunc({ ...target(), [prop]: isRecord(target[prop]()) ? { ...target[prop](), ...newVal } : newVal });
        try {
          target[prop] = toDeepWritableSignal(childSetFunc, childSignal);
        } catch (e) {
          throw new Error('Error creating deep writable signal for property "' + String(prop) + '" Make sure to use a plain signal as param. Inner error: ' + e);
        }
      }

      return target[prop];
    }
  });
}
