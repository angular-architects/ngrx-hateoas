/*
 * Public API Surface of ngrx-hateoas
 */

export * from './lib/provide';
export * from './lib/models';
export * from './lib/util/when-true';
export * from './lib/services/hateoas.service';
export * from './lib/pipes/has-link.pipe';
export * from './lib/pipes/get-link.pipe';
export * from './lib/pipes/has-action.pipe';
export * from './lib/pipes/get-action.pipe';
export * from './lib/store-features/with-hypermedia-resource';
export * from './lib/store-features/with-initial-hypermedia-resource';
export * from './lib/store-features/with-linked-hypermedia-resource';
export * from './lib/store-features/with-hypermedia-action';
export * from './lib/store-features/with-hypermedia-collection-action';
export { type Patchable, type DeepPatchableSignal } from './lib/util/deep-patchable-signal';