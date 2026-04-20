---
sidebar_position: 1
---

# withHypermediaResource
Creates a resource in the store.

## API
```ts
function withHypermediaResource<ResourceName extends string, TResource>(
    resourceName: ResourceName, initialValue: TResource): SignalStoreFeature;
```

* **resourceName**: The name of how the resource will be declared in the store.
* **initialValue**: The initial value of the resource before it is loaded from a URL.

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
        isLoaded: boolean
    }>
```
A deep signal containing meta information about the resource.

* **url**: The URL from which the resource was last loaded.
* **isLoading**: Whether the resource is currently being loaded.
* **isLoaded**: Whether the resource currently in the state was loaded from the server.

## Methods

With this feature the following methods are added to the interface of the store:

### Load the Resource from an URL
```ts
load<resourceName>FromUrl(url: string | null, fromCache?: boolean): Promise<void>
```
Loads the resource from the provided URL. 

* **url**: The URL from which the resource should be loaded. If `null` is provided the resource is reset to its initial value.
* **fromCache**: Whether to load the resource even if the the current state is loaded from the same URL. If not provided, defaults to `false`.

### Load the Resource from a Link
```ts
load<resourceName>FromLink(linkRoot: unknown, linkName: string): Promise<void>
```
Loads the resource from the provided URL. 

* **linkRoot**: An object containing the link to use.
* **linkName**: The name of the link to use to load the resource.

### Reload the Resource
```ts
reload<resourceName>(): Promise<void>
```
Reloads the resource from the last used URL.

### Connect the Resource to a URL Signal
```ts
connect<resourceName>ToUrl(url: string | Signal<string>): EffectRef
```
Reactively connects the resource to a URL signal. Whenever the signal emits a new URL value, the resource is automatically loaded from that URL. If a plain `string` is passed instead of a signal, the resource is loaded once from that URL.

* **url**: A `Signal<string>` whose value is used as the URL. Whenever the signal changes, the resource is reloaded automatically. Can also be a plain `string` for a one-time load.
