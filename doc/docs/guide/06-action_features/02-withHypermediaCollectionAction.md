# withHypermediaCollectionAction
Create an action in the store that can use hypermedia on a collection of objects to perform an action.

## API
```ts
function withHypermediaCollectionAction<ActionName extends string, Input extends SignalStoreFeatureResult, ArrayResource extends Resource>(
    actionName: ActionName, 
    linkRootFn: CollectionActionLinkRootFn<Input, ArrayResource>, 
    actionMetaName: string, 
    options: Partial<CollectionActionOptions<ArrayResource>> = {}
    ): SignalStoreFeature
```
* **actionName**: The name of how the action will be declared in the store.
* **linkRootFn**: A function that receives the store state and props and returns an collection of objects the action shall be connected with and which contain the metadata about the action.
* **actionMetaName**: The name of how the action is named in the meta information of the selected objects within the collection.
* **options**: Additional options for the collection action to specifiy which key holds a unique identifier for each object in the collection and which key in the collection objects holds the actual resource data. This parameter has the followning type definition:
    ```ts
    type CollectionActionOptions<ArrayResource extends Resource> = {
        idLookup: (arrayResource: ArrayResource) => CollectionKey;
        resourceLookup: (arrayResource: ArrayResource) => Resource;
    }
    ```
    If no options are provided, by default the `idLookup` function returns the value of the `id` property of the collection object and the `resourceLookup` function returns the collection object itself.


## State
With this feature the following state properties are added to the interface of the store:

### Action Meta State
```ts
<actionName>State: DeepSignal<
    { 
        method: Record<CollectionKey, '' | 'PUT' | 'POST' | 'DELETE'>
        href: Record<CollectionKey, string>
        isAvailable: Record<CollectionKey, boolean>
        isExecuting: Record<CollectionKey, boolean> 
        hasError: Record<CollectionKey, boolean>
        error: Record<CollectionKey, unknown>
    }>
```
A deep signal containing meta information about the action. Each property is a record where the key is the unique identifier of the object in the collection and the value contains the respective information for that object. The values within the records are as follows:

* **method**: The HTTP method that will be used when executing the action.
* **href**: The URL to which the action will sent the connected object when executed.
* **isAvailable**: Whether the action is currently available (means the action meta name was found in the metadata of the connected object).
* **isExecuting**: Whether the action is currently being executed (means a request is in progress).
* **hasError**: Whether the last execution of the action resulted in an error.
* **error**: The error that occurred during the last execution of the action or undefined if no error occurred.

## Methods

With this feature the following methods are added to the interface of the store:

### Execute the Action
```ts
<actionName>(id: CollectionKey): Promise<HttpResponse<unknown>>
```
Executes the action by sending the a specific object of the collection to the URL with the HTTP method defined in the action metadata.

* **id**: The unique identifier of the object in the collection for which the action shall be executed.
