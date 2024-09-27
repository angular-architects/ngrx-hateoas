import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signalStore } from '@ngrx/signals';
import { withHypermediaResource } from './with-hypermedia-resource';
import { provideHateoas } from '../provide';

type RootModel = {
    apiName: string
    _links: {
        testModel: { href: string }
    }
};

const initialRootModel: RootModel = {
    apiName: 'test',
    _links: {
        testModel: { href:  'api/test-model?origin=fromLink'}
    }
}

type TestModel = {
    numProp: number,
    objProp: {
        stringProp: string
    },
    _links?: {
        self: { href: string }
    }
}

const initialTestModel: TestModel = {
    numProp: 1,
    objProp: {
        stringProp: 'initial string'
    }
};

const TestStore = signalStore(
    { providedIn: 'root' },
    withHypermediaResource('rootModel', initialRootModel),
    withHypermediaResource('testModel', initialTestModel)
);

describe('withHypermediaResource', () => {

    let store: InstanceType<typeof TestStore>;
    let httpTestingController: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ provideHttpClient(), provideHttpClientTesting(), provideHateoas() ]
        });
        store = TestBed.inject(TestStore);
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    it('sets correct initial resource state', () => {
        expect(store.testModelState.url()).toBe('');
        expect(store.testModelState.isLoaded()).toBeFalse();
        expect(store.testModelState.isLoading()).toBeFalse();
        expect(store.testModel()).toBe(initialTestModel);
    });

    it('has correct resource methods', () => {
        expect(store.loadTestModelFromLink).toBeDefined();
        expect(store.loadTestModelFromUrl).toBeDefined();
        expect(store.reloadTestModel).toBeDefined();
        expect(store.getTestModelAsPatchable).toBeDefined();
    });

    it('loads the resource from url and sets state correctly', async () => {
        const resourceFromUrl: TestModel = {
            numProp: 2,
            objProp: {
                stringProp: 'from Url'
            }
        };

        const loadPromise = store.loadTestModelFromUrl('api/test-model');

        expect(store.testModelState.isLoading()).toBeTrue();
        expect(store.testModelState.isLoaded()).toBeFalse();

        httpTestingController.expectOne('api/test-model').flush(resourceFromUrl);
        httpTestingController.verify();

        await loadPromise;

        expect(store.testModelState.url()).toBe('api/test-model');
        expect(store.testModelState.isLoading()).toBeFalse();
        expect(store.testModelState.isLoaded()).toBeTrue();
        expect(store.testModel.objProp.stringProp()).toBe('from Url');
    });

    it('loads the resource from link and sets state correctly', async () => {
        const resourceFromLink: TestModel = {
            numProp: 2,
            objProp: {
                stringProp: 'from Link'
            }
        };

        const loadPromise = store.loadTestModelFromLink(store.rootModel(), 'testModel');

        expect(store.testModelState.isLoading()).toBeTrue();
        expect(store.testModelState.isLoaded()).toBeFalse();

        httpTestingController.expectOne('api/test-model?origin=fromLink').flush(resourceFromLink);
        httpTestingController.verify();

        await loadPromise;

        expect(store.testModelState.url()).toBe('api/test-model?origin=fromLink');
        expect(store.testModelState.isLoading()).toBeFalse();
        expect(store.testModelState.isLoaded()).toBeTrue();
        expect(store.testModel.objProp.stringProp()).toBe('from Link');
    });

    it('reloads the resource and sets state correctly', async () => {
        const resourceFromUrl: TestModel = {
            numProp: 2,
            objProp: {
                stringProp: 'from Url'
            }
        };

        const resourceFromUrlReloaded: TestModel = {
            numProp: 2,
            objProp: {
                stringProp: 'from Url Reloaded'
            }
        };

        let loadPromise = store.loadTestModelFromUrl('api/test-model');
        httpTestingController.expectOne('api/test-model').flush(resourceFromUrl);
        await loadPromise;

        loadPromise = store.reloadTestModel();

        expect(store.testModelState.isLoading()).toBeTrue();
        expect(store.testModelState.isLoaded()).toBeTrue();

        httpTestingController.expectOne('api/test-model').flush(resourceFromUrlReloaded);
        httpTestingController.verify();

        await loadPromise;

        expect(store.testModelState.url()).toBe('api/test-model');
        expect(store.testModelState.isLoading()).toBeFalse();
        expect(store.testModelState.isLoaded()).toBeTrue();
        expect(store.testModel.objProp.stringProp()).toBe('from Url Reloaded');
    });

    it('gets the resource as patchable', () => {
        const resource = store.getTestModelAsPatchable();

        resource.patch({ numProp: 5, objProp: { stringProp: 'patched1' } });

        expect(store.testModel.numProp()).toBe(5);
        expect(store.testModel.objProp.stringProp()).toBe('patched1');

        resource.objProp.stringProp.patch('patched2');

        expect(store.testModel.numProp()).toBe(5);
        expect(store.testModel.objProp.stringProp()).toBe('patched2');
    });

    it('uses self url on reload', async () => {

        const resourceFromUrl: TestModel = {
            numProp: 2,
            objProp: {
                stringProp: 'from Url Reloaded'
            },
            _links: {
                self: { href: '/self-url' }
            }
        };

        let loadPromise = store.loadTestModelFromUrl('api/test-model');
        httpTestingController.expectOne('api/test-model').flush(resourceFromUrl);
        await loadPromise;

        loadPromise = store.reloadTestModel();

        expect(store.testModelState.isLoading()).toBeTrue();
        expect(store.testModelState.isLoaded()).toBeTrue();

        httpTestingController.expectOne('/self-url');
        httpTestingController.verify();
    });

});
