import { TestBed } from '@angular/core/testing';
import { patchState, signalMethod, signalStore, withMethods, withState } from '@ngrx/signals';
import { HypermediaResourceData } from './with-hypermedia-resource';
import { Injector, provideZonelessChangeDetection, runInInjectionContext } from '@angular/core';
import { firstValueFrom, timer } from 'rxjs';
import { withExperimentalDeepWritableStateCopy } from './with-deep-writable-state-copy';

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

const testModelWithMetadata: TestModel = {
    numProp: 1,
    objProp: {
        stringProp: 'test model string',
        numProp: 50,
        _metaProp: 'Metadata'
    } as { stringProp: string, numProp: number, _metaProp: string }
};

const TestStore = signalStore(
    { providedIn: 'root' },
    withState<HypermediaResourceData<'model', TestModel>>({ model: initialTestModel }),
    withExperimentalDeepWritableStateCopy(store => ({
        writableObjProp: store.model.objProp,
        subObjectWithDeepStateCopies: {
            writableNumProp: store.model.objProp.numProp
        }
    })),
    withMethods(store => ({
        setModel(model: TestModel) {
            patchState(store, { model });
        }
    }))
);

describe('withExperimentalDeepWritableStateCopy', () => {

    let store: InstanceType<typeof TestStore>;
    let injector: Injector;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
        store = TestBed.inject(TestStore);
        injector = TestBed.inject(Injector);
    });

    it('sets correct initial copy state', () => {
        expect(store.writableObjProp()).toBe(initialTestModel.objProp);
        expect(store.subObjectWithDeepStateCopies.writableNumProp()).toBe(initialTestModel.objProp.numProp);
    });

    it('patches a signal inside the writable state', () => {
        const writableSignal = store.writableObjProp;

        expect(store.model.objProp.stringProp()).toBe('initial string');
        expect(store.writableObjProp()).toBe(initialTestModel.objProp);

        writableSignal.set({ stringProp: 'mutated string', numProp: 42 });

        expect(store.model.objProp.stringProp()).toBe(initialTestModel.objProp.stringProp);
        expect(store.writableObjProp()).toEqual({ stringProp: 'mutated string', numProp: 42 });
    });

    it('provides data which is not in type definition', () => {
        expect(store.model.objProp.stringProp()).toBe('initial string');
        expect(store.writableObjProp()).toBe(initialTestModel.objProp);

        store.setModel(testModelWithMetadata);

        expect(store.model.objProp.stringProp()).toBe('test model string');
        expect((store.model.objProp() as Record<string, unknown>)['_metaProp']).toBe('Metadata');
        expect(store.writableObjProp().stringProp).toBe('test model string');
        expect((store.writableObjProp() as Record<string, unknown>)['_metaProp']).toBe('Metadata');
    });

    it('overrides state of writable copy', () => {
        expect(store.model.objProp.stringProp()).toBe('initial string');
        expect(store.writableObjProp()).toBe(initialTestModel.objProp);

        store.writableObjProp.set({ stringProp: 'overridden string', numProp: 42 });

        expect(store.model.objProp.stringProp()).toBe('initial string');
        expect(store.writableObjProp().stringProp).toBe('overridden string');

        store.setModel(testModelWithMetadata);

        expect(store.model.objProp.stringProp()).toBe('test model string');
        expect(store.writableObjProp().stringProp).toBe('test model string');
    });

    it('triggers deep computed signals on writable state copy', async () => {

        let stringPropTriggered = false;
        let numPropTriggered = false;

        runInInjectionContext(injector, () => {
            signalMethod(() => stringPropTriggered = true)(store.writableObjProp.stringProp);
            signalMethod(() => numPropTriggered = true)(store.writableObjProp.numProp);
        });

        await firstValueFrom(timer(0));
        stringPropTriggered = false;
        numPropTriggered = false;

        store.writableObjProp.set({ stringProp: 'overridden string', numProp: 42 });

        await firstValueFrom(timer(10));

        expect(stringPropTriggered).toBe(true);
        expect(numPropTriggered).toBe(false);

        stringPropTriggered = false;
        numPropTriggered = false;

        store.writableObjProp.set({ stringProp: 'next overridden string', numProp: 100 });

        await firstValueFrom(timer(0));

        expect(stringPropTriggered).toBe(true);
        expect(numPropTriggered).toBe(true);
    });

});
