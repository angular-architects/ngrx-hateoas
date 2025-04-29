---
sidebar_position: 3
---

# Custom Headers
In case you want to provide custom request headers to your server for all requests executed by **ngrx-hateoas** you can use the `withCustomHeaders` feature function at the `provideHateoas` function.

Use this feature if you want to convienently provide custom headers without the need to write a HTTP interceptor or in case you want differentiate requests made to the backend from standard http client or from **ngrx-hateoas**.

## Example

If you register **ngrx-hateoas** linke shown in the following code snippet...

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideHateoas(withCustomHeaders({
        headers: {
            'X-Custom-Header-1': 'Value1',
            'X-Custom-Header-2': 'Value2',
        };
    }))
  ]
};
```

...then **ngrx-hateoas** sends the following request headers to your backend for each request: 

```
X-Custom-Header-1: Value1
X-Custom-Header-2: Value2
```