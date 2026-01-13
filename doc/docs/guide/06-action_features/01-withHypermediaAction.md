# withHypermediaAction
Create an action in the store that can use hypermedia on a single object to perform an action.

## API
```ts
function withHypermediaAction<ActionName extends string, Input extends SignalStoreFeatureResult>(
    actionName: ActionName, linkRootFn: ActionLinkRootFn<Input>, actionMetaName: string
    ): SignalStoreFeature
```
* **actionName**: The name of how the action will be declared in the store.
* **linkRootFn**: A function that receives the store state and props and returns an object the action shall be connected with and which contains the metadata about the action.
* **actionMetaName**: The name of how the action is named in the meta information of the selected object.

## State
With this feature the following state properties are added to the interface of the store:

### Action Meta State
```ts
<actionName>State: DeepSignal<
    {
        method: '' | 'PUT' | 'POST' | 'DELETE'
        href: string
        isAvailable: boolean
        isExecuting: boolean 
        hasError: boolean
        error: unknown
    }>
```
A deep signal containing meta information about the action.

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
<actionName>(): Promise<HttpResponse<unknown>>
```
Executes the action by sending the connected object to the URL and HTTP method defined in the action metadata.