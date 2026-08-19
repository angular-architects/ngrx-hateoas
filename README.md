# ngrx-hateoas

`ngrx-hateoas` is an Angular library for loading hypermedia JSON into the NgRx Signal Store, following related-resource links, editing state, and executing actions described by the backend.

This repository contains the published library, an interactive playground with a local demo API, and the documentation website.

## Project Links

- [npm package](https://www.npmjs.com/package/@angular-architects/ngrx-hateoas)
- [Library quick start](./libs/ngrx-hateoas/README.md)
- [Documentation](https://angular-architects.github.io/ngrx-hateoas/)
- [Getting Started guide](https://angular-architects.github.io/ngrx-hateoas/docs/guide/getting-started)
- [Issues and feature requests](https://github.com/angular-architects/ngrx-hateoas/issues)

## Repository Structure

| Path | Purpose |
| --- | --- |
| [`libs/ngrx-hateoas`](./libs/ngrx-hateoas) | Angular library source, public API, and unit tests |
| [`apps/playground`](./apps/playground) | Angular application demonstrating the library |
| [`apps/playground/server.js`](./apps/playground/server.js) | Local demo API |
| [`apps/playground/db.json`](./apps/playground/db.json) | Data used by the local demo API |
| [`doc`](./doc) | Docusaurus documentation website |

## Install Dependencies

Clone the repository and install the root workspace dependencies:

```bash
npm i
```

## Run the Playground

Start the demo API in one terminal:

```bash
npm run server
```

The API listens on `http://localhost:5100`.

Start the Angular playground in another terminal:

```bash
npm start
```

Open `http://localhost:4200` and use the browser network tools to inspect the hypermedia responses and the requests derived from their links and actions.

## Build and Verify the Library

Build the Angular library:

```bash
npm run build
```

Run the complete headless test suite with coverage:

```bash
npm run test
```

Run linting:

```bash
npm run lint
```

## Work on the Documentation

The documentation website has its own dependencies. Install and start it from the `doc` directory:

```bash
cd doc
npm i
npm start
```

Create a production documentation build with:

```bash
cd doc
npm run build
```

## Real-World Sample

The [Fancy.ResourceLinker.Sample](https://github.com/fancyDevelopment/Fancy.ResourceLinker.Sample) project demonstrates end-to-end hypermedia usage with Angular and a .NET backend.

## Contributing

Bug reports, feature proposals, documentation improvements, and pull requests are welcome. Before opening a pull request, run the headless tests, library build, and lint checks described above.

## License

This project is licensed under the terms of the [repository license](./LICENSE).
