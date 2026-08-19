import { Injector, runInInjectionContext, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { whenTrue } from "./when-true";

describe('whenTrue', () => {

    beforeEach(() => {
        TestBed.configureTestingModule({});
    });

  it('resolves promise to true when signal sends true', async () => {
    await runInInjectionContext(TestBed.inject(Injector), async () => {
        const triggerSignal = signal(false);

        setTimeout(() => { triggerSignal.set(true); }, 10);

        const result = await whenTrue(triggerSignal);

        expect(result).toBeTrue();
    });
  });  

});
