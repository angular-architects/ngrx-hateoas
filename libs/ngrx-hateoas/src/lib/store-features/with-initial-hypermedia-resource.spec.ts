import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signalStore } from '@ngrx/signals';
import { provideHateoas } from '../provide';
import { withInitialHypermediaResource } from './with-initial-hypermedia-resource';
import { inject, InjectionToken, provideZonelessChangeDetection } from '@angular/core';

type RootModel = {
    apiName: string
};

const initialRootModel: RootModel = {
    apiName: 'test',
}

const TestStoreWithFixedUrl = signalStore(
    { providedIn: 'root' },
    withInitialHypermediaResource('rootModel', initialRootModel, '/api')
);

const ROOT_URL = new InjectionToken<string>('RootUrl', {
    providedIn: 'root',
    factory: () => '/api/injected'
});

const TestStoreWithInjectedUrl = signalStore(
    { providedIn: 'root' },
    withInitialHypermediaResource('rootModel', initialRootModel, () => inject(ROOT_URL))
);

const TestStoreWithPromiseUrl = signalStore(
    { providedIn: 'root' },
    withInitialHypermediaResource('rootModel', initialRootModel, Promise.resolve('/api/promised'))
);

const TestStoreWithAsyncResolverUrl = signalStore(
    { providedIn: 'root' },
    withInitialHypermediaResource('rootModel', initialRootModel, () => Promise.resolve('/api/async-resolved'))
);

describe('withInitialHypermediaResource', () => {

    let httpTestingController: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting(), provideHateoas()]
        });
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    it('requrests model from fixed url automaticallay and provides correct states', (done: DoneFn) => {
        const store = TestBed.inject(TestStoreWithFixedUrl);
        expect(store.rootModelState.isLoaded()).toBeFalse();
        expect(store.rootModelState.isLoading()).toBeTrue();
        httpTestingController.expectOne('/api').flush(initialRootModel);
        httpTestingController.verify();
        setTimeout(() => {
            expect(store.rootModelState.isLoaded()).toBeTrue();
            expect(store.rootModelState.isLoading()).toBeFalse();
            done();
        }, 0)
    });

    it('requests model from injected url automaticallay and provides correct states', (done: DoneFn) => {
        const store = TestBed.inject(TestStoreWithInjectedUrl);
        expect(store.rootModelState.isLoaded()).toBeFalse();
        expect(store.rootModelState.isLoading()).toBeTrue();
        httpTestingController.expectOne('/api/injected').flush(initialRootModel);
        httpTestingController.verify();
        setTimeout(() => {
            expect(store.rootModelState.isLoaded()).toBeTrue();
            expect(store.rootModelState.isLoading()).toBeFalse();
            done();
        }, 0);
    });

    it('requests model from promise url automatically and provides correct states', (done: DoneFn) => {
        const store = TestBed.inject(TestStoreWithPromiseUrl);
        // isLoading is not immediately true because loadFromUrl is called after the promise resolves
        expect(store.rootModelState.isLoaded()).toBeFalse();
        expect(store.rootModelState.isLoading()).toBeFalse();
        setTimeout(() => {
            expect(store.rootModelState.isLoading()).toBeTrue();
            httpTestingController.expectOne('/api/promised').flush(initialRootModel);
            httpTestingController.verify();
            setTimeout(() => {
                expect(store.rootModelState.isLoaded()).toBeTrue();
                expect(store.rootModelState.isLoading()).toBeFalse();
                done();
            }, 0);
        }, 0);
    });

    it('requests model from async resolver url automatically and provides correct states', (done: DoneFn) => {
        const store = TestBed.inject(TestStoreWithAsyncResolverUrl);
        // isLoading is not immediately true because loadFromUrl is called after the promise resolves
        expect(store.rootModelState.isLoaded()).toBeFalse();
        expect(store.rootModelState.isLoading()).toBeFalse();
        setTimeout(() => {
            expect(store.rootModelState.isLoading()).toBeTrue();
            httpTestingController.expectOne('/api/async-resolved').flush(initialRootModel);
            httpTestingController.verify();
            setTimeout(() => {
                expect(store.rootModelState.isLoaded()).toBeTrue();
                expect(store.rootModelState.isLoading()).toBeFalse();
                done();
            }, 0);
        }, 0);
    });
});
