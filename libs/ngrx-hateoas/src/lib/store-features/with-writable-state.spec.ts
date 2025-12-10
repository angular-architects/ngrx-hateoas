import { TestBed } from '@angular/core/testing';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { HypermediaResourceData } from './with-hypermedia-resource';
import { provideZonelessChangeDetection } from '@angular/core';
import { withWritableState } from './with-writable-state';

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

const testModelWithMetadata: TestModel = {
    numProp: 1,
    objProp: {
        stringProp: 'test model string',
        _metaProp: 'Metadata'
    } as { stringProp: string, _metaProp: string }
};

const TestStore = signalStore(
    { providedIn: 'root' },
    withState<HypermediaResourceData<'model', TestModel>>({ model: initialTestModel }),
    withWritableState(store => ({
        writableObjProp: store.model.objProp
    })),
    withMethods(store => ({
        setModel(model: TestModel) {
            patchState(store, { model });
        }
    }))
);

describe('withWritableState', () => {

    let store: InstanceType<typeof TestStore>;

    beforeEach(() => {
        TestBed.configureTestingModule({providers: [provideZonelessChangeDetection()]});
        store = TestBed.inject(TestStore);
    });

    it('sets correct initial resource state', () => {
        expect(store.model()).toBe(initialTestModel);
    });

    it('patches a signal inside the writable state', () => {
        const writableSignal = store.writableObjProp;

        expect(store.model.objProp.stringProp()).toBe('initial string');
        expect(store.writableObjProp()).toBe(initialTestModel.objProp);

        writableSignal.set({ stringProp: 'mutated string' });

        expect(store.model.objProp.stringProp()).toBe(initialTestModel.objProp.stringProp);
        expect(store.writableObjProp()).toEqual({ stringProp: 'mutated string' });
    });

    it('provides data which is not in type definition', () => {
        expect(store.model.objProp.stringProp()).toBe('initial string');
        expect(store.writableObjProp()).toBe(initialTestModel.objProp);

        store.setModel(testModelWithMetadata);

        expect(store.model.objProp.stringProp()).toBe('test model string');
        expect((store.model.objProp() as any)._metaProp).toBe('Metadata');
        expect(store.writableObjProp().stringProp).toBe('test model string');
        expect((store.writableObjProp() as any)._metaProp).toBe('Metadata');
    });

    it('overrides state of writable copy', () => {
        expect(store.model.objProp.stringProp()).toBe('initial string');
        expect(store.writableObjProp()).toBe(initialTestModel.objProp);

        store.writableObjProp.set({ stringProp: 'overridden string' });

        expect(store.model.objProp.stringProp()).toBe('initial string');
        expect(store.writableObjProp().stringProp).toBe('overridden string');

        store.setModel(testModelWithMetadata);

        expect(store.model.objProp.stringProp()).toBe('test model string');
        expect(store.writableObjProp().stringProp).toBe('test model string');
    });

});
