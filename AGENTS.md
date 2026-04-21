# AGENTS Notes — ngrx-hateoas workspace

Purpose
- This workspace contains an Angular library, `@angular-architects/ngrx-hateoas`, built on top of the NgRx Signal Store. The library helps load hypermedia JSON resources into a reactive signal-based store, mutate state locally and execute hypermedia-driven actions.

Key locations
- Library source: `libs/ngrx-hateoas`
- Documentation (user guide): `doc/docs/guide` (see Getting Started, Concept, Pipes, Configuration, Loading Features, State Mutation Features, Action Features)
- Playground app (demo + local server): `apps/playground` (contains `server.js` and `db.json` for local demonstration)

How tests are written (libs/ngrx-hateoas)
- Location: `libs/ngrx-hateoas/src/lib/**/*.spec.ts`.
- Framework / runner: Angular unit tests using Jasmine (see `tsconfig.spec.json` types: `jasmine`) and Angular TestBed utilities.
- Common patterns:
  - Use `TestBed.configureTestingModule(...)` with providers such as `provideZonelessChangeDetection()`, `provideHttpClient()` and `provideHttpClientTesting()` where needed.
  - Services that call HTTP use `HttpTestingController` and `expectOne(...).flush(...)` to simulate server responses and assert request properties (method, body, headers).
  - Many tests assert metastate signals (e.g., `isLoading`, `isLoaded`, `isAvailable`) and verify reactive behavior (cancellation of previous requests, reactive reloads when a `Signal` changes) via `signalStore`, `signal()` and `TestBed.flushEffects()` where applicable.
  - Tests use `async/await` or `expectAsync` for promise-based operations and standard Jasmine matchers (`toBeTrue`, `toBeFalse`, `toEqual`, `toBe`, `toBeDefined`, etc.).
  - Tests cover pipes, services (request/hateoas), and store-features (loading, writable copies, actions), focusing on isolated unit behavior.

Playground / local demo
- `apps/playground` contains a minimal Angular app and local server artifacts (`db.json`, `server.js`) useful to run the library locally against a fake REST API for manual testing and demos.

Rules for agents (editing / extending)
- When changing features, update matching docs in `doc/docs/guide/*` and add/adjust unit tests under `libs/ngrx-hateoas/src/lib/**`.
- For HTTP-related behavior, follow existing test patterns using `provideHttpClientTesting()` and `HttpTestingController`.
- Use `provideZonelessChangeDetection()` in TestBed providers to match existing test environment.

References
- See `doc/docs/guide/01-getting-started.md` and `doc/docs/guide/02-concept.md` for conceptual details and examples.
