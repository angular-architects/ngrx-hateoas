# @angular-architects/ngrx-hateoas

Bring hypermedia JSON resources into the NgRx Signal Store and interact with them through reactive state, links, and server-provided actions.

`ngrx-hateoas` builds on the NgRx Signal Store and helps Angular applications load resources, follow related-resource links, edit state, and execute HATEOAS actions without duplicating endpoint knowledge in the client.

## Installation

```bash
npm install @angular-architects/ngrx-hateoas @ngrx/signals
```

## Setup

Register the Angular HTTP client and the services provided by `ngrx-hateoas` in your application configuration:

```ts
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHateoas } from '@angular-architects/ngrx-hateoas';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideHateoas()
  ]
};
```

## Quick Start

Define an initial value and add a hypermedia resource plus its update action to a signal store:

```ts
import { Component, inject } from '@angular/core';
import { signalStore } from '@ngrx/signals';
import {
  withHypermediaAction,
  withHypermediaResource
} from '@angular-architects/ngrx-hateoas';

type Flight = {
  id: string;
  origin: string;
  destination: string;
};

const initialFlight: Flight = {
  id: '',
  origin: '',
  destination: ''
};

export const FlightStore = signalStore(
  { providedIn: 'root' },
  withHypermediaResource('flight', initialFlight),
  withHypermediaAction('saveFlight', store => store.flight, 'update')
);

@Component({
  selector: 'app-flight-details',
  template: `
    <button (click)="loadFlight()">Load flight</button>

    <p>{{ store.flight.origin() }} → {{ store.flight.destination() }}</p>

    <button
      (click)="saveFlight()"
      [disabled]="!store.saveFlightState.isAvailable() || store.saveFlightState.isExecuting()"
    >
      Save flight
    </button>
  `
})
export class FlightDetailsComponent {
  readonly store = inject(FlightStore);

  loadFlight() {
    return this.store.loadFlightFromUrl('/api/flights/123');
  }

  saveFlight() {
    return this.store.saveFlight();
  }
}
```

The domain model remains free of hypermedia metadata. The loaded JSON response additionally contains the action URL and HTTP method:

```json
{
  "id": "123",
  "origin": "JFK",
  "destination": "LAX",
  "_actions": {
    "update": { "method": "PUT", "href": "/api/flights/123" }
  }
}
```

`withHypermediaResource` adds the resource as a deep signal, metastate containing `url`, `isLoading`, and `isLoaded`, and methods for loading and reloading it. `withHypermediaAction` derives `saveFlight()` from the `update` metadata supplied by the backend. When called, it sends the current flight to the action URL; metadata is removed from the request body automatically.

## Features

| Area | Features |
| --- | --- |
| Load resources | [`withHypermediaResource`](https://angular-architects.github.io/ngrx-hateoas/docs/guide/loading_features/withHypermediaResource), [`withInitialHypermediaResource`](https://angular-architects.github.io/ngrx-hateoas/docs/guide/loading_features/withInitialHypermediaResource) |
| Follow resource links | [`withLinkedHypermediaResource`](https://angular-architects.github.io/ngrx-hateoas/docs/guide/loading_features/withLinkedHypermediaResource) |
| Execute server-provided actions | [`withHypermediaAction`](https://angular-architects.github.io/ngrx-hateoas/docs/guide/action_features/withHypermediaAction), [`withHypermediaCollectionAction`](https://angular-architects.github.io/ngrx-hateoas/docs/guide/action_features/withHypermediaCollectionAction) |
| Edit state | [`withWritableStateCopy`](https://angular-architects.github.io/ngrx-hateoas/docs/guide/state_mutation_features/withWritableStateCopy), [`withDeepWritableStateCopy`](https://angular-architects.github.io/ngrx-hateoas/docs/guide/state_mutation_features/withDeepWritableStateCopy), [`withDeepWritableStateDelegate`](https://angular-architects.github.io/ngrx-hateoas/docs/guide/state_mutation_features/withDeepWritableStateDelegate), [`withDeepWritableStateProjection`](https://angular-architects.github.io/ngrx-hateoas/docs/guide/state_mutation_features/withDeepWritableStateProjection) |
| Configure HTTP and metadata handling | [Metadata provider](https://angular-architects.github.io/ngrx-hateoas/docs/guide/configuration/metadata-provider), [custom headers](https://angular-architects.github.io/ngrx-hateoas/docs/guide/configuration/custom-headers), [anti-forgery](https://angular-architects.github.io/ngrx-hateoas/docs/guide/configuration/anti-forgery), [login redirect](https://angular-architects.github.io/ngrx-hateoas/docs/guide/configuration/login-redirect) |

## Hypermedia Format

By default, the library recognizes links in `_links`, actions in `_actions`, and sockets in `_sockets`:

```json
{
  "id": "123",
  "name": "Example resource",
  "_links": {
    "self": { "href": "/api/resources/123" },
    "details": { "href": "/api/resources/123/details" }
  },
  "_actions": {
    "update": { "method": "PUT", "href": "/api/resources/123" },
    "delete": { "method": "DELETE", "href": "/api/resources/123" }
  },
  "_sockets": {
    "changes": { "event": "resourceChanged", "href": "/api/resources/123/changes" }
  }
}
```

A custom metadata provider can adapt these conventions to another hypermedia format.

## Compatibility

| ngrx-hateoas | Angular | NgRx Signals |
| --- | --- | --- |
| 22.x | 22.x | 22.x |

## Documentation and Examples

- [Documentation](https://angular-architects.github.io/ngrx-hateoas/)
- [Getting Started guide](https://angular-architects.github.io/ngrx-hateoas/docs/guide/getting-started)
- [Self-contained LLM usage reference](./LLM-REFERENCE.md)
- [Playground application](https://github.com/angular-architects/ngrx-hateoas/tree/main/apps/playground)
- [Real-world sample application](https://github.com/fancyDevelopment/Fancy.ResourceLinker.Sample)
- [Issues and feature requests](https://github.com/angular-architects/ngrx-hateoas/issues)

## Related Server Libraries

Hypermedia documents can be produced by any backend. Examples include [Fancy.ResourceLinker.Hateoas](https://www.nuget.org/packages/Fancy.ResourceLinker.Hateoas) for .NET and [Spring HATEOAS](https://spring.io/projects/spring-hateoas) for Java.

## License

This project is licensed under the terms of the [repository license](https://github.com/angular-architects/ngrx-hateoas/blob/main/LICENSE).
