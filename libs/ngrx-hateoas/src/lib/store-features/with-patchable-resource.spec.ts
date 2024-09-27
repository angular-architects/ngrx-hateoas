import { TestBed } from '@angular/core/testing';
import { signalStore, withState } from '@ngrx/signals';
import { HypermediaResourceData } from './with-hypermedia-resource';
import { withPatchableResource } from './with-patchable-resource';


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
    withState<HypermediaResourceData<'model', TestModel>>({ model: initialTestModel }),
    withPatchableResource('model', initialTestModel)
);

describe('withPatchableResource', () => {

    let store: InstanceType<typeof TestStore>;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        store = TestBed.inject(TestStore);
    });

    it('sets correct initial resource state', () => {
        expect(store.model()).toBe(initialTestModel);
    });

    it('patches a signal inside the signal store', () => {
        const patchableSignal = store.getModelAsPatchable();

        expect(store.model.objProp.stringProp()).toBe('initial string');
        expect(store.model()).toBe(initialTestModel);

        patchableSignal.objProp.patch({ stringProp: 'patched' });

        expect(store.model.objProp.stringProp()).toBe('patched');
        expect(store.model()).not.toBe(initialTestModel);
    });

});
