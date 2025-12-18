---
sidebar_position: 2
---

# Getting Started

Welcome to **ngrx-hateoas**. A library that helps you to **easily load state from your backend to your Angular client, modify it there and send it back to the server** - all in a truly RESTful way with support for hypermedia JSON documents. The library **builds on top of the NgRx Signal Store** and, with its help, enables pure **reactive access to your state** based on deep signals allowing you to create modern Angular applications.

## Basic Concept

The following graphic shows the basic concept of how state flows between a Backend and an Angular Client.

![State Flow](./assets/state-flow.drawio.svg)

1. **Load a Resource from the Backend into the Store:** 
    
    Load a resource containing state via a HTTP GET request from a WebApi into the NgRx Signal Store within an Angular application. A Component can now access this state reactively via signals.

2. **Make Mutations to the State:**
    
    A component in an Angular application can make modifications to the state via various options. 

3. **Send Changed State Back to the Server:**

    Once the state is modified and you want to send it back to the server, you can use HTTP methods like PUT or POST to update the state of the loaded resource on the server.

## Install NgRx Signal Store and ngrx-hateoas
The NgRx Signal Store is a peer dependency of **ngrx-hateoas**. If you have it not in your Angular application yet, just install it by running the following command:

``
npm i @ngrx/signals
``

To install the **ngrx-hateoas** library run

``
npm i @angular-architects/ngrx-hateoas
``

Finally you have to add the **ngrx-hateoas** services to your application by using the `provideHateoas()` function. Since **ngrx-hateoas** uses the Angular HTTP client to make its requests to the backend you should also add `provideHttpClient()`.

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideHateoas()
  ]
};
```

## Required Preparation

Lets assume your backend provides the following resource for a flight via a HTTP GET request.

```json
{
    "id": "123",
    "connection": {
        "from": "New York City - John F. Kennedy",
        "iataFrom": "JFK",
        "to": "Los Angeles International",
        "iataTo": "LAX",
    },
    "times": {
        "takeOff": "2023-10-01T10:00:00Z",
        "landing": "2023-10-01T14:00:00Z",

    }
}
```

To properly work with this resource in the NgRx Signal Store you should provide type information in your Angular application. This could look like the following:

```ts
export type FlightConnection = {
    from: string;
    iataFrom: string;
    to: string;
    iataTo: string;
};

export type FlightTimes = {
    takeOff: string;
    landing: string;
};

export type Flight = {
    id: number;
    connection: FlightConnection;
    times: FlightTimes;
};
```

Furthermore you need to provide initial values for each data structure you want to put into the store. This could look like this:

```ts
export const initialFlightConnection: FlightConnection = {
    from: '',
    iataFrom: '',
    to: '',
    iataTo: ''
};

export const initialFlightTimes: FlightTimes = {
    takeOff: '',
    landing: ''
};

export const initialFlight: Flight = {
    id: 0,
    connection: initialFlightConnection,
    times: initialFlightTimes
};
```

## 1. Load a Resource from the Backend into the Store
To load a resource from the backend into the NgRx Signal Store you can use the `withHypermediaResource(<ModelName>, <InitialState>)` feature from **ngrx-hateoas**. This feature adds state, metastate and methods to the store to work with this resource. The following snippet shows how to set up a signal store for the flight resource:

```ts
import { signalStore } from '@ngrx/signals';
import { withHypermediaResource } from '@angular-architects/ngrx-hateoas';

export const FlightEditStore = signalStore(
  { providedIn: 'root' },
  withHypermediaResource('flightModel', initialFlight)
);
```

The store can be injected in your Angular component, a router activator or a router resolver. The `withHypermediaResource` adds a method called `load<ModelName>FromUrl` which loads the resource from the backend into the store. In our case the model name is `flightModel`. Also a property named with the provided `<ModelName>`, in our case `flightModel` is added to the store which holds the current state of the resource in form a NgRx deep signal. The following code snippet shows how to inject the store, load data from the backend and access the singals holding the data;

```ts
// Inject the store using Angular's inject function
store = inject(FlightEditStore);

// Load the flight resource from the backend into the store via an async call
await store.loadFlightModelFromUrl('/api/flights/123');

// Access signals holding data from the store
const idSignal = store.flightModel.id;
const connectionSignal = store.flightModel.connection;

```
The `withHypermediaResource` feature also adds a property called `<ModelName>State` to the store which holds metastate information about the resource. This can be used to e.g. show loading spinners in the UI while the resource is loaded from the backend. The following code snippet shows how to access some of the metastate signals:

```ts
// A signal toggling between true and false to indicate if the 
// resource was loaded at least once from the backend
const isLoadedSignal = store.flightModelState.isLoaded;
// A signal toggling between true and false to indicate if an HTTP 
// request is currently running to get the state of this resource
const isLoadingSignal = store.flightModelState.isLoading;
```

## 2. Make Mutations to the State
To make mutations to the state **ngrx-hateoas** provides you multiple options you can choose from based on what fits best to your use case. For the examples below we assume you want to change the `connection` object of the flight resource in the store.

### Option 1: Use native Signal Store Methods
This options build on the standard way of changing state within the NgRx Signal Store. To do this use the standard `withMethods` feature, create a method and update the state like this:

```ts
import { signalStore, withMethods, patchState } from "@ngrx/signals";
import { withHypermediaResource } from "@angular-architects/ngrx-hateoas";

export const FlightEditStore = signalStore(
    { providedIn: 'root' },
    withHypermediaResource('flightModel', initialFlight),
    // Add the withMethods feature and implement a method
    withMethods(store => ({
        setConnection(connection: flightConnection) {
            patchState(store, { flightModel: { ...store.flightModel(), connection } });
        }
    }))
);
```

Finally you can call the `setConnection` method on the store to change the connection object in the state.

### Option 2: Use a Writable State Copy
If you want to preserve the original state in the store and work on a copy of it you can use the `withWritableStateCopy` feature from **ngrx-hateoas**. This feature creates a writable copy of the resource or part of the resource in the store in form of a writeable signal which you can use to modify the state copy. The following code snippet shows how to set up the store with this feature:

```ts
import { signalStore, withMethods, patchState } from "@ngrx/signals";
import { withHypermediaResource, withWritableStateCopy } from "@angular-architects/ngrx-hateoas";

export const FlightEditStore = signalStore(
    { providedIn: 'root' },
    withHypermediaResource('flightModel', initialFlight),
    // Add the withWritableStateCopy feature to create a writable copy of the connection object
    withWritableStateCopy(store => ({ 
        writableFlightConnection: store.flightModel.connection
    }))
);
```

You can now set a new state of the connection object by using the `writableFlightConnection` signal on the store like this: `store.writableFlightConnection.set(<new value>)`.

:::info
The store properties created by the `withWritableStateCopy` feature are writable signals and are deep signals at the same time. Therefore you can get fine grained signals from the state copy the same way as you get them from the store state itself.
:::

### Option 3: Use a Deep Writable State Copy
While `withWritableStateCopy` creates a writable signal for the root object only, the `withExperimentalDeepWritableStateCopy` feature creates a deep writable signal which allows you to set each key of the object individually. This is especiall helpfull in cases where you want to bind your data to a form with the help of `ngModel`. The following code snippet shows how to set up the store with this feature:

```ts
import { signalStore, withMethods, patchState } from "@ngrx/signals";
import { withHypermediaResource, withExperimentalDeepWritableStateCopy } from "@angular-architects/ngrx-hateoas";

export const FlightEditStore = signalStore(
    { providedIn: 'root' },
    withHypermediaResource('flightModel', initialFlight),
    // Add the withExperimentalDeepWritableStateCopy feature to create a deep writable copy of the connection object
    withExperimentalDeepWritableStateCopy(store => ({ 
        writableFlightConnection: store.flightModel.connection
    }))
);
```

You can now set a new state of individual prperties of the connection object by using the `writableFlightConnection` signal on the store like this: `store.writableFlightConnection.from.set('<new value>')`.

:::info
This feature is currently experimental and might change in future releases.
:::

### Option 4: Use a Deep Writable State Delegate
If you want to have a writalbe signal in the interface of your store which directly modifies the state in the store you can use the `withExperimentalDeepWritableStateDelegate` feature from **ngrx-hateoas**. This feature creates a writable signal graph which directly modifies the state in the store when you call `set` on it. Because it is a deep writable it works well with template driven forms as well as signal forms. The following code snippet shows how to set up the store with this feature:

```ts
import { signalStore, withMethods, patchState } from "@ngrx/signals";
import { withHypermediaResource, withExperimentalDeepWritableStateDelegate } from "@angular-architects/ngrx-hateoas";

export const FlightEditStore = signalStore(
    { providedIn: 'root' },
    withHypermediaResource('flightModel', initialFlight),
    // Add the withExperimentalDeepWritableStateDelegate feature to create a delegate of the connection object
    withExperimentalDeepWritableStateDelegate(store => ({ 
        flightConnectionDelegate: store.flightModel.connection
    }))
);
```

You can now set a new state of the connection object by using the `flightConnectionDelegate` signal on the store like this: `store.flightConnectionDelegate.set({...})`. This directly modifies the state in the store.

:::info
This feature is currently experimental and might change in future releases.
:::

## 3. Send Changed State Back to the Server

To send changed state back to the server you can use the `withHypermediaAction` feature from **ngrx-hateoas**. This feature allows you to configure actions based on hypermedia metadata provided in the resource loaded from the backend. To enable such an action the server has to provide appropriate metadata. The following JSON document shows how the connection object could look like with the required metadata for an update action:

```json
{
    [...]
    "connection": {
        "from": "New York City - John F. Kennedy",
        "iataFrom": "JFK",
        "to": "Los Angeles International",
        "iataTo": "LAX",
        "_actions": { // Metadata for actions
            "update": { "href": "/api/flights/123/connection", "method": "PUT" }
        }
    },
    [...]
}
```

The `_actions` key holds the metadata for the actions available for this object. In this case there is an action called `update` which uses the HTTP verb `PUT` to send the updated connection object back to the server to the specified URL in the `href` property.

:::info
If your metadata has different names or a different structure you can customize this via the `HateoasConfig` when you provide the **ngrx-hateoas** services in your application. For this have a look into the [Metadata Provider](./configuration/01-metadata-provider.md) section.
:::

The following code snippet shows how to set up the store with an action that sends back the changed connection object to the server using the metadata provided in the resource:

```ts
import { signalStore, withHooks } from '@ngrx/signals';
import { withHypermediaResource, withWritableStateCopy, withHypermediaAction } from '@angular-architects/ngrx-hateoas';

export const FlightEditStore = signalStore(
    { providedIn: 'root' },
    withHypermediaResource('flightModel', initialFlight),
    withWritableStateCopy(store => ({ 
        writableFlightConnection: store.flightModel.connection
    })),
    // Add this feature
    withHypermediaAction('updateFlightConnection', store => store.writableFlightConnection, 'update')
);
```
Through the `withHypermediaAction(<MethodName>, <LambdaToAffectedState>, <ActionName>)` feature a method called `updateFlightConnection` is added to the store which can be called to send the connection object pointed to by the lambda in the second argument back to the server. The following code snippet shows how to call this method:

```ts
await this.store.updateFlightConnection();
```

The action returns a promise in order to be able to await the completion of this asynchronous operation.

The `withHypermediaAction` adds a method with the specified name to the store to execute it and an object with the same name plus "State" suffix to containing the metastate of the action. The following code shows parts of the metaobject you can use (e.g. for showing a spinner in case of a running request).

```ts
// A signal indicating if the action is available, means the specified 
// metadata is available in the currently loaded resource.
const isAvailableSignal = store.updateFlightConnectionState.isAvailable;
// A signal indicating if a request is currently running. Means a request
// was sent to the backend and the client is waiting for the response. You
// can use this e.g. for showing a loading spinner or progress bar in your UI.
const isExecutingSignal = store.updateFlightConnectionState.isExecuting;
```

## Full Example

The following json document shows a full example of a flight resource including hypermedia metadata for links and multiple actions.

```json
{
    "id": "123",
    "connection": {
        "from": "New York City - John F. Kennedy",
        "iataFrom": "JFK",
        "to": "Los Angeles International",
        "iataTo": "LAX",
        "_actions": {
            "update": { "href": "/api/flights/123/connection", "method": "PUT" }
        }
    },
    "times": {
        "takeOff": "2023-10-01T10:00:00Z",
        "landing": "2023-10-01T14:00:00Z",
        "_actions": {
            "update": { "href": "/api/flights/123/times", "method": "PUT" }
        }
    },
    "_links": {
        "self": { "href": "/api/flights/123" },
        "nextFlight": { "href": "/api/flights/124" }
    },
    "_actions": {
        "delete": { "href": "/api/flights/123", "method": "DELETE" }
    }
}
```
> Find a more detaild description of this JSON in the [What is Hypermedia?](concept#what-is-hypermedia) section in the Concept page.

A store setup which supports all links and actions provided by this resource could look like the following:

```ts
import { signalStore, withHooks } from '@ngrx/signals';
import { withHypermediaResource, withLinkedHypermediaResource, withWritableStateCopy, withHypermediaAction } from '@angular-architects/ngrx-hateoas';

export const FlightEditStore = signalStore(
    { providedIn: 'root' },
    withHypermediaResource('flightModel', initialFlight),
    withLinkedHypermediaResource('nextFlight', store => store.flightModel, 'nextFlight'),
    withWritableStateCopy(store => ({ 
        writableFlightConnection: store.flightModel.connection,
        writableFlightTimes: store.flightModel.times
    })),
    withHypermediaAction('updateFlightConnection', store => store.writableFlightConnection, 'update'),
    withHypermediaAction('updateFlightTimes', store => store.writableFlightTimes, 'update'),
    withHypermediaAction('deleteFlight', store => store.flightModel, 'delete')
);
```

The  store, as shown in the previous code sample is able to do the following things:
* read the JSON from backend into the store and provide it as reactive deep signal
* rectively read a linked json object triggered by changes from the main object
* provide writable copies of parts of the state
* provide metastate about the requests to the backend (e.g. such as if a request is currently running)
* provides the capability to send the connection object back to the server
* provides the capability to send the times object back to the server
* provides the capability to send a delete call to the server to delete the flight
* provides metastate to all actions (e.g. such as if an action is currently executed or if a call was successfull)

And all of this with just a few lines of code!
