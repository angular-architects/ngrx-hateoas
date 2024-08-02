import { Signal } from "@angular/core";
import { toObservable } from "@angular/core/rxjs-interop";
import { filter, firstValueFrom } from "rxjs";

export function isValidHref(href: string | undefined | null): boolean {
  if (href === undefined || href === null) return false;
  return href.startsWith('/') || href.startsWith('http');
}

export function isValidActionVerb(method: string | undefined | null) {

  if (method === undefined || method === null) return false;

  if (method.toLocaleUpperCase() === 'PUT'
    || method.toLocaleUpperCase() === 'POST'
    || method.toLocaleUpperCase() === 'DELETE'
    || method.toLocaleUpperCase() === 'PATCH') {
    return true;
  } else {
    return false;
  }
}

export function whenTrue(signal: Signal<boolean>): Promise<boolean> {
  return firstValueFrom(toObservable(signal).pipe(filter(v => v)));
}
