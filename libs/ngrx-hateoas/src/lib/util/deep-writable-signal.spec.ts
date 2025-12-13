import { TestBed } from "@angular/core/testing";
import { deepComputed, signalMethod } from "@ngrx/signals";
import { computed, Injector, isSignal, provideZonelessChangeDetection, runInInjectionContext, signal } from "@angular/core";
import { DeepWritableSignal, deepWritableSignal, toDeepWritableSignal } from "./deep-writeable-signal";
import { firstValueFrom, timer } from "rxjs";

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

describe('deepWritableSignal', () => {

    let target: DeepWritableSignal<TestModel>;

    let modelNotified = false;
    let modelNumPropNotified = false;
    let modelObjPropNotified = false;
    let modelObjPropStringPropNotified = false;

    function resetNotifications() {
        modelNotified = false;
        modelNumPropNotified = false;
        modelObjPropNotified = false;
        modelObjPropStringPropNotified = false;
    }

    function wireUpNotifications(injector: Injector) {
        runInInjectionContext(injector, () => {
            signalMethod(() => modelNotified = true)(target);
            signalMethod(() => modelNumPropNotified = true)(target.numProp);
            signalMethod(() => modelObjPropNotified = true)(target.objProp);
            signalMethod(() => modelObjPropStringPropNotified = true)(target.objProp.stringProp);
        });
    }

    describe('from initial value', () => {

        beforeEach(async () => {
            TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
            const injector = TestBed.inject(Injector);
            target = deepWritableSignal(initialTestModel);
            wireUpNotifications(injector);
            await firstValueFrom(timer(0));
            resetNotifications();
        });

        it('creates deep writable signal', () => {
            expect(isSignal(target)).toBeTrue();
            expect(target.set).toBeDefined();

            expect(isSignal(target.numProp)).toBeTrue();
            expect(target.numProp.set).toBeDefined();

            expect(isSignal(target.objProp)).toBeTrue();
            expect(target.objProp.set).toBeDefined();

            expect(isSignal(target.objProp.stringProp)).toBeTrue();
            expect(target.objProp.stringProp.set).toBeDefined();
        });

        it('sets values and notifies on set of root signal', async () => {
            target.set({
                numProp: 5,
                objProp: {
                    stringProp: 'new string'
                }
            });

            await firstValueFrom(timer(0));

            expect(target()).toEqual({
                numProp: 5,
                objProp: {
                    stringProp: 'new string'
                }
            });
            expect(modelNotified).toBeTrue();
            expect(target.numProp()).toBe(5);
            expect(modelNumPropNotified).toBeTrue();
            expect(target.objProp()).toEqual({ stringProp: 'new string' });
            expect(modelObjPropNotified).toBeTrue();
            expect(target.objProp.stringProp()).toBe('new string');
            expect(modelObjPropStringPropNotified).toBeTrue();
        });

        it('sets values and notifies on set of nested object signal', async () => {
            target.objProp.set({
                stringProp: 'updated string'
            });

            await firstValueFrom(timer(0));

            expect(target()).toEqual({
                numProp: 1,
                objProp: {
                    stringProp: 'updated string'
                }
            });
            expect(modelNotified).toBeTrue();
            expect(target.numProp()).toBe(1);
            expect(modelNumPropNotified).toBeFalse();
            expect(target.objProp()).toEqual({ stringProp: 'updated string' });
            expect(modelObjPropNotified).toBeTrue();
            expect(target.objProp.stringProp()).toBe('updated string');
            expect(modelObjPropStringPropNotified).toBeTrue();
        });

        it('sets values and notifies on set of nested primitive signal', async () => {
            target.objProp.stringProp.set('primitive updated string');

            await firstValueFrom(timer(0));

            expect(target()).toEqual({
                numProp: 1,
                objProp: {
                    stringProp: 'primitive updated string'
                }
            });
            expect(modelNotified).toBeTrue();
            expect(target.numProp()).toBe(1);
            expect(modelNumPropNotified).toBeFalse();
            expect(target.objProp()).toEqual({ stringProp: 'primitive updated string' });
            expect(modelObjPropNotified).toBeTrue();
            expect(target.objProp.stringProp()).toBe('primitive updated string');
            expect(modelObjPropStringPropNotified).toBeTrue();
        });
    });

    describe('from existing signal', () => {

        beforeEach(async() => {
            TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
            const injector = TestBed.inject(Injector);
            const existingSignal = signal(initialTestModel);
            target = toDeepWritableSignal(newVal => existingSignal.set(newVal), existingSignal);
            wireUpNotifications(injector);
            await firstValueFrom(timer(0));
            resetNotifications();
        });

        it('creates deep writable signal', () => {
            expect(isSignal(target)).toBeTrue();
            expect(target.set).toBeDefined();
            expect(isSignal(target.objProp)).toBeTrue();
            expect(target.objProp.set).toBeDefined();
            expect(isSignal(target.objProp.stringProp)).toBeTrue();
            expect(target.objProp.stringProp.set).toBeDefined();
        });

        it('sets values and notifies on set of root signal', async () => {
            target.set({
                numProp: 5,
                objProp: {
                    stringProp: 'new string'
                }
            });

            await firstValueFrom(timer(0));

            expect(target()).toEqual({
                numProp: 5,
                objProp: {
                    stringProp: 'new string'
                }
            });
            expect(modelNotified).toBeTrue();
            expect(target.numProp()).toBe(5);
            expect(modelNumPropNotified).toBeTrue();
            expect(target.objProp()).toEqual({ stringProp: 'new string' });
            expect(modelObjPropNotified).toBeTrue();
            expect(target.objProp.stringProp()).toBe('new string');
            expect(modelObjPropStringPropNotified).toBeTrue();
        });

        it('sets values and notifies on set of nested object signal', async () => {
            target.objProp.set({
                stringProp: 'updated string'
            });

            await firstValueFrom(timer(0));

            expect(target()).toEqual({
                numProp: 1,
                objProp: {
                    stringProp: 'updated string'
                }
            });
            expect(modelNotified).toBeTrue();
            expect(target.numProp()).toBe(1);
            expect(modelNumPropNotified).toBeFalse();
            expect(target.objProp()).toEqual({ stringProp: 'updated string' });
            expect(modelObjPropNotified).toBeTrue();
            expect(target.objProp.stringProp()).toBe('updated string');
            expect(modelObjPropStringPropNotified).toBeTrue();
        });

        it('sets values and notifies on set of nested primitive signal', async () => {
            target.objProp.stringProp.set('primitive updated string');

            await firstValueFrom(timer(0));

            expect(target()).toEqual({
                numProp: 1,
                objProp: {
                    stringProp: 'primitive updated string'
                }
            });
            expect(modelNotified).toBeTrue();
            expect(target.numProp()).toBe(1);
            expect(modelNumPropNotified).toBeFalse();
            expect(target.objProp()).toEqual({ stringProp: 'primitive updated string' });
            expect(modelObjPropNotified).toBeTrue();
            expect(target.objProp.stringProp()).toBe('primitive updated string');
            expect(modelObjPropStringPropNotified).toBeTrue();
        });

    });

    describe('from existing deep signal', () => {

        beforeEach(() => {
            TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
            const injector = TestBed.inject(Injector);
            const existingSignal = signal(initialTestModel);
            const existingDeepSignal = deepComputed(() => existingSignal());
            target = toDeepWritableSignal(newVal => existingSignal.set(newVal), computed(() => existingDeepSignal()));
            wireUpNotifications(injector);
        });

        it('creates deep writable signal', () => {
            expect(isSignal(target)).toBeTrue();
            expect(target.set).toBeDefined();
            expect(isSignal(target.objProp)).toBeTrue();
            expect(target.objProp.set).toBeDefined();
            expect(isSignal(target.objProp.stringProp)).toBeTrue();
            expect(target.objProp.stringProp.set).toBeDefined();
        });

    });
});
