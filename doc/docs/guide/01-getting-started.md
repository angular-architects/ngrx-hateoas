---
sidebar_position: 2
---

# Getting Started

Welcome to the documentation of **ngrx-hateoas**. A library to work with hypermedia JSON resources provided by a RESTful web API inside of Angular applications with the help of the NgRx Signal Store.

This getting started guide helps you to understand the basic usage of this library based on a simple example: Let's imagine we want to create a signal store for an Angular component which can edit a flight. The component shall be able to modify the connection and the flight times and it can also delete the whole flight. The following JSON document shows what a truly RESTful web API delivers to a client to realize the mentioned features.

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

## Install NgRx Signal Store and ngrx-hateoas
The NgRx Signal Store is a peer dependency of **ngrx-hateoas**. If you have it not in your Angular application yet, just install it by running the following command:

``
npm i @ngrx/signals
``

To install the **ngrx-hateoas** library run

``
npm i @angular-architects/ngrx-hateoas
``

Finally you have to add the **ngrx-hateoas** services to your application by using the `provideHateoas` function. Since **ngrx-hateoas** uses the Angular HTTP client to make its requests to the backend you should also add `provideHttpClient`.

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideHateoas()
  ]
};
```

## Create a Store and Load the Resource
To be able to work with type safety we need a type description of our resource in our client. This could look like the following:

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
:::info
You have different options to provide type information from the backend to the frontend, you can write it by hand, use generators (mostly based on the Open API standard) or metalanguages like TypeSpec to generate it for server and client based on a technology-agnostic description.
:::

Since the NgRx signal store asks us to provide an initial value for each data which shall be put to the store, we create constants holding the initial values.

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

With the type description and the default values we can now set up a new signal store. Within this store we are using the `withHypermediaResource` feature from **ngrx-hateoas**. This signal store feature adds state, metastate and methods to the store to work with this resource.

```ts
import { signalStore } from '@ngrx/signals';
import { withHypermediaResource } from '@angular-architects/ngrx-hateoas';

export const FlightEditStore = signalStore(
  { providedIn: 'root' },
  withHypermediaResource('flightModel', initialFlight)
);
```

This store can be injected in your Angular component like this:

```ts
@Component(...)
export class FlightEditComponent {
  store = inject(FlightEditStore);
}
```

To load a resource from the backend into the store simply call `loadFlightModelFromUrl`. This method is added automatically to the store by the `withHypermediaResource` feature of **ngrx-hypermedia**.

```ts
const loadPromise = this.store.loadFlightModelFromUrl('/api/flights/123');
```

The method now starts to make a request to the backend to `/api/flights/123` to get the current state of the object and bring it to the signal store. It answers with a promise in order to be able to await this call if needed. The metainformation about this call can also be found in the same store in the key `flightModelState` which is also added by the `withHypermediaResource` feature for you. The following sample lines demonstrate how to use this state key:

```ts
// A signal toggling between true and false to indicate if the 
// resource was loaded at least once from the backend
const isLoadedSignal = this.store.flightModelState.isLoaded;
// A signal toggling between true and false to indicate if an HTTP 
// request is currently running to get the state of this resource
const isLoadingSignal = this.store.flightModelState.isLoading;
```

To use the resource within our template of the Angular component we can use the `flightModel` key on the signal store which is also added by the `withHypermediaResource` feature. This key hold the initial state at the beginning and the data from the backend after successfull calls. The following example demonstrates how to access data on a few examples.

```ts
// Read the id of the flight
const idSignal = this.store.flightModel.id;
// Read the departure of the flight
const fromSignal = this.store.flightModel.connection.from;
// Read the destination of the flight
const toSignal = this.store.flightModel.connection.to;
```

:::info
Those signals shown in the example above are intended to be directly used within your Angular template.
:::

## Mutating the State of a Resource
To mutate the state of the flight within the signal store you have the following two options:

1. Write a method an use signal stores `patchState` function:

   This is the standard way of changing state within the signal store. To do this use the standard `withMethods` feature, create a method and update the state like this:

   ```ts
   import { withHypermediaResource } from "@angular-architects/ngrx-hateoas";
   import { signalStore, withMethods, patchState } from "@ngrx/signals";
   
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

   The state can now be changed with a call to `setConnection` on the store.

   ```ts
   const newFlightConnection: FlightConnection = {...}
   this.store.setConnection(newFlightConnection);
   ```

2. Use the deep patchable signal provided by **ngrx-hateoas**

   For each resource you add to the store with the help of **ngrx-hateoas** the library creates a deep patchable signal for you. This lets you make changes in the whole hierarchy of your state object without the need to implement a method for each single state change. This is especially helpful in case of data driven application where a lot of data needs to be transferred to the UI (e.g. into forms) and later back to the server. You can get this patchable signal directly from the store by calling the "get&lt;model-name&gt;AsPatchalbe" method.

   ```ts
   // Get the flight as deep patchable signal from the store
   const flight = store.getFlightModelAsPatchable();

   // Update the whole connection object
   const newFlightConnection: FlightConnection = {...}
   flight.connection.set(newFlightConnection);
   
   // Update just the from key
   flight.connection.from.set('<new value>');
   ```
   :::info
   You can use the deep patchable signal to bind it to ngModel to easily fill template driven forms and bring changed data back to the store.
   :::

## Send changed state Back to the Server
To be able to send the changed flight connection back to the server we have to configure the signal store to offer an action for this. To do this we use the `withHypermediaAction` feature from **ngrx-hateoas**. The hypermedia action needs to be configured with an object in the state and an action name to monitor. If you look into the example JSON at the beginning you see the required metadata is directly placed into the `connection` key. And the name of the action is `update`. This two information needs to be provided to the action. This is done with the help of a connect method within the `onInit` hook.

```ts
import { signalStore, withHooks } from '@ngrx/signals';
import { withHypermediaResource, withHypermediaAction } from '@angular-architects/ngrx-hateoas';

export const FlightEditStore = signalStore(
    { providedIn: 'root' },
    withHypermediaResource('flightModel', initialFlight),
    // Add this feature
    withHypermediaAction('updateFlightConnection'),
    // Connect the action with the metadata
    withHooks({
        onInit(store) {
            store._connectUpdateFlightConnection(store.flightModel.connection, 'update');
        }
    })
);
```

The `withHypermediaAction` adds a method to the store to execute it and a state object to check the metastate of the action similar to a resource. The following code shows parts of the metaobject you can use (e.g. for showing a spinner in case of a running request).

```ts
// A signal indicating if the action is available, means the specified 
// metadata - provided via the connect method - is available in the 
// currently loaded resource.
const isAvailableSignal = this.store.updateFlightConnectionState.isAvailable;
// A signal indicating if a request is currently running. Means a request
// was sent to the backend and the client is waiting for the response. You
// can use this e.g. for showing a loading spinner or progress bar in your UI.
const isExecutingSignal = this.store.updateFlightConnectionState.isExecuting;
```
:::info
The shown action state signals are just examples. There is more metainformation for each action available.
:::

To execute the action call the method on the store which has the same name as the action you added with the `withHypermediaAction` feature:

```ts
const actionPromise = this.store.updateFlightConnection();
```

This call finally send the connection object back to the server using the HTTP verb specified in the metadata and returns a promise in order to be able to await the completion of this asynchronous operation.

## Add more Actions to the Store
So far we have added only one action. But the example resource from the beginning provides more actions. A signal store which supports all possible actions could look like the following final code snippet: 

```ts
import { signalStore, withHooks } from '@ngrx/signals';
import { withHypermediaResource, withHypermediaAction } from '@angular-architects/ngrx-hateoas';

export const FlightEditStore = signalStore(
    { providedIn: 'root' },
    withHypermediaResource('flightModel', initialFlight),
    withHypermediaAction('updateFlightConnection'),
    withHypermediaAction('updateFlightTimes'),
    withHypermediaAction('deleteFlight'),
    withHooks({
        onInit(store) {
            store._connectUpdateFlightConnection(store.flightModel.connection, 'update');
            store._connectUpdateFlightTimes(store.flightModel.times, 'update');
            store._connectDeleteFlight(store.flightModel, 'delete');
        }
    })
);
```

The final store, as shown in the previous code sample is able to do the following things:
* read the JSON from backend into the store and provide it as state by providing a url
* reload the state into the backend
* provide metastate about the requests to the backend (e.g. such as if a request is currently running)
* provides a patchable signal to the data which makes it easy to modify the data without the need to write methods
* provides the capability to send the connection object back to the server
* provides the capability to send the times object back to the server
* provides the capability to send a delete call to the server to delete the flight
* provides metastate to all actions (e.g. such as if an action is currently executed or if a call was successfull)

And all of this with just a few lines of code!
