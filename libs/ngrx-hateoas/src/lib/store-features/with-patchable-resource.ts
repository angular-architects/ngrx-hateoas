import { SignalStoreFeature, patchState, signalStoreFeature, withMethods } from "@ngrx/signals";
import { HypermediaResourceState } from "./with-hypermedia-resource";
import { DeepPatchableSignal, toDeepPatchableSignal } from "../util/deep-patchable-signal";
import { Signal } from "@angular/core";

export type GetPatchableResourceMethod<ResourceName extends string, TResource> = { 
    [K in ResourceName as `get${Capitalize<ResourceName>}AsPatchable`]: () => DeepPatchableSignal<TResource>
};

export function generateGetPatchableResourceMethodName(resourceName: string) {
    return `get${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)}AsPatchable`;
}

export type PatchableResourceMethods<ResourceName extends string, TResource> = 
    GetPatchableResourceMethod<ResourceName, TResource>;

export function withPatchableResource<ResourceName extends string, TResource>(
    resourceName: ResourceName, initialValue: TResource): SignalStoreFeature<
        { state: HypermediaResourceState<ResourceName, TResource>; computed: Record<string, Signal<unknown>>; methods: Record<string, Function> },
        {
            state: object,
            computed: Record<string, Signal<unknown>>,
            methods: PatchableResourceMethods<ResourceName, TResource>;
        }
    >;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function withPatchableResource<ResourceName extends string, TResource>(resourceName: ResourceName, initialValue: TResource) {

    const stateKey = `${resourceName}`;
    const getAsPatchableMethodName = generateGetPatchableResourceMethodName(resourceName);

    return signalStoreFeature(
        withMethods((store: any) => {

            const patchableSignal = toDeepPatchableSignal<TResource>(newVal => patchState(store, { [stateKey]: { ...store[stateKey](), resource: newVal } }), store[stateKey].resource);

            return {
                [getAsPatchableMethodName]: (): DeepPatchableSignal<TResource> => {
                    return patchableSignal;
                }
            };
        })
    );
}
