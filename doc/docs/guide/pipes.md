---
sidebar_position: 4
---

# Pipes

**ngrx-hateoas** provides a variety of pipes to make it convinient for you to work with the metadata contained in your resources within your Angular templates. All pipes are standalone pipes and can be imported to your component from the default import `@angular-architects/ngrx-hateoas`.

In the following each available pipe is explained briefly. The examples shown are build on top of the sample JSON object from the [Getting Started](./getting-started) section.

## hasLink
The `hasLink` pipe can be used to detect if a link is available on a specific object or not. You typically use this to show or hide a navigation item to the linked resource depending on if the links is available or not.

```html title="Example"
@if(store.flightModel() | hasLink:'nextFlight') {
    <button (click)="onNavigateToNextFlight()">Go to next flight</button>
}
```

## hasAction
The `hasAction` pipe can be used to detect if an action is available on a specific object or not. You typically use this to show or hide a UI element which triggers and finally executes this action.

```html title="Example"
@if(store.flightModel() | hasAction:'delete') {
    <button (click)="onDelete()">Delete the flight</button>
}
```

## getLink
The `getLink` pipe can be used to get the whole metadata of a link from an object in form of a `ResourceLink` object. If the link is not availalbe the pipe returns undefined. You can use it in combination with `hasLink` to create a navigation item which is shown only in case the link is available and directly using the metadata within the template.

```html title="Example"
@if(store.flightModel() | hasLink:'nextFlight') {
    <button [routerLink]="['/flight/edit']" 
            [queryParams]="{ modelUrl: (store.flightModel() | getLink:'nextFlight')?.href }">
            Go to next flight
    </button>
}
```

## getAction
The `getAction` pipe can be used to get the whole metadata of an action from an object in form of a `ResourceAction` object. If the action is not availalbe the pipe returns undefined. You can use it in combination with `hasAction` to create a conditional action item in the template and directly using the metadata.

```html title="Example"
<form [action]="(store.flightModel.connection() | getAction:'update')?.href"
      [method]="(store.flightModel.connection() | getAction:'update')?.method">
    [...]
    @if(store.flightModel.connection() | hasAction:'update') {
        <button type="submit">Save</button>
    }
</form>
```