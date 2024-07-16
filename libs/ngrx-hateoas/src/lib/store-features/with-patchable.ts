import { SignalStoreFeature, patchState, signalStoreFeature, withMethods } from "@ngrx/signals";
import { HypermediaResourceState } from "./with-hypermedia-resource";
import { DeepPatchableSignal, toDeepPatchableSignal } from "../util/deep-patchable-signal";

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
        { state: HypermediaResourceState<ResourceName, TResource>; computed: {}; methods: {} },
        {
            state: {};
            computed: {},
            methods: PatchableResourceMethods<ResourceName, TResource>;
        }
    >;
export function withPatchableResource<ResourceName extends string, TResource>(resourceName: ResourceName, initialValue: TResource) {

    const stateKey = `${resourceName}`;
    const getAsPatchalbeMethodName = generateGetPatchableResourceMethodName(resourceName);

    return signalStoreFeature(
        withMethods((store: any) => {

            const patchableSignal = toDeepPatchableSignal<TResource>(newVal => patchState(store, { [stateKey]: { ...store[stateKey](), resource: newVal } }), store[stateKey].resource);

            return {
                [getAsPatchalbeMethodName]: (): DeepPatchableSignal<TResource> => {
                    return patchableSignal;
                }
            };
        })
    );
}