import { SignalStoreFeature, patchState, signalStoreFeature, withMethods } from "@ngrx/signals";
import { HypermediaResourceData } from "./with-hypermedia-resource";
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
        { 
            state: HypermediaResourceData<ResourceName, TResource>;
            computed: Record<string, Signal<unknown>>; 
            methods: Record<string, Function>;
            props: object;
        },
        {
            state: object,
            computed: Record<string, Signal<unknown>>,
            methods: PatchableResourceMethods<ResourceName, TResource>;
            props: object;
        }
    >;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function withPatchableResource<ResourceName extends string, TResource>(resourceName: ResourceName, initialValue: TResource) {

    const dataKey = `${resourceName}`;
    const getAsPatchableMethodName = generateGetPatchableResourceMethodName(resourceName);

    return signalStoreFeature(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        withMethods((store: any) => {

            const patchableSignal = toDeepPatchableSignal<TResource>(newVal => patchState(store, { [dataKey]: newVal }), store[dataKey]);

            return {
                [getAsPatchableMethodName]: (): DeepPatchableSignal<TResource> => {
                    return patchableSignal;
                }
            };
        })
    );
}
