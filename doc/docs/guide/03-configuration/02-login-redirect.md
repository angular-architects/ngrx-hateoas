---
sidebar_position: 2
---

# Login Redirect
In case **ngrx-hateoas** makes request to the server and gets a `HTTP 401 Unauthorized` status code as answer you can instruct **ngrx-hateoas** to navigate to a specific url. To do this use the `withLoginRedirect` feature function at the `provideHateoas` function.

This feature is intendet to be used in cases where you run your OAuth authentication flow server side. In this case an API can respond with 401 to indicate that the token or a cookie has expired an the client needs to start a new login flow. You can then provide the endpoint on which the client can call the server to initiate a new authentication flow. 

## Example
If you register **ngrx-hateoas** linke shown in the following code snippet...

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideHateoas(withLoginRedirect({
        loginUrl: '/my/login/route';
        redirectUrlParamName: 'redirectUri';
    }))
  ]
};
```

...then **ngrx-hateoas** sets the window location to `/my/login/route` in case it received a HTTP 401 and appends a query parameter with the name `redirectUri` which contians the full window location at the moment the library received the 401 error. After the redirect the full new window location looks like this: 

```
<origin>/my/login/route?redirectUri=<origin>/previous/route
```


:::info
The `redirectUrlParamName` can be used to provide the current route the server. After successfull authentication the server can then redirect the client to the exact same position where he was interrupted by the 401 response.
:::
