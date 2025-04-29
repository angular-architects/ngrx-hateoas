---
sidebar_position: 4
---

# Anti Forgery
**ngrx-hateoas** provides a slightly different implementation to handle anti forgery request tokens. Other than the angular default implementation the **ngrx-hateoas** implementation works also with absolute URLs. In case the URLs in your metadata are absolute URLs and you would like to use anti forgery request tokens you can use the `withAntiForgery` feature function at the `provideHateoas` function. 

If you just add the feature function without any further configuration, `withAntiForgery` looks for a cookie with the name `XSRF-TOKEN` and sets the value to a header with the name `X-XSRF-TOKEN`.

## Example
If you register **ngrx-hateoas** linke shown in the following code snippet...

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideHateoas(withAntiForgery({
        cookieName: 'AntiForgeryCookie',
        headerName: 'X-AntiForgeryToken'
    }))
  ]
};
```

...then **ngrx-hateoas** reads the anti forgery token from a cookie with the name `AntiForgeryCookie` and sends it back to the server in a header with the name `X-AntiForgeryToken`. **ngrx-hateoas** does this also in case of absolute URLs.

