import { TestBed } from '@angular/core/testing';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { provideZonelessChangeDetection } from '@angular/core';
import { withWritableStateCopy } from './with-writable-state-copy';

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
    withState({ model: initialTestModel }),
    withWritableStateCopy(store => ({
        writableModel: store.model,
        writableObjProp: store.model.objProp,
        subobjectWithWritableStateCopies: {
            writableNumProp: store.model.objProp.numProp
        }
    })),
    withMethods(store => ({
        setModel(model: TestModel) {
            patchState(store, { model });
        }
    }))
);

describe('withWritableStateCopy', () => {

    let store: InstanceType<typeof TestStore>;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
        store = TestBed.inject(TestStore);
    });

    it('sets correct initial state copy and initializes writable signals', () => {
        expect(store.writableModel()).toEqual(initialTestModel);
        expect(store.writableModel.objProp()).toEqual(initialTestModel.objProp);
        expect(store.writableModel.objProp.stringProp()).toEqual(initialTestModel.objProp.stringProp);
        expect(store.writableModel.objProp.numProp()).toEqual(initialTestModel.objProp.numProp);    
        expect(store.writableModel.set).toBeDefined();
        expect(store.writableModel.update).toBeDefined();
        expect(store.writableObjProp()).toEqual(initialTestModel.objProp);
        expect(store.writableObjProp.set).toBeDefined();
        expect(store.writableObjProp.update).toBeDefined();
        expect(store.subobjectWithWritableStateCopies.writableNumProp()).toEqual(initialTestModel.objProp.numProp);
        expect(store.subobjectWithWritableStateCopies.writableNumProp.set).toBeDefined();
        expect(store.subobjectWithWritableStateCopies.writableNumProp.update).toBeDefined();
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

});
