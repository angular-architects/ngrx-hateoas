import { Signal } from "@angular/core";
import { toObservable } from "@angular/core/rxjs-interop";
import { Observable, filter, firstValueFrom } from "rxjs";

export function isValidUrl(href: string) {
    let url;

    try {
        url = new URL(href);
    } catch (_) {
        return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
}

export function isValidActionVerb(method: string) {
    if(method.toLocaleUpperCase() === 'PUT' 
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
