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
load<resourceName>FromUrl(url: Signal<string | null>): EffectRef
```
Loads the resource from the provided URL. Two overloads are available:

* When called with a **plain value** (`string | null`): loads the resource immediately and returns a `Promise<void>` that resolves when the request completes. Passing `null` resets the resource to its initial value.
  * **fromCache**: When `true`, skips loading if the resource is already loaded from the same URL. Defaults to `false`.
* When called with a **`Signal<string | null>`**: sets up a reactive effect that automatically reloads the resource whenever the signal's value changes, and returns an `EffectRef` that can be used to destroy the effect.

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
