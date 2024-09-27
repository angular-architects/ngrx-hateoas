import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signalStore } from '@ngrx/signals';
import { provideHateoas } from '../provide';
import { withInitialHypermediaResource } from './with-initial-hypermedia-resource';
import { inject, InjectionToken } from '@angular/core';

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

describe('withInitialHypermediaResource', () => {

    let httpTestingController: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ provideHttpClient(), provideHttpClientTesting(), provideHateoas() ]
        });
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    it('requrests model from fixed url automaticallay and provides correct states', fakeAsync(() => {
        const store = TestBed.inject(TestStoreWithFixedUrl);
        expect(store.rootModelState.isLoaded()).toBeFalse();
        expect(store.rootModelState.isLoading()).toBeTrue();
        httpTestingController.expectOne('/api').flush(initialRootModel);
        httpTestingController.verify();
        tick();
        expect(store.rootModelState.isLoaded()).toBeTrue();
        expect(store.rootModelState.isLoading()).toBeFalse();
    }));

    it('requests model from injected url automaticallay and provides correct states', fakeAsync(() => {
        const store = TestBed.inject(TestStoreWithInjectedUrl);
        expect(store.rootModelState.isLoaded()).toBeFalse();
        expect(store.rootModelState.isLoading()).toBeTrue();
        httpTestingController.expectOne('/api/injected').flush(initialRootModel);
        httpTestingController.verify();
        tick();
        expect(store.rootModelState.isLoaded()).toBeTrue();
        expect(store.rootModelState.isLoading()).toBeFalse();
    }));

});
