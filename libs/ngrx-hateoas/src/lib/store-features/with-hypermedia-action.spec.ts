import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signalStore } from '@ngrx/signals';
import { withHypermediaResource } from './with-hypermedia-resource';
import { provideHateoas } from '../provide';
import { firstValueFrom, timer } from 'rxjs';
import { withHypermediaAction } from './with-hypermedia-action';

type TestModel = {
    name: string,
    _actions: {
        doSomething?: {
            href: string,
            method: string
        }
    }
}

const initialTestModel: TestModel = {
    name: 'initial',
    _actions: {
    }
};

const TestStore = signalStore(
    { providedIn: 'root' },
    withHypermediaResource('testModel', initialTestModel),
    withHypermediaAction('doSomething', store => store.testModel, 'doSomething')
);

describe('withHypermediaAction', () => {

    let store: InstanceType<typeof TestStore>;
    let httpTestingController: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpClientTesting(), provideHateoas()]
        });
        store = TestBed.inject(TestStore);
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    async function loadAvailableAction(method = 'PUT') {
        const loadPromise = store.loadTestModelFromUrl('/api/test-model');
        httpTestingController.expectOne('/api/test-model').flush({
            name: 'foobar',
            _actions: { doSomething: { href: '/api/do-something', method } }
        } satisfies TestModel);
        await loadPromise;
        await firstValueFrom(timer(0));
    }

    it('sets correct initial resource state', () => {
        expect(store.doSomethingState.href()).toBe('');
        expect(store.doSomethingState.method()).toBe('');
        expect(store.doSomethingState.isAvailable()).toBeFalse();
        expect(store.doSomethingState.isExecuting()).toBeFalse();
        expect(store.doSomethingState.hasError()).toBeFalse();
        expect(store.doSomethingState.error()).toBeNull();
    });

    it('has correct resource methods', () => {
        expect(store.doSomething).toBeDefined();
    });

    it('throws error if action is not available', async () => {
        await expectAsync(store.doSomething()).toBeRejectedWithError('Action is not available');
        httpTestingController.verify();
    });

    it('executes an action successfully after it is available', async () => {
        await loadAvailableAction();

        expect(store.doSomethingState.href()).toBe('/api/do-something');
        expect(store.doSomethingState.method()).toBe('PUT');
        expect(store.doSomethingState.isAvailable()).toBeTrue();
        expect(store.doSomethingState.isExecuting()).toBeFalse();
        expect(store.doSomethingState.hasError()).toBeFalse();
        expect(store.doSomethingState.error()).toBeNull();

        const doSomethingPromise = store.doSomething();

        expect(store.doSomethingState.href()).toBe('/api/do-something');
        expect(store.doSomethingState.method()).toBe('PUT');
        expect(store.doSomethingState.isAvailable()).toBeTrue();
        expect(store.doSomethingState.isExecuting()).toBeTrue();
        expect(store.doSomethingState.hasError()).toBeFalse();
        expect(store.doSomethingState.error()).toBeNull();

        const actionRequest = httpTestingController.expectOne('/api/do-something');
        httpTestingController.verify();

        expect(actionRequest.request.method).toBe('PUT');
        expect(actionRequest.request.body.name).toBe('foobar');

        actionRequest.flush(204, { headers: { foo: 'bar' } });
   
        const response = await doSomethingPromise;

        expect(response.headers.get('foo')).toBe('bar');

        expect(store.doSomethingState.href()).toBe('/api/do-something');
        expect(store.doSomethingState.method()).toBe('PUT');
        expect(store.doSomethingState.isAvailable()).toBeTrue();
        expect(store.doSomethingState.isExecuting()).toBeFalse();
        expect(store.doSomethingState.hasError()).toBeFalse();
        expect(store.doSomethingState.error()).toBeNull();
    });

    it('stores an HTTP action error and rejects', async () => {
        await loadAvailableAction();

        const actionPromise = store.doSomething();
        httpTestingController.expectOne('/api/do-something').flush('failed', { status: 500, statusText: 'Server Error' });

        await expectAsync(actionPromise).toBeRejected();
        expect(store.doSomethingState.isExecuting()).toBeFalse();
        expect(store.doSomethingState.hasError()).toBeTrue();
        expect(store.doSomethingState.error()).toBeDefined();
    });

    it('sends no body for DELETE actions', async () => {
        await loadAvailableAction('DELETE');

        const actionPromise = store.doSomething();
        const request = httpTestingController.expectOne('/api/do-something');
        expect(request.request.body).toBeNull();
        request.flush(null);

        await actionPromise;
    });

    it('resets availability when the action disappears or becomes invalid', async () => {
        await loadAvailableAction();

        for (const [url, actions] of [
            ['/api/without-action', {}],
            ['/api/with-invalid-action', { doSomething: { href: '', method: 'TRACE' } }]
        ] as const) {
            const loadPromise = store.loadTestModelFromUrl(url);
            httpTestingController.expectOne(url).flush({ name: 'updated', _actions: actions });
            await loadPromise;
            await firstValueFrom(timer(0));
            expect(store.doSomethingState.isAvailable()).toBeFalse();
        }
    });

});
