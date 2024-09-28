import { Signal } from "@angular/core";
import { toObservable } from "@angular/core/rxjs-interop";
import { firstValueFrom, filter } from "rxjs";


export function whenTrue(signal: Signal<boolean>): Promise<boolean> {
  return firstValueFrom(toObservable(signal).pipe(filter(v => v)));
}
