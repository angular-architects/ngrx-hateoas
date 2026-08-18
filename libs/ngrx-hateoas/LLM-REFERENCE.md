# ngrx-hateoas: LLM Usage Reference

This document is a self-contained reference for generating Angular code with
`@angular-architects/ngrx-hateoas`. 

## 1. Instructions for the LLM

When generating code with this library, follow these rules:

1. Use only APIs documented in this file. Do not invent store members or
   configuration options.
2. Register `provideHateoas()` before injecting a store that uses ngrx-hateoas features.
3. Define a TypeScript type and a complete initial value for every loaded
   resource.
4. Treat links and actions as server-provided runtime controls. Read their URLs
   and HTTP methods from hypermedia metadata instead of duplicating endpoints
   in client action code.
5. Put Signal Store features in dependency order. A feature that selects state
   or props created by another feature must come after that feature.
6. Derive generated member names using the naming rules in this document. Names
   are case-sensitive.
7. Check `<actionName>State.isAvailable()` and/or use the `hasAction` pipe in the template
   before presenting or executing an action.
8. Do not confuse an action metadata name such as `update` with an endpoint URL.
9. If a required resource type, initial value, link relation, action relation,
   or collection identifier is unknown, ask for it rather than inventing it.
10. Preserve application-specific store features and state when modifying an
    existing store.
11. When asked to write tests, use Angular TestBed with
    `provideHttpClientTesting()`, and `HttpTestingController`.

## 2. Scope and Mental Model

The library adds composable features to the NgRx Signal Store. These features
can:

- load JSON resources from URLs;
- follow links embedded in loaded resources;
- expose resource and operation metastate as signals;
- create editable copies or writable views of store state;
- execute actions whose URL and HTTP verb are supplied by a resource;
- adapt the default metadata format to a custom hypermedia format.

The basic flow is:

```text
HTTP GET -> resource in Signal Store -> optional edits -> hypermedia action -> HTTP request
```

The backend controls available transitions through metadata. The client still
defines its domain types, UI behavior, and the mapping between a relation name
and a named store feature.

## 3. Installation and Required Setup

Install the library and NgRx Signal Store:

```bash
npm install @angular-architects/ngrx-hateoas @ngrx/signals
```

Register the HTTP client and ngrx-hateoas services:

```ts
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHateoas } from '@angular-architects/ngrx-hateoas';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHateoas()
  ],
};
```

Without `provideHateoas()`, the feature services are not registered.

## 4. Default Hypermedia Contract

By default, metadata keys begin with `_`. Metadata is removed from request
bodies before non-GET actions are sent.

### Links

Links are stored under `_links` and selected by relation name:

```json
{
  "_links": {
    "self": { "href": "/api/flights/123" },
    "next": { "href": "/api/flights/124" }
  }
}
```

The public link representation is:

```ts
interface ResourceLink {
  rel: string;
  href: string;
}
```

The default metadata provider derives `rel` from the `_links` property name.

### Actions

Actions are stored under `_actions`:

```json
{
  "_actions": {
    "update": { "href": "/api/flights/123", "method": "PUT" },
    "delete": { "href": "/api/flights/123", "method": "DELETE" }
  }
}
```

The public action representation is:

```ts
interface ResourceAction {
  rel: string;
  method: 'PUT' | 'POST' | 'DELETE';
  href: string;
}
```

Only `PUT`, `POST`, and `DELETE` are supported as action verbs. A `DELETE`
action is sent without a body. Other supported actions send the object selected
by the feature as their body.

### Sockets

Socket metadata can be read by `HateoasService` and a custom metadata provider:

```json
{
  "_sockets": {
    "changes": {
      "href": "/api/flights/123/changes",
      "event": "flightChanged"
    }
  }
}
```

```ts
interface ResourceSocket {
  rel: string;
  event: string;
  href: string;
}
```

The library does not open a WebSocket connection itself.

## 5. Feature Selection Guide

| Goal | Use | Important behavior |
| --- | --- | --- |
| Load a resource explicitly | `withHypermediaResource` | Adds URL/link loaders, reload, data state, and metastate |
| Load a resource when the store initializes | `withInitialHypermediaResource` | Resolves an initial URL and performs the first load automatically |
| Reactively follow a link on another resource | `withLinkedHypermediaResource` | Reloads when the selected link changes |
| Edit a separate root-level copy | `withWritableStateCopy` | Writes do not update original store state |
| Edit a separate copy at any depth | `withExperimentalDeepWritableStateCopy` | Experimental; nested nodes are writable |
| Directly edit selected store state at any depth | `withExperimentalDeepWritableStateDelegate` | Experimental; writes immediately patch store state |
| Create a form-shaped writable view over one or more state branches | `withDeepWritableStateProjection` | Stable direct projection; no independent copy |
| Execute an action for one object | `withHypermediaAction` | Derives method and URL from that object's metadata |
| Execute an action for an item in an array | `withHypermediaCollectionAction` | Maintains action state per collection key |

Decision guidance:

- Use a copy when edits must be discardable and must not affect the loaded
  resource until the user saves.
- Use a delegate or projection when every edit should immediately update store
  state.
- Prefer `withDeepWritableStateProjection` when a form combines fields from
  multiple state branches or needs a custom shape.
- Use `withLinkedHypermediaResource` only when the related resource should stay
  synchronized with a link exposed by another signal.

## 6. Generated Naming Rules

For:

```ts
withHypermediaResource('flight', initialFlight)
```

the store receives exactly these members:

```ts
store.flight
store.flightState
store.loadFlightFromUrl(...)
store.loadFlightFromLink(...)
store.reloadFlight()
store.getFlightAsPatchable()
```

For:

```ts
withLinkedHypermediaResource(
  'nextFlight',
  initialFlight,
  store => store.flight,
  'next',
)
```

the store receives:

```ts
store.nextFlight
store.nextFlightState
store.reloadNextFlight()
store.getNextFlightAsPatchable()
```

For:

```ts
withHypermediaAction('saveFlight', store => store.flight, 'update')
```

the store receives:

```ts
store.saveFlight()
store.saveFlightState
```

For a resource name, the first character is capitalized when method names are
created. The state and resource property retain the exact supplied name. An
action method retains the exact supplied action name.

## 7. Loading Features

### `withHypermediaResource`

Use this feature for a resource loaded explicitly from a URL or a link.

```ts
function withHypermediaResource<ResourceName extends string, TResource>(
  resourceName: ResourceName,
  initialValue: TResource,
): SignalStoreFeature;
```

It adds:

```ts
store.<resourceName>: DeepSignal<TResource>

store.<resourceName>State: DeepSignal<{
  url: string;
  isLoading: boolean;
  isLoaded: boolean;
}>
```

Methods:

```ts
load<ResourceName>FromUrl(
  url: string | null,
  fromCache?: boolean,
): Promise<void>;

load<ResourceName>FromUrl(
  url: Signal<string | null>,
): EffectRef;

load<ResourceName>FromLink(
  linkRoot: unknown,
  linkName: string,
): Promise<void>;

reload<ResourceName>(): Promise<void>;

get<ResourceName>AsPatchable(): DeepPatchableSignal<TResource>;
```

Example:

```ts
import { signalStore } from '@ngrx/signals';
import { withHypermediaResource } from '@angular-architects/ngrx-hateoas';

type Flight = {
  id: string;
  origin: string;
  destination: string;
};

const initialFlight: Flight = {
  id: '',
  origin: '',
  destination: '',
};

export const FlightStore = signalStore(
  { providedIn: 'root' },
  withHypermediaResource('flight', initialFlight),
);
```

Load and read it:

```ts
await store.loadFlightFromUrl('/api/flights/123');

store.flight();
store.flight.origin();
store.flightState.isLoading();
store.flightState.isLoaded();
```

Behavior:

- Passing `null` cancels the active request and resets data and metastate to
  their initial values.
- Passing `fromCache: true` skips the GET when the same URL is already loaded.
- Passing a `Signal<string | null>` establishes reactive loading and returns an
  `EffectRef`. Destroy that ref when its lifetime must end before the store's
  lifetime.
- Starting a new load cancels the active HTTP subscription.
- Loading from a missing link resolves without sending a request.
- Reload prefers the resource's current `self` link. If no `self` link exists,
  it uses the last recorded URL.
- `get<ResourceName>AsPatchable()` returns a signal-like writable facade over
  the actual resource state. Changes are not an independent copy.

Do not invent a `load...` method for `withLinkedHypermediaResource`; that
feature loads reactively and only exposes reload and patchable access methods.

### `withInitialHypermediaResource`

Use this when the first resource must load as the store is initialized.

```ts
type InitialUrl = string | Promise<string>;
type InitialUrlOrResolver = InitialUrl | (() => InitialUrl);

function withInitialHypermediaResource<
  ResourceName extends string,
  TResource,
>(
  resourceName: ResourceName,
  initialValue: TResource,
  url: InitialUrlOrResolver,
): SignalStoreFeature;
```

It adds the same state and methods as `withHypermediaResource` and invokes its
URL loader during store initialization.

Valid forms:

```ts
withInitialHypermediaResource('flight', initialFlight, '/api/flights/123');

withInitialHypermediaResource(
  'flight',
  initialFlight,
  Promise.resolve('/api/flights/123'),
);

withInitialHypermediaResource(
  'flight',
  initialFlight,
  () => inject(FlightUrlService).getInitialUrl(),
);
```

Use the resolver form when Angular dependency injection is required to compute
the URL.

### `withLinkedHypermediaResource`

Use this to follow a relation exposed by another resource signal.

```ts
function withLinkedHypermediaResource<
  ResourceName extends string,
  TResource,
  Input extends SignalStoreFeatureResult,
>(
  resourceName: ResourceName,
  initialValue: TResource,
  linkRootFn: (store) => Signal<Resource | undefined>,
  linkMetaName: string,
): SignalStoreFeature;
```

Example:

```ts
export const FlightStore = signalStore(
  { providedIn: 'root' },
  withHypermediaResource('flight', initialFlight),
  withLinkedHypermediaResource(
    'nextFlight',
    initialFlight,
    store => store.flight,
    'next',
  ),
);
```

It adds:

```ts
store.nextFlight
store.nextFlightState.url
store.nextFlightState.isLoading
store.nextFlightState.isLoaded
store.nextFlightState.isAvailable
store.reloadNextFlight()
store.getNextFlightAsPatchable()
```

`isAvailable` means that the selected root currently contains a valid link with
the configured relation. Removing the link resets the linked resource to its
initial value. A change to the link URL triggers a new GET and cancels the
previous reactive request through RxJS `switchMap` behavior.

## 8. State Mutation Features

### `withWritableStateCopy`

This stable feature creates an editable copy. Writing the copy does not change
the original state. When the original source changes, the linked copy reflects
the new source value.

```ts
withWritableStateCopy(store => ({
  editableConnection: store.flight.connection,
}))
```

Usage:

```ts
store.editableConnection();
store.editableConnection.set({ origin: 'VIE', destination: 'HAM' });
store.editableConnection.origin();
```

The root is writable and also provides deep read signals. Nested deep signals
are not independently writable with this feature.

### `withExperimentalDeepWritableStateCopy`

This feature is experimental. It behaves like a separate linked copy, but every
nested node is writable.

```ts
withExperimentalDeepWritableStateCopy(store => ({
  editableConnection: store.flight.connection,
}))
```

```ts
store.editableConnection.origin.set('VIE');
```

Writing the copy does not update `store.flight`. A later source change can
update the linked copy.

### `withExperimentalDeepWritableStateDelegate`

This feature is experimental. It exposes deep writable delegates that patch the
original store state immediately.

```ts
withExperimentalDeepWritableStateDelegate(store => ({
  editableFlight: store.flight,
}))
```

```ts
store.editableFlight.origin.set('VIE');
// store.flight.origin() is now 'VIE'
```

Use this only when edits should not be isolated from loaded state.

### `withDeepWritableStateProjection`

This stable feature creates a custom-shaped writable view over arbitrary state
branches. It does not introduce independent state.

```ts
import { signalStore, withState } from '@ngrx/signals';
import { withDeepWritableStateProjection } from '@angular-architects/ngrx-hateoas';

export const SearchStore = signalStore(
  withState({
    search: {
      from: null as string | null,
      to: null as string | null,
    },
    settings: {
      travelClass: 'economy',
      language: 'en',
    },
  }),
  withDeepWritableStateProjection(store => ({
    searchForm: {
      route: {
        from: store.search.from,
        to: store.search.to,
      },
      travelClass: store.settings.travelClass,
    },
  })),
);
```

Every projection node is readable and writable:

```ts
store.searchForm();
store.searchForm.route();
store.searchForm.route.from();

store.searchForm.route.from.set('VIE');
store.searchForm.route.set({ from: 'VIE', to: 'HAM' });
store.searchForm.update(form => ({
  ...form,
  travelClass: 'business',
}));
```

Writing a structure node distributes the supplied values to the selected state
leaves beneath it. Writes spanning multiple state roots are committed with one
`patchState` operation. Unselected state properties remain unchanged.

## 9. Action Features

### `withHypermediaAction`

Use this for an action attached to one object.

```ts
function withHypermediaAction<
  ActionName extends string,
  Input extends SignalStoreFeatureResult,
>(
  actionName: ActionName,
  linkRootFn: (store) => Signal<Resource | undefined | null>,
  actionMetaName: string,
): SignalStoreFeature;
```

Example:

```ts
export const FlightStore = signalStore(
  { providedIn: 'root' },
  withHypermediaResource('flight', initialFlight),
  withWritableStateCopy(store => ({
    editableFlight: store.flight,
  })),
  withHypermediaAction(
    'saveFlight',
    store => store.editableFlight,
    'update',
  ),
);
```

This requires runtime metadata on the selected object:

```json
{
  "id": "123",
  "origin": "JFK",
  "destination": "LAX",
  "_actions": {
    "update": {
      "href": "/api/flights/123",
      "method": "PUT"
    }
  }
}
```

Generated API:

```ts
store.saveFlight(): Promise<HttpResponse<unknown>>

store.saveFlightState.method
store.saveFlightState.href
store.saveFlightState.isAvailable
store.saveFlightState.isExecuting
store.saveFlightState.hasError
store.saveFlightState.error
```

Safe execution:

```ts
if (store.saveFlightState.isAvailable() &&
    !store.saveFlightState.isExecuting()) {
  try {
    const response = await store.saveFlight();
    // Handle success.
  } catch (error) {
    // The same failure is exposed through saveFlightState.error().
  }
}
```

Behavior:

- The action becomes available only while valid metadata exists on the selected
  object.
- Calling an unavailable action rejects with `Error('Action is not available')`.
- `isExecuting` is true for the duration of the request.
- A failure sets `hasError` and `error`, then rethrows the failure.
- `PUT` and `POST` send the current selected object.
- `DELETE` sends no body.
- Metadata is stripped from plain nested objects in the request body.

Correct third argument:

```ts
withHypermediaAction('saveFlight', store => store.flight, 'update');
```

Incorrect third argument:

```ts
// Incorrect: the third argument is a relation name, not a URL.
withHypermediaAction(
  'saveFlight',
  store => store.flight,
  '/api/flights/123',
);
```

### `withHypermediaCollectionAction`

Use this when each item in an array can expose the same action relation with a
different URL or availability state.

```ts
function withHypermediaCollectionAction<
  ActionName extends string,
  Input extends SignalStoreFeatureResult,
  ArrayResource extends Resource,
>(
  actionName: ActionName,
  linkRootFn: (store) => Signal<ArrayResource[]>,
  actionMetaName: string,
  options?: {
    idLookup?: (item: ArrayResource) => string | number;
    resourceLookup?: (item: ArrayResource) => Resource;
  },
): SignalStoreFeature;
```

Default behavior expects each array item to have an `id` of type `string` or
`number` and treats the entire item as the action resource:

```ts
withHypermediaCollectionAction(
  'deleteFlight',
  store => store.flights,
  'delete',
)
```

Execute one item's action:

```ts
const id = '123';

if (store.deleteFlightState.isAvailable()[id]) {
  await store.deleteFlight(id);
}
```

The generated state contains records indexed by the collection key:

```ts
store.deleteFlightState.method()[id]
store.deleteFlightState.href()[id]
store.deleteFlightState.isAvailable()[id]
store.deleteFlightState.isExecuting()[id]
store.deleteFlightState.hasError()[id]
store.deleteFlightState.error()[id]
```

For wrapped resources, provide lookup functions:

```ts
type FlightRow = {
  rowKey: string;
  resource: Flight;
};

withHypermediaCollectionAction(
  'saveFlight',
  store => store.flightRows,
  'update',
  {
    idLookup: row => row.rowKey,
    resourceLookup: row => row.resource,
  },
)
```

The object returned by `resourceLookup` supplies both the hypermedia metadata
and the action body.

## 10. Configuration Features

Pass configuration features to `provideHateoas(...)`:

```ts
provideHateoas(
  withMetadataProvider(customMetadataProvider),
  withCustomHeaders({ headers: { 'X-Tenant': 'acme' } }),
  withAntiForgery(),
  withLoginRedirect(),
)
```

### Custom metadata provider

Implement all methods of `MetadataProvider`:

```ts
interface MetadataProvider {
  isMetadataKey(keyName: string): boolean;
  linkLookup(resource: unknown, linkName: string): ResourceLink | undefined;
  getAllLinks(resource: unknown): ResourceLink[];
  actionLookup(
    resource: unknown,
    actionName: string,
  ): ResourceAction | undefined;
  getAllActions(resource: unknown): ResourceAction[];
  socketLookup(
    resource: unknown,
    socketName: string,
  ): ResourceSocket | undefined;
  getAllSockets(resource: unknown): ResourceSocket[];
}
```

Every returned link, action, and socket must include its `rel` property. The
`isMetadataKey` callback controls which properties are removed from action
request bodies.

Example for an alternative top-level `meta` object:

```ts
import {
  MetadataProvider,
  Resource,
  ResourceAction,
  ResourceLink,
  ResourceSocket,
  provideHateoas,
  withMetadataProvider,
} from '@angular-architects/ngrx-hateoas';

function asRecord(value: unknown): Resource | undefined {
  return typeof value === 'object' && value !== null
    ? value as Resource
    : undefined;
}

function metadataOf(resource: unknown): Resource | undefined {
  return asRecord(asRecord(resource)?.['meta']);
}

const customMetadataProvider: MetadataProvider = {
  isMetadataKey: key => key === 'meta',

  linkLookup(resource, relation): ResourceLink | undefined {
    const value = asRecord(asRecord(metadataOf(resource)?.['links'])?.[relation]);
    return typeof value?.['url'] === 'string'
      ? { rel: relation, href: value['url'] }
      : undefined;
  },

  getAllLinks(resource): ResourceLink[] {
    const links = asRecord(metadataOf(resource)?.['links']);
    return Object.keys(links ?? {}).flatMap(relation => {
      const link = this.linkLookup(resource, relation);
      return link ? [link] : [];
    });
  },

  actionLookup(resource, relation): ResourceAction | undefined {
    const value = asRecord(
      asRecord(metadataOf(resource)?.['actions'])?.[relation],
    );
    const method = value?.['verb'];
    return typeof value?.['url'] === 'string' &&
      (method === 'PUT' || method === 'POST' || method === 'DELETE')
      ? { rel: relation, href: value['url'], method }
      : undefined;
  },

  getAllActions(resource): ResourceAction[] {
    const actions = asRecord(metadataOf(resource)?.['actions']);
    return Object.keys(actions ?? {}).flatMap(relation => {
      const action = this.actionLookup(resource, relation);
      return action ? [action] : [];
    });
  },

  socketLookup(resource, relation): ResourceSocket | undefined {
    const value = asRecord(
      asRecord(metadataOf(resource)?.['sockets'])?.[relation],
    );
    return typeof value?.['url'] === 'string' &&
      typeof value?.['event'] === 'string'
      ? {
          rel: relation,
          href: value['url'],
          event: value['event'],
        }
      : undefined;
  },

  getAllSockets(resource): ResourceSocket[] {
    const sockets = asRecord(metadataOf(resource)?.['sockets']);
    return Object.keys(sockets ?? {}).flatMap(relation => {
      const socket = this.socketLookup(resource, relation);
      return socket ? [socket] : [];
    });
  },
};

provideHateoas(withMetadataProvider(customMetadataProvider));
```

### Custom headers

```ts
provideHateoas(
  withCustomHeaders({
    headers: {
      'X-Tenant': 'acme',
      'X-Client': 'flight-ui',
    },
  }),
)
```

These static headers are added to every request made by the library.

### Anti-forgery token

Defaults:

```ts
withAntiForgery({
  cookieName: 'XSRF-TOKEN',
  headerName: 'X-XSRF-TOKEN',
})
```

The header is added to non-GET requests when the configured cookie exists. This
implementation also applies to absolute URLs.

Custom names:

```ts
provideHateoas(
  withAntiForgery({
    cookieName: 'AntiForgeryCookie',
    headerName: 'X-Anti-Forgery-Token',
  }),
)
```

### Login redirect

Defaults:

```ts
withLoginRedirect({
  loginUrl: '/login',
  redirectUrlParamName: 'redirectUrl',
})
```

When a library request receives HTTP 401, the browser is redirected to the
login URL. The current full browser URL is URL-encoded and added as the named
query parameter.

```ts
provideHateoas(
  withLoginRedirect({
    loginUrl: '/auth/login',
    redirectUrlParamName: 'returnTo',
  }),
)
```

## 11. Public Pipes and Service Helpers

The following standalone pipes are exported from the package:

| Pipe class | Template name | Result |
| --- | --- | --- |
| `HasLinkPipe` | `hasLink` | `boolean` |
| `GetLinkPipe` | `getLink` | `ResourceLink \| undefined` |
| `HasActionPipe` | `hasAction` | `boolean` |
| `GetActionPipe` | `getAction` | `ResourceAction \| undefined` |

Example:

```ts
@Component({
  standalone: true,
  imports: [HasActionPipe, GetLinkPipe],
  template: `
    @if (store.flight() | hasAction: 'delete') {
      <button type="button" (click)="deleteFlight()">Delete</button>
    }

    @if ((store.flight() | getLink: 'next'); as nextLink) {
      <a [routerLink]="['/flights']"
         [queryParams]="{ url: nextLink.href }">Next flight</a>
    }
  `,
})
export class FlightComponent {}
```

`HateoasService` is also public:

```ts
const hateoas = inject(HateoasService);

hateoas.getUrl(resource, 'details', { view: 'full' });
hateoas.getLink(resource, 'details');
hateoas.getAction(resource, 'update');
hateoas.getSocket(resource, 'changes');
hateoas.getLinks(resource);
hateoas.getActions(resource);
hateoas.getSockets(resource);
```

`getUrl` throws when the requested link is missing. Query parameters are
appended to the link URL; callers should supply values suitable for use in a
URL.

The `whenTrue` helper converts a boolean signal into a promise that resolves on
the first `true` value:

```ts
await whenTrue(store.flightState.isLoaded);
```

The call requires an Angular injection context because it converts the signal
to an observable internally.

## 12. Recommended Composition Patterns

Feature order matters because later selectors can consume earlier state and
props.

### Load, edit a copy, then save

```ts
signalStore(
  withHypermediaResource('flight', initialFlight),
  withWritableStateCopy(store => ({
    editableFlight: store.flight,
  })),
  withHypermediaAction(
    'saveFlight',
    store => store.editableFlight,
    'update',
  ),
)
```

### Load and directly edit a form-shaped projection

```ts
signalStore(
  withHypermediaResource('flight', initialFlight),
  withDeepWritableStateProjection(store => ({
    flightForm: {
      origin: store.flight.origin,
      destination: store.flight.destination,
    },
  })),
  withHypermediaAction(
    'saveFlight',
    store => store.flight,
    'update',
  ),
)
```

### Load a root resource and follow a link

```ts
signalStore(
  withHypermediaResource('flight', initialFlight),
  withLinkedHypermediaResource(
    'nextFlight',
    initialFlight,
    store => store.flight,
    'next',
  ),
)
```

## 13. Complete End-to-End Example

Backend response:

```json
{
  "id": "123",
  "origin": "JFK",
  "destination": "LAX",
  "_links": {
    "self": { "href": "/api/flights/123" },
    "next": { "href": "/api/flights/124" }
  },
  "_actions": {
    "update": { "href": "/api/flights/123", "method": "PUT" },
    "delete": { "href": "/api/flights/123", "method": "DELETE" }
  }
}
```

Domain model and store:

```ts
import { signalStore } from '@ngrx/signals';
import {
  withHypermediaAction,
  withHypermediaResource,
  withLinkedHypermediaResource,
  withWritableStateCopy,
} from '@angular-architects/ngrx-hateoas';

export type Flight = {
  id: string;
  origin: string;
  destination: string;
};

export const initialFlight: Flight = {
  id: '',
  origin: '',
  destination: '',
};

export const FlightStore = signalStore(
  { providedIn: 'root' },

  withHypermediaResource('flight', initialFlight),

  withLinkedHypermediaResource(
    'nextFlight',
    initialFlight,
    store => store.flight,
    'next',
  ),

  withWritableStateCopy(store => ({
    editableFlight: store.flight,
  })),

  withHypermediaAction(
    'saveFlight',
    store => store.editableFlight,
    'update',
  ),

  withHypermediaAction(
    'deleteFlight',
    store => store.flight,
    'delete',
  ),
);
```

Component:

```ts
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FlightStore } from './flight.store';

@Component({
  selector: 'app-flight-editor',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (store.flightState.isLoading()) {
      <p>Loading...</p>
    }

    @if (store.flightState.isLoaded()) {
      <label>
        Origin
        <input
          [ngModel]="store.editableFlight().origin"
          (ngModelChange)="setOrigin($event)"
        />
      </label>

      <button
        type="button"
        [disabled]="
          !store.saveFlightState.isAvailable() ||
          store.saveFlightState.isExecuting()
        "
        (click)="save()"
      >
        Save
      </button>

      <button
        type="button"
        [disabled]="
          !store.deleteFlightState.isAvailable() ||
          store.deleteFlightState.isExecuting()
        "
        (click)="delete()"
      >
        Delete
      </button>
    }
  `,
})
export class FlightEditorComponent {
  readonly store = inject(FlightStore);

  load(id: string): Promise<void> {
    return this.store.loadFlightFromUrl(`/api/flights/${id}`);
  }

  setOrigin(origin: string): void {
    this.store.editableFlight.update(flight => ({ ...flight, origin }));
  }

  async save(): Promise<void> {
    if (this.store.saveFlightState.isAvailable()) {
      await this.store.saveFlight();
      await this.store.reloadFlight();
    }
  }

  async delete(): Promise<void> {
    if (this.store.deleteFlightState.isAvailable()) {
      await this.store.deleteFlight();
    }
  }
}
```

Important runtime detail: the TypeScript domain model does not need to declare
`_links` or `_actions`. The HTTP response may contain these additional JSON
properties, and the metadata provider reads them at runtime. They are removed
from plain object request bodies before an update is sent.

## 14. Unit Test Pattern

Use the same providers as the library's own HTTP tests:

```ts
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHateoas } from '@angular-architects/ngrx-hateoas';

describe('FlightStore', () => {
  let store: InstanceType<typeof FlightStore>;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FlightStore,
        provideHttpClientTesting(),
        provideHateoas(),
      ],
    });

    store = TestBed.inject(FlightStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads and saves a flight through hypermedia', async () => {
    const loadPromise = store.loadFlightFromUrl('/api/flights/123');

    expect(store.flightState.isLoading()).toBeTrue();

    http.expectOne('/api/flights/123').flush({
      id: '123',
      origin: 'JFK',
      destination: 'LAX',
      _actions: {
        update: { href: '/api/flights/123', method: 'PUT' },
      },
    });

    await loadPromise;

    expect(store.flightState.isLoaded()).toBeTrue();
    expect(store.saveFlightState.isAvailable()).toBeTrue();

    store.editableFlight.update(flight => ({
      ...flight,
      destination: 'SFO',
    }));

    const savePromise = store.saveFlight();
    const request = http.expectOne('/api/flights/123');

    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({
      id: '123',
      origin: 'JFK',
      destination: 'SFO',
    });

    request.flush(null, { status: 204, statusText: 'No Content' });
    await savePromise;
  });
});
```

For reactive URL signals, call `TestBed.flushEffects()` after changing the
signal before expecting the next HTTP request.

## 15. Compact Public API Index

Primary setup:

```ts
provideHateoas
withAntiForgery
withLoginRedirect
withCustomHeaders
withMetadataProvider
```

Loading:

```ts
withHypermediaResource
withInitialHypermediaResource
withLinkedHypermediaResource
```

Actions:

```ts
withHypermediaAction
withHypermediaCollectionAction
```

Mutation:

```ts
withWritableStateCopy
withExperimentalDeepWritableStateCopy
withExperimentalDeepWritableStateDelegate
withDeepWritableStateProjection
```

Pipes:

```ts
HasLinkPipe
GetLinkPipe
HasActionPipe
GetActionPipe
```

Services and helpers:

```ts
HateoasService
whenTrue
```

Models and configuration types:

```ts
Resource
DynamicResource
DynamicResourceValue
ResourceLink
ResourceAction
ResourceSocket
MetadataProvider
AntiForgeryOptions
LoginRedirectOptions
CustomHeadersOptions
Patchable
DeepPatchableSignal
```

Import public APIs from:

```ts
import {
  provideHateoas,
  withHypermediaResource,
  withHypermediaAction,
} from '@angular-architects/ngrx-hateoas';
```
