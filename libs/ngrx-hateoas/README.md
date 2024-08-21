# NGRX Hateoas

A library to bring hypermedia json into the ngrx signal store following the HATEOAS approach to make it easily useable within Angular.

## Objective

If you provide resources from your web api with hypermedia containing links to related resources as well as information about possible actions on your resource, then this library makes interacting with your web api as simple as possible.

A possible hypermedia json could look like the following example: 

```json
{
    "_links": {
        "self": { "href": "http://myapp.dom.tld/resource" },
        "linkedResource": { "href": "http://myapp.dom.tld/linked-resource" }
    },
    "_actions": {
        "delete": { "method": "DELETE", "href": "http://myapp.dom.tld/resource"}
    },
    "stringProp": "foo",
    "subObj": {
        "numProp": 5, 
        "_links": {
            "subObjLinkedResource": { "href": "http://myapp.dom.tld/sub-obj-linked-resource" }
        },
        "_actions": {
            "create": { "href": "http://myapp.dom.tld/resource/sub-obj", "method": "POST"}
        }
    }
}
```

The library helps you to use the metadata within the json structure. To create such hypermedia json you can use various libraries. For .NET we recommend to use the Fancy.ResourceLinker.Hateoas NuGet package. For Java we recommend the Spring.HATEOAS library.

## Sample Application
There is a sample application [Fancy.ResourceLinker.Sample](https://github.com/fancyDevelopment/Fancy.ResourceLinker.Sample) which demonstrates end to end real world usage of hypermedia in Angular and also some other aspects of a real wold system.

## Documentation
Detailed documentatin is planned with the first production ready release. Until then have a look at the playground app within this repository that demonstrates the usage of the library.
