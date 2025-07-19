import { TestBed } from "@angular/core/testing";
import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { toDeepPatchableSignal } from "./deep-patchable-signal";
import { provideZonelessChangeDetection, signal } from "@angular/core";

type TestModel = {
    numProp: number,
    objProp: {
        stringProp: string
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
    withState({ model: initialTestModel }),
    withMethods(store => {
        const patchableTestModel = toDeepPatchableSignal<TestModel>(newVal => patchState(store, { model: newVal } ), store.model);
        return {
            getModelAsPatchable() { return patchableTestModel; }
        }
    })
);

describe('deepPatchableSignal', () => {

    it('patches a signal via signal store patchState on the right position', () => {

        TestBed.configureTestingModule({providers: [provideZonelessChangeDetection()]});
        const store = TestBed.inject(TestStore);

        const patchableSignal = store.getModelAsPatchable();

        expect(store.model.objProp.stringProp()).toBe('initial string');
        expect(store.model()).toBe(initialTestModel);

        patchableSignal.objProp.patch({ stringProp: 'patched' });

        expect(store.model.objProp.stringProp()).toBe('patched');
        expect(store.model()).not.toBe(initialTestModel);
    });

    it('patches a signal via raw signal on the right position', () => {

        const targetSignal = signal(initialTestModel);
        const patchableSignal = toDeepPatchableSignal<TestModel>(newValue => targetSignal.set(newValue), targetSignal);

        expect(targetSignal().objProp.stringProp).toBe('initial string');
        expect(targetSignal()).toBe(initialTestModel);

        patchableSignal.objProp.patch({ stringProp: 'patched' });
        
        expect(targetSignal().objProp.stringProp).toBe('patched');
        expect(targetSignal()).not.toBe(initialTestModel);
    });

});
