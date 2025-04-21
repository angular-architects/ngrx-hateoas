---
sidebar_position: 1
---

# Intro

Welcome to the documentation of the **ngrx-hateoas**. A library to work with hypermedia JSON resources provided by a RESTful web API inside of Angular applications.

## What it can do for you
The goal of this library is to transfer any state information which is available on the backend as easily as possible into an Angular client. This is especially relevant in highly data-driven applications where most of the state information or data shown inside of the user interface comes from the backend. To do this, the library follows the HATEOAS pattern and provides the state with the help of the NgRx Signal Store to provide proper signals for any state information.

If you follow the HATEOAS pattern and use this library, you are free from writing or generating Angular services which act as clients to communicate with the backend. This logic is implemented in a very generic and reusable way for any resources within this library. Furthermore, you automatically get additional state information about success, errors, or running operations related to each resource, which you typically need to enable or disable user interactions in your client, show a loading spinner, or similar.

Finally, you can concentrate on your data structure and your UI and don't have to care about infrastructure or cross-cutting code.

## Basic Concept
The basic setup to use this library consists of an Angular application using the NgRx Signal Store to manage the current state and a RESTful Web API. The components inside of the Angular application then use the NgRx Signal Store to read current state information and make modifications to it. The web API provides its resources in the form of hypermedia. See [What is Hypermedia?](#what-is-hypermedia) for more information. The **ngrx-hateoas** library can then provide the complete communication to the backend.

![Example banner](./assets/basic-concept.drawio.svg)

A typical state management flow with **ngrx-hateoas** consists of the following steps:

1. **Read a resource from the backend** 

    Make an HTTP call to the backend to fetch a resource from the web API and load it into the NgRx Signal Store.

2. **Make mutations to the state** 

    Use the NgRx Signal Store and all extensions to work with the loaded resource and modify it.

3. **Send the resource back to the backend**

    When the changed state of step 2 shall be transferred back to the backend, an HTTP call is made to send it to the web API.

4. **(Optional) Reload resources in the store**

    In case your state change has impacts on data structures transferred from the backend to the store, reload the affected resources again into the store.

## What is Hypermedia?
Hypermedia is a key concept in RESTful APIs, referring to the use of hyperlinks within responses to guide clients through related data and available actions. It extends the idea of hypertext by including not just the content but also other information like links, actions, or even web socket endpoints.

In the context of **ngrx-hateoas**, hypermedia enables dynamic interaction with resources by embedding metadata into a JSON object that describes relationships to other JSON objects, actions, or web socket endpoints.

An example for a simple resource like a flight could look like the following:

```json
{
    "id": "123",
    "connection": {
        "from": "New York City - John F. Kennedy",
        "iataFrom": "JFK",
        "to": "Los Angeles International",
        "iataTo": "LAX",
        "_actions": {
            "update": { "href": "/api/flights/flight-123/connection", "method": "PUT" }
        }
    },
    "times": {
        "takeOff": "2023-10-01T10:00:00Z",
        "landing": "2023-10-01T14:00:00Z",
        "_actions": {
            "update": { "href": "/api/flights/flight-123/times", "method": "PUT" }
        }
    },
    "_links": {
        "self": { "href": "/api/flights/flight-123" }
    },
    "_actions": {
        "delete": { "href": "/api/flights/flight-123", "method": "DELETE" }
    }
}
```

In the above example, you see a JSON object representing a flight. But additionally to the data itself, the JSON object also contains metadata within the keys starting with an underscore ( _ ). The metadata embedded in this JSON expresses the following things you can do with the data: 

1. To update the connection of the flight, modify the object in the ``connection`` key and send it to the URL ``/api/flights/flight-123/connection`` using the ```PUT``` verb.
2. To update the times of the flight, modify the object in the ``times`` key and send it to the URL ``/api/flights/flight-123/times`` using the ```PUT``` verb.
3. To get the current state of the whole object, make a GET request to the URL ``/api/flights/flight-123``.
4. To delete the flight, make a request to the URL ``/api/flights/flight-123`` and use the ``DELETE`` verb.

:::info
You don't need to follow the exact same layout as in the example to embed metadata using the ``_links`` and ``action`` keys. **ngrx-hateoas** is flexible and allows you to configure it to support any layout of metadata within JSON objects.
:::

## What is HATEOAS?

HATEOAS (Hypermedia as the Engine of Application State) is an architectural paradigm that allows clients to dynamically navigate resources through hyperlinks provided in responses. Possible state changes are provided via actions. Hyperlinks and actions are metadata sent next to the actual payload. Instead of hardcoding API endpoints, clients rely on these links to discover available actions and related resources. For example, if a user is not allowed to navigate to a linked resource or execute an action, the server would not send this metainformation to the client within its response. Finally, the client has the full state of the resource available, the actual payload, and information related to data and possible actions (or state changes). This approach decouples the client from the server, enabling more flexible and evolvable APIs.

## Creating Hypermedia Responses in the Backend
To create hypermedia responses you can use community libraries for the different technologies:

* **Java** For the Java stack the library [Spring HATEOAS](https://spring.io/projects/spring-hateoas) can be used.
* **.NET** For the .NET stack the library [Fancy.ResourceLinker.Hateoas](https://www.nuget.org/packages/Fancy.ResourceLinker.Hateoas) can be used.
* **Dynamic Languages** For languages which support a dynamic type system like **JavaScript, TypeScript or Python** you can simply add the links with small self written util functions.