---
sidebar_position: 3
---

# withLinkedHypermediaResource
Creates a resource in the store which loads depending on a signal pointing to a different resource. Each time the linked resource changes the resource will be reloaded automatically.

## API
```ts
function withLinkedHypermediaResource<ResourceName extends string, TResource, Input extends SignalStoreFeatureResult>(
    resourceName: ResourceName, initialValue: TResource, linkRootFn: ResourceLinkRootFn<Input>, linkMetaName: string
    ): SignalStoreFeature;
```

* **resourceName**: The name of how the resource will be declared in the store.
* **initialValue**: The initial value of the resource before it is loaded from a URL.
* **linkRootFn**: A function which receives the store instance and returns a signal to an object containing the link to use to load the resource.
* **linkMetaName**: The name of the link to use to load the resource.

## State
With this feature the following state properties are added to the interface of the store:

### Resource State
```ts
<resourceName>: DeepSignal<TResource>
```
A deep signal containing the data of the resource.

### Resource Meta State
```ts
<resourceName>State: DeepSignal<
    {
        url: string,
        isLoading: boolean,
        isLoaded: boolean,
        isAvailable: boolean
    }>
```
A deep signal containing meta information about the resource.

* **url**: The URL from which the resource was last loaded.
* **isLoading**: Whether the resource is currently being loaded.
* **isLoaded**: Whether the resource currently in the state was loaded from the server.
* **isAvailable**: Whether the resource is available to be loaded (means whether the link exists on the linked resource).

## Methods

With this feature the following methods are added to the interface of the store:

### Reload the Resource
```ts
reload<resourceName>(): Promise<void>
```
Reloads the resource from the last used URL.