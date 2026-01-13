import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signalStore } from '@ngrx/signals';
import { withHypermediaResource } from './with-hypermedia-resource';
import { withLinkedHypermediaResource } from './with-linked-hypermedia-resource';
import { provideHateoas } from '../provide';
import { firstValueFrom, timer } from 'rxjs';
import { provideZonelessChangeDetection } from '@angular/core';

type RootModel = {
    apiName: string
    _links: {
        testModel?: { href: string }
    }
};

const initialRootModel: RootModel = {
    apiName: 'test',
    _links: { }
}

type TestModel = {
    name: string,
}

const initialTestModel: TestModel = {
    name: 'initial',
};

const TestStore = signalStore(
    { providedIn: 'root' },
    withHypermediaResource('rootModel', initialRootModel),
    withLinkedHypermediaResource('testModel', initialTestModel, store => store.rootModel, 'testModel')
);

describe('withLinkedHypermediaResource', () => {

    let store: InstanceType<typeof TestStore>;
    let httpTestingController: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting(), provideHateoas()]
        });
        store = TestBed.inject(TestStore);
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    it('sets correct initial resource state', () => {
        expect(store.testModelState.url()).toBe('');
        expect(store.testModelState.isLoaded()).toBeFalse();
        expect(store.testModelState.isAvailable()).toBeFalse();
        expect(store.testModelState.isLoading()).toBeFalse();
        expect(store.testModel()).toBe(initialTestModel);
    });

    it('has correct resource methods', () => {
        expect(store.reloadTestModel).toBeDefined();
        expect(store.getTestModelAsPatchable).toBeDefined();
    });

    it('loads the linked resource after link in root resource is available or has changed', async () => {
        const rootModelFromUrl: RootModel = {
            apiName: 'loaded model',
            _links: {
                testModel: { href: '/api/test-model' }
            }
        };

        const testModelFromLink: TestModel = {
            name: 'from link'
        };

        let loadRootModel = store.loadRootModelFromUrl('/api/root-model');

        httpTestingController.expectOne('/api/root-model').flush(rootModelFromUrl);;
        httpTestingController.verify();
   
        await loadRootModel;
        await firstValueFrom(timer(0));

        expect(store.testModelState.url()).toBe('/api/test-model');
        expect(store.testModelState.isLoaded()).toBeFalse();
        expect(store.testModelState.isLoading()).toBeTrue();
        expect(store.testModelState.isAvailable()).toBeTrue();

        httpTestingController.expectOne('/api/test-model').flush(testModelFromLink);
        httpTestingController.verify();

        await firstValueFrom(timer(0));

        expect(store.testModelState.url()).toBe('/api/test-model');
        expect(store.testModelState.isLoaded()).toBeTrue();
        expect(store.testModelState.isLoading()).toBeFalse();
        expect(store.testModelState.isAvailable()).toBeTrue();

        loadRootModel = store.reloadRootModel();

        httpTestingController.expectOne('/api/root-model').flush({ ...rootModelFromUrl, _links: { testModel: { href: '/api/test-model-changed' } }} satisfies RootModel);;
        httpTestingController.verify();

        await loadRootModel;
        await firstValueFrom(timer(0));

        expect(store.testModelState.url()).toBe('/api/test-model-changed');
        expect(store.testModelState.isLoaded()).toBeTrue();
        expect(store.testModelState.isLoading()).toBeTrue();
        expect(store.testModelState.isAvailable()).toBeTrue();

        httpTestingController.expectOne('/api/test-model-changed');
        httpTestingController.verify();
    });

    it('ignores the response if it is null', async () => {
        const rootModelFromUrl: RootModel = {
            apiName: 'loaded model',
            _links: {
                testModel: { href: '/api/test-model' }
            }
        };

        const loadRootModel = store.loadRootModelFromUrl('/api/root-model');

        httpTestingController.expectOne('/api/root-model').flush(rootModelFromUrl);
        httpTestingController.verify();
   
        await loadRootModel;
        await firstValueFrom(timer(0));

        expect(store.testModelState.url()).toBe('/api/test-model');
        expect(store.testModelState.isLoaded()).toBeFalse();
        expect(store.testModelState.isLoading()).toBeTrue();
        expect(store.testModelState.isAvailable()).toBeTrue();

        httpTestingController.expectOne('/api/test-model').flush(null);
        httpTestingController.verify();

        await firstValueFrom(timer(0));

        expect(store.testModelState.url()).toBeUndefined();
        expect(store.testModelState.isLoaded()).toBeFalse();
        expect(store.testModelState.isLoading()).toBeFalse();
        expect(store.testModelState.isAvailable()).toBeFalse();
    });

    it('does not load the linked resource after root resource has changed but link is same href', async () => {
        const rootModelFromUrl: RootModel = {
            apiName: 'loaded model',
            _links: {
                testModel: { href: '/api/test-model' }
            }
        };

        const testModelFromLink: TestModel = {
            name: 'from link'
        };

        let loadRootModel = store.loadRootModelFromUrl('/api/root-model');

        httpTestingController.expectOne('/api/root-model').flush(rootModelFromUrl);;
        httpTestingController.verify();
   
        await loadRootModel;
        await firstValueFrom(timer(0));

        httpTestingController.expectOne('/api/test-model').flush(testModelFromLink);
        httpTestingController.verify();

        await firstValueFrom(timer(0));

        expect(store.testModelState.url()).toBe('/api/test-model');
        expect(store.testModelState.isLoaded()).toBeTrue();
        expect(store.testModelState.isLoading()).toBeFalse();
        expect(store.testModelState.isAvailable()).toBeTrue();

        loadRootModel = store.reloadRootModel();

        httpTestingController.expectOne('/api/root-model').flush({ ...rootModelFromUrl });;
        httpTestingController.verify();

        await loadRootModel;

        httpTestingController.verify();
    });

    it('cancels the first request if two reloads run in parallel', async () => {
        const rootModelFromUrl: RootModel = {
            apiName: 'loaded model',
            _links: {
                testModel: { href: '/api/test-model' }
            }
        };

        const testModelFromLink: TestModel = {
            name: 'from link'
        };

         const reloadedTestModelFromLink: TestModel = {
            name: 'reloaded from link'
        };

        const loadRootModel = store.loadRootModelFromUrl('/api/root-model');

        httpTestingController.expectOne('/api/root-model').flush(rootModelFromUrl);;
        httpTestingController.verify();
   
        await loadRootModel;
        await firstValueFrom(timer(0));

        httpTestingController.expectOne('/api/test-model').flush(testModelFromLink);
        httpTestingController.verify();

        await firstValueFrom(timer(0));

        let reloadPromise = store.reloadTestModel();
        reloadPromise = store.reloadTestModel();

        // first reload request should have been cancelled
        const requests = httpTestingController.match(req => req.url === '/api/test-model');
        expect(requests[0].cancelled).toBeTrue();

        // flush the second reload response and await completion
        requests[1].flush(reloadedTestModelFromLink);
        await reloadPromise;

        // store should reflect the second reload's response
        expect(store.testModel.name()).toBe('reloaded from link');

        httpTestingController.verify();
    });

});
