---
sidebar_position: 1
---

# Metadata Provider
**ngrx-hateoas** is not limited on a specific hypermedia format in your JSON responses. Instead you can configure how metadata is read out of the JSON response. The library can use three differnt types of metadata: **Links**, **Actions** and **WebSocket** information.


## Default Behaviour
If you don't provide any configuration, **ngrx-hateoas** expects links in the key `_links`, actions in the key `_actions` and sockets in the key `_sockets`. 

Each type of hypermedia provides different data: 

* **Links:** provide just a `href` pointing to the resource:
    ```json title="Link Example Object"
    { "href": "/api/flights/123" }
    ``` 


* **Actions:** provide a `href` pointing to the resource and a key method containing the http verb to use:
    ```json title="Action Example Object"
    { "href": "/api/flights/123", "method": "PUT" }
    ``` 

* **Sockets:** provide  a `href` pointing to the websocket endpoint and a key event containing the event to listen for:
    ```json title="Socket Example Object"
    { "href": "/api/flights/123/messages", "event": "newMessage" }
    ``` 

A default hypermedia JSON object could look like the following example

```json
{
    "anyKeysOnRootObject": "...",
    "subobject": {
        "anyKeysOnSubobject": "...",
        "_links": {
            "aLinkToAResource": { "href": "/api/..." }
        },
        "_actions": {
            "anActionOnSubobject": { "href": "/api/...", "method": "PUT" }
        }, 
        "_sockets": {
            "aSocketForSubobject": { "href": "/api/...", "event": "newMessageForSubobject" }
        }
    },
    "_links": {
        "aLinkToAResource": { "href": "/api/..." }
    },
    "_actions": {
        "anActionOnRootObject": { "href": "/api/...", "method": "DELETE" }
    }, 
    "_sockets": {
        "aSocketForRootObject": { "href": "/api/...", "event": "newMessageForRoot" }
    }
}
```

:::info
    You have to provide only the metadata keys you need (e.g. if an object has no sockets, you can safely leave the `_sockets` key away. The same applies to `_actions` and `_links`).
:::

## Configure a Custom Hypermedia JSON format
To use a custom hypermedia JSON format with **ngrx-hateoas** you have to implement the `MetadataProvider` interface.

```ts
export interface MetadataProvider {
    isMetadataKey(keyName: string): boolean;
    linkLookup(resource: unknown, linkName: string): ResourceLink | undefined;
    getAllLinks(resource: unknown): ResourceLink[];
    actionLookup(resource: unknown, actionName: string): ResourceAction | undefined;
    getAllActions(resource: unknown): ResourceAction[];
    socketLookup(resource: unknown, socketName: string): ResourceSocket | undefined;
    getAllSockets(resource: unknown): ResourceSocket[];
}
```

The interface has a sparate method to lookup each kind of the three supported metadata types. Each method gets the object in which a metadata is searched and can then return the metadata in a typed form or undefined if the metadata was not found on the provided resource. If you have implemented this interface you have to provide it as a feature with the help of the `withMetadataProvider` feature function at the `provideHateoas` function. 

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideHateoas(withMetadataProvider(MyCustomMetadataProvider))
  ]
};
```

## Example
Lets imagine our hypermedia JSON looks like the following:

```json
{
    "anyKeysOnRootObject": "...",
    "subobject": {
        "anyKeysOnSubobject": "...",
        "_metadata": {
            "_link_aLinkToAResource": { "href": "/api/..." },
            "_action_anActionOnSubobject": { "href": "/api/...", "verb": "PUT" },
            "_socket_aSocketForSubobject": { "href": "/api/...", "event": "newMessageForSubobject" }
        }
    },
    "_metadata": {
        "_link_aLinkToAResource": { "href": "/api/..." },
        "_action_anActionOnRootObject": { "href": "/api/...", "verb": "DELETE" },
        "_socket_aSocketForRootObject": { "href": "/api/...", "event": "newMessageForRoot" }
    }
}
```

Then the implementation of a custom `MetadataProvider` could look like shown in the following code snippet:

```ts
const customMetadataProvider: MetadataProvider = {
    isMetadataKey(keyName: string): boolean {
        return keyName === '_metadata';
    },
    linkLookup(resource: unknown, linkName: string): ResourceLink | undefined {
        return resource['_metadata']?.['_link_' + linkName];
    },
    getAllLinks(resource: unknown): ResourceLink[]; {
        const linksMetadata = resource['_metadata'];
        if(!linksMetadata) return [];
        return Object.keys(linksMetadata)
                     .filter(key => key.startsWith('_link_'))
                     .map(key => linksMetadata[key]);
    },
    actionLookup(resource: unknown, actionName: string): ResourceAction | undefined {
        const actionMetadata = resource['_metadata']?.['_action_' + actionName];
        // ResourceAction has the two keys href and method, 
        // therefore we have to bring the metadata into the correct format
        if(actionMetadata) return { href: actionMetadata.href, method: actionMetadata.verb };
        else return undefined;
    },
    getAllActions(resource: unknown): ResourceAction[] {
        const actionsMetadata = resource['_metadata'];
        if(!actionsMetadata) return [];
        return Object.keys(actionsMetadata)
                     .filter(key => key.startsWith('_action_'))
                     .map(key => {
                         const actionMetadata = actionsMetadata[key];
                         return { href: actionMetadata.href, method: actionMetadata.verb };
                     });
    },
    socketLookup(resource: unknown, socketName: string): ResourceSocket | undefined {
        return resource['_metadata']?.['_socket_' + socketName];
    },
    getAllSockets(resource: unknown): ResourceSocket[] {
        const socketsMetadata = resource['_metadata'];
        if(!socketsMetadata) return [];
        return Object.keys(socketsMetadata)
                     .filter(key => key.startsWith('_socket_'))
                     .map(key => socketsMetadata[key]);
    }
}
```