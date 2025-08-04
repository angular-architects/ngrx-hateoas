import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signalStore } from '@ngrx/signals';
import { withHypermediaResource } from './with-hypermedia-resource';
import { provideHateoas } from '../provide';
import { firstValueFrom, timer } from 'rxjs';
import { withHypermediaCollectionAction } from './with-hypermedia-collection-action';

type TestModel = {
    items: {
        name: string,
        _actions: {
            doSomething?: {
                href: string,
                method: string
            }
        }
    }[]
}

const initialTestModel: TestModel = {
    items: [{
        name: 'item1',
        _actions: {
        }
    }, {
        name: 'item2',
        _actions: {
            doSomething: { href: '/api/do-something/2', method: 'PUT' }
        }
    }, {
        name: 'item3',
        _actions: {
            doSomething: { href: '/api/do-something/3', method: 'DELETE' }
        }
    }]
};

const TestStore = signalStore(
    { providedIn: 'root' },
    withHypermediaResource('testModel', initialTestModel),
    withHypermediaCollectionAction('doSomething', store => store.testModel.items, 'doSomething', 'name')
);

describe('withHypermediaCollectionAction', () => {

    let store: InstanceType<typeof TestStore>;
    let httpTestingController: HttpTestingController;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            providers: [provideHttpClient(), provideHttpClientTesting(), provideHateoas()]
        });
        store = TestBed.inject(TestStore);
        await firstValueFrom(timer(0));
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    it('sets correct initial resource state', () => {
        expect(store.doSomethingState.href()).toEqual({ item1: '', item2: '/api/do-something/2', item3: '/api/do-something/3'});
        expect(store.doSomethingState.method()).toEqual({ item1: '', item2: 'PUT', item3: 'DELETE'});
        expect(store.doSomethingState.isAvailable()).toEqual({ item1: false, item2: true, item3: true});
        expect(store.doSomethingState.isExecuting()).toEqual({ item1: false, item2: false, item3: false});
        expect(store.doSomethingState.hasExecutedSuccessfully()).toEqual({ item1: false, item2: false, item3: false});
        expect(store.doSomethingState.hasExecutedWithError()).toEqual({ item1: false, item2: false, item3: false});
        expect(store.doSomethingState.hasError()).toEqual({ item1: false, item2: false, item3: false});
        expect(store.doSomethingState.error()).toEqual({ item1: null, item2: null, item3: null});
    });

    it('has correct resource methods', () => {
        expect(store.doSomething).toBeDefined();
    });

    it('throws error if action is not available', async () => {
        await expectAsync(store.doSomething('item1')).toBeRejectedWithError('Action is not available');
        httpTestingController.verify();
    });

    it('executes an action successfully if it is available', async () => {

        const doSomethingPromise = store.doSomething('item2');

        expect(store.doSomethingState.href()).toEqual({ item1: '', item2: '/api/do-something/2', item3: '/api/do-something/3'});
        expect(store.doSomethingState.method()).toEqual({ item1: '', item2: 'PUT', item3: 'DELETE'});
        expect(store.doSomethingState.isAvailable()).toEqual({ item1: false, item2: true, item3: true});
        expect(store.doSomethingState.isExecuting()).toEqual({ item1: false, item2: true, item3: false});
        expect(store.doSomethingState.hasExecutedSuccessfully()).toEqual({ item1: false, item2: false, item3: false});
        expect(store.doSomethingState.hasExecutedWithError()).toEqual({ item1: false, item2: false, item3: false});
        expect(store.doSomethingState.hasError()).toEqual({ item1: false, item2: false, item3: false});
        expect(store.doSomethingState.error()).toEqual({ item1: null, item2: null, item3: null});

        const actionRequest = httpTestingController.expectOne('/api/do-something/2');
        httpTestingController.verify();

        expect(actionRequest.request.method).toBe('PUT');
        expect(actionRequest.request.body.name).toBe('item2');

        actionRequest.flush(204);
   
        await doSomethingPromise;

        expect(store.doSomethingState.href()).toEqual({ item1: '', item2: '/api/do-something/2', item3: '/api/do-something/3'});
        expect(store.doSomethingState.method()).toEqual({ item1: '', item2: 'PUT', item3: 'DELETE'});
        expect(store.doSomethingState.isAvailable()).toEqual({ item1: false, item2: true, item3: true});
        expect(store.doSomethingState.isExecuting()).toEqual({ item1: false, item2: false, item3: false});
        expect(store.doSomethingState.hasExecutedSuccessfully()).toEqual({ item1: false, item2: true, item3: false});
        expect(store.doSomethingState.hasExecutedWithError()).toEqual({ item1: false, item2: false, item3: false});
        expect(store.doSomethingState.hasError()).toEqual({ item1: false, item2: false, item3: false});
        expect(store.doSomethingState.error()).toEqual({ item1: null, item2: null, item3: null});

        const doSomethingPromise2 = store.doSomething('item3');

        expect(store.doSomethingState.href()).toEqual({ item1: '', item2: '/api/do-something/2', item3: '/api/do-something/3'});
        expect(store.doSomethingState.method()).toEqual({ item1: '', item2: 'PUT', item3: 'DELETE'});
        expect(store.doSomethingState.isAvailable()).toEqual({ item1: false, item2: true, item3: true});
        expect(store.doSomethingState.isExecuting()).toEqual({ item1: false, item2: false, item3: true});
        expect(store.doSomethingState.hasExecutedSuccessfully()).toEqual({ item1: false, item2: true, item3: false});
        expect(store.doSomethingState.hasExecutedWithError()).toEqual({ item1: false, item2: false, item3: false});
        expect(store.doSomethingState.hasError()).toEqual({ item1: false, item2: false, item3: false});
        expect(store.doSomethingState.error()).toEqual({ item1: null, item2: null, item3: null});

        const actionRequest2 = httpTestingController.expectOne('/api/do-something/3');
        httpTestingController.verify();

        expect(actionRequest2.request.method).toBe('DELETE');
        expect(actionRequest2.request.body).toBeNull();

        actionRequest2.flush(204);
   
        await doSomethingPromise2;

        expect(store.doSomethingState.href()).toEqual({ item1: '', item2: '/api/do-something/2', item3: '/api/do-something/3'});
        expect(store.doSomethingState.method()).toEqual({ item1: '', item2: 'PUT', item3: 'DELETE'});
        expect(store.doSomethingState.isAvailable()).toEqual({ item1: false, item2: true, item3: true});
        expect(store.doSomethingState.isExecuting()).toEqual({ item1: false, item2: false, item3: false});
        expect(store.doSomethingState.hasExecutedSuccessfully()).toEqual({ item1: false, item2: true, item3: true});
        expect(store.doSomethingState.hasExecutedWithError()).toEqual({ item1: false, item2: false, item3: false});
        expect(store.doSomethingState.hasError()).toEqual({ item1: false, item2: false, item3: false});
        expect(store.doSomethingState.error()).toEqual({ item1: null, item2: null, item3: null});
    });
});
