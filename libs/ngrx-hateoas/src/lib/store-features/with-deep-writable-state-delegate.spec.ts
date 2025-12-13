import { TestBed } from '@angular/core/testing';
import { signalMethod, signalStore, withState } from '@ngrx/signals';
import { Injector, provideZonelessChangeDetection, runInInjectionContext } from '@angular/core';
import { firstValueFrom, timer } from 'rxjs';
import { withExperimentalDeepWritableStateDelegate } from './with-deep-writable-state-delegate';

type TestModel = {
    numProp: number,
    objProp: {
        stringProp: string,
        numProp: number,
    },
    _links?: {
        self: { href: string }
    }
}

const initialTestModel: TestModel = {
    numProp: 1,
    objProp: {
        stringProp: 'initial string',
        numProp: 42,
    }
};

const TestStore = signalStore(
    { providedIn: 'root' },
    withState({ model: initialTestModel, singleProp: 'test' }),
    withExperimentalDeepWritableStateDelegate(store => ({
        modelDelegate: store.model,
        modelObjPropDelegate: store.model.objProp,
        modelObjectPropStringPropDelegate: store.model.objProp.stringProp,
        singlePropDelegate: store.singleProp
    }))
);

describe('withExperimentalDeepWritableStateDelegate', () => {

    let store: InstanceType<typeof TestStore>;

    let modelNotified = false;
    let modelNumPropNotified = false;
    let modelObjPropNotified = false;
    let modelObjPropStringPropNotified = false;
    let modelObjPropNumPropNotified = false;
    let singlePropNotified = false;

    let modelDeletegateNotified = false;
    let modelDelegateNumPropNotified = false;
    let modelDelegateObjPropNotified = false;
    let modelDelegateObjPropStringPropNotified = false;
    let modelDelegateObjPropNumPropNotified = false;
    let singlePropDelegateNotified = false;

    function resetNotifications() {
        modelNotified = false;
        modelNumPropNotified = false;
        modelObjPropNotified = false;
        modelObjPropStringPropNotified = false;
        modelObjPropNumPropNotified = false;
        singlePropNotified = false;

        modelDeletegateNotified = false;
        modelDelegateNumPropNotified = false;
        modelDelegateObjPropNotified = false;
        modelDelegateObjPropStringPropNotified = false;
        modelDelegateObjPropNumPropNotified = false;
        singlePropDelegateNotified = false;
    }


    beforeEach(async () => {
        TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
        store = TestBed.inject(TestStore);
        const injector = TestBed.inject(Injector);

        runInInjectionContext(injector, () => {
            signalMethod(() => modelNotified = true)(store.model);
            signalMethod(() => modelNumPropNotified = true)(store.model.numProp);
            signalMethod(() => modelObjPropNotified = true)(store.model.objProp);
            signalMethod(() => modelObjPropStringPropNotified = true)(store.model.objProp.stringProp);
            signalMethod(() => modelObjPropNumPropNotified = true)(store.model.objProp.numProp);
            signalMethod(() => singlePropNotified = true)(store.singleProp);

            signalMethod(() => modelDeletegateNotified = true)(store.modelDelegate);
            signalMethod(() => modelDelegateNumPropNotified = true)(store.modelDelegate.numProp);
            signalMethod(() => modelDelegateObjPropNotified = true)(store.modelDelegate.objProp);
            signalMethod(() => modelDelegateObjPropStringPropNotified = true)(store.modelDelegate.objProp.stringProp);
            signalMethod(() => modelDelegateObjPropNumPropNotified = true)(store.modelDelegate.objProp.numProp);
            signalMethod(() => singlePropDelegateNotified = true)(store.singlePropDelegate);
        });

        // Await first run of signal methods
        await firstValueFrom(timer(0));
        resetNotifications();
    });

    it('sets correct initial resource state', () => {
        expect(store.model()).toBe(initialTestModel);
        expect(store.singleProp()).toBe('test');
    });

    it('patches a delegated root model state', async () => {

        store.modelDelegate.set({ numProp: 5, objProp: { stringProp: 'patched string', numProp: 10 } });

        await firstValueFrom(timer(0));

        expect(modelNotified).toBeTrue();
        expect(store.model.numProp()).toBe(5);
        expect(modelNumPropNotified).toBeTrue();
        expect(modelObjPropNotified).toBeTrue();
        expect(store.model.objProp.stringProp()).toBe('patched string');
        expect(modelObjPropStringPropNotified).toBeTrue();
        expect(store.model.objProp.numProp()).toBe(10);
        expect(modelObjPropNumPropNotified).toBeTrue();
        expect(store.singleProp()).toBe('test');
        expect(singlePropNotified).toBeFalse();

        expect(modelDeletegateNotified).toBeTrue();
        expect(store.modelDelegate.numProp()).toBe(5);
        expect(modelDelegateNumPropNotified).toBeTrue();
        expect(modelDelegateObjPropNotified).toBeTrue();
        expect(store.modelDelegate.objProp.stringProp()).toBe('patched string');
        expect(modelDelegateObjPropStringPropNotified).toBeTrue();
        expect(store.modelDelegate.objProp.numProp()).toBe(10);
        expect(modelDelegateObjPropNumPropNotified).toBeTrue();
        expect(store.singlePropDelegate()).toBe('test');
        expect(singlePropDelegateNotified).toBeFalse();
    });

    it('patches a delegated nested object state', async () => {
        console.log('setting on nested obj prop delegate', store.modelObjPropDelegate);
        store.modelObjPropDelegate.set({ stringProp: 'nested patched string', numProp: 20 });

        await firstValueFrom(timer(0));

        expect(modelNotified).toBeTrue();
        expect(store.model.numProp()).toBe(1);
        expect(modelNumPropNotified).toBeFalse();
        expect(modelObjPropNotified).toBeTrue();
        expect(store.model.objProp.stringProp()).toBe('nested patched string');
        expect(modelObjPropStringPropNotified).toBeTrue();
        expect(store.model.objProp.numProp()).toBe(20);
        expect(modelObjPropNumPropNotified).toBeTrue();
        expect(store.singleProp()).toBe('test');
        expect(singlePropNotified).toBeFalse();

        expect(modelDeletegateNotified).toBeTrue();
        expect(store.modelDelegate.numProp()).toBe(1);
        expect(modelDelegateNumPropNotified).toBeFalse();
        expect(modelDelegateObjPropNotified).toBeTrue();
        expect(store.modelDelegate.objProp.stringProp()).toBe('nested patched string');
        expect(modelDelegateObjPropStringPropNotified).toBeTrue();
        expect(store.modelDelegate.objProp.numProp()).toBe(20);
        expect(modelDelegateObjPropNumPropNotified).toBeTrue();
        expect(store.singlePropDelegate()).toBe('test');
        expect(singlePropDelegateNotified).toBeFalse();
    });

});
