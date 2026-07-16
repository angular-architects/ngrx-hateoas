import {
  Injector,
  isSignal,
  provideZonelessChangeDetection,
  runInInjectionContext,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { patchState, signalMethod, signalStore, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom, timer } from 'rxjs';
import { withDeepWritableStateProjection } from './with-deep-writable-state-projection';

type TestState = {
  person: {
    firstName: string;
    lastName: string;
    address: {
      city: string;
      zipCode: string;
    };
  };
  preferences: {
    theme: 'light' | 'dark';
    language: string;
  };
  counter: number;
  untouched: string;
};

const initialState: TestState = {
  person: {
    firstName: 'Ada',
    lastName: 'Lovelace',
    address: {
      city: 'London',
      zipCode: 'SW1A',
    },
  },
  preferences: {
    theme: 'light',
    language: 'en',
  },
  counter: 1,
  untouched: 'keep me',
};

const TestStore = signalStore(
  withState(initialState),
  withDeepWritableStateProjection(store => ({
    editor: {
      identity: {
        givenName: store.person.firstName,
        familyName: store.person.lastName,
      },
      location: {
        city: store.person.address.city,
      },
      appearance: {
        theme: store.preferences.theme,
      },
    },
    projectedCounter: store.counter,
    projectedAddress: store.person.address,
  })),
  withMethods(store => ({
    updateOriginalState(state: Partial<TestState>) {
      patchState(store, state);
    },
  })),
);

describe('withDeepWritableStateProjection', () => {
  let store: InstanceType<typeof TestStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), TestStore],
    });
    store = TestBed.inject(TestStore);
  });

  it('creates a deep writable signal for every projected structure node and leaf', () => {
    expect(isSignal(store.editor)).toBeTrue();
    expect(store.editor.set).toBeDefined();
    expect(store.editor.update).toBeDefined();
    expect(store.editor.asReadonly).toBeDefined();

    expect(isSignal(store.editor.identity)).toBeTrue();
    expect(store.editor.identity.set).toBeDefined();
    expect(store.editor.identity.update).toBeDefined();
    expect(isSignal(store.editor.identity.givenName)).toBeTrue();
    expect(store.editor.identity.givenName.set).toBeDefined();
    expect(store.editor.identity.givenName.update).toBeDefined();

    expect(isSignal(store.editor.location)).toBeTrue();
    expect(isSignal(store.editor.location.city)).toBeTrue();
    expect(isSignal(store.editor.appearance)).toBeTrue();
    expect(isSignal(store.editor.appearance.theme)).toBeTrue();

    expect(isSignal(store.projectedCounter)).toBeTrue();
    expect(store.projectedCounter.set).toBeDefined();
    expect(store.projectedCounter.update).toBeDefined();
    expect(isSignal(store.projectedAddress)).toBeTrue();
    expect(isSignal(store.projectedAddress.city)).toBeTrue();
    expect(store.projectedAddress.city.set).toBeDefined();
  });

  it('reads a composed value from different parts of the state', () => {
    expect(store.editor()).toEqual({
      identity: {
        givenName: 'Ada',
        familyName: 'Lovelace',
      },
      location: {
        city: 'London',
      },
      appearance: {
        theme: 'light',
      },
    });

    expect(store.editor.identity()).toEqual({
      givenName: 'Ada',
      familyName: 'Lovelace',
    });
    expect(store.editor.identity.givenName()).toBe('Ada');
    expect(store.editor.location.city()).toBe('London');
    expect(store.editor.appearance.theme()).toBe('light');
    expect(store.projectedCounter()).toBe(1);
    expect(store.projectedAddress()).toEqual({ city: 'London', zipCode: 'SW1A' });
  });

  it('sets a whole projection across multiple state roots and preserves unprojected state', () => {
    store.editor.set({
      identity: {
        givenName: 'Grace',
        familyName: 'Hopper',
      },
      location: {
        city: 'New York',
      },
      appearance: {
        theme: 'dark',
      },
    });

    expect(store.person()).toEqual({
      firstName: 'Grace',
      lastName: 'Hopper',
      address: {
        city: 'New York',
        zipCode: 'SW1A',
      },
    });
    expect(store.preferences()).toEqual({
      theme: 'dark',
      language: 'en',
    });
    expect(store.counter()).toBe(1);
    expect(store.untouched()).toBe('keep me');
    expect(store.editor()).toEqual({
      identity: {
        givenName: 'Grace',
        familyName: 'Hopper',
      },
      location: {
        city: 'New York',
      },
      appearance: {
        theme: 'dark',
      },
    });
  });

  it('sets a projected structure node without changing its siblings', () => {
    store.editor.identity.set({
      givenName: 'Katherine',
      familyName: 'Johnson',
    });

    expect(store.person.firstName()).toBe('Katherine');
    expect(store.person.lastName()).toBe('Johnson');
    expect(store.person.address()).toEqual({ city: 'London', zipCode: 'SW1A' });
    expect(store.preferences.theme()).toBe('light');
    expect(store.editor.location.city()).toBe('London');
  });

  it('sets individual projected leaves in deeply nested and top-level projections', () => {
    store.editor.location.city.set('Paris');
    store.editor.appearance.theme.set('dark');
    store.projectedCounter.set(10);

    expect(store.person.address.city()).toBe('Paris');
    expect(store.person.address.zipCode()).toBe('SW1A');
    expect(store.preferences.theme()).toBe('dark');
    expect(store.preferences.language()).toBe('en');
    expect(store.counter()).toBe(10);
  });

  it('deeply sets and updates a directly selected object signal', () => {
    store.projectedAddress.set({
      city: 'Berlin',
      zipCode: '10115',
    });
    store.projectedAddress.city.update(city => city.toUpperCase());

    expect(store.projectedAddress()).toEqual({
      city: 'BERLIN',
      zipCode: '10115',
    });
    expect(store.person.address()).toEqual({
      city: 'BERLIN',
      zipCode: '10115',
    });
    expect(store.person.firstName()).toBe('Ada');
    expect(store.person.lastName()).toBe('Lovelace');
  });

  it('updates structure nodes and leaves using their current projected value', () => {
    store.editor.identity.update(identity => ({
      givenName: identity.givenName.toUpperCase(),
      familyName: identity.familyName.toUpperCase(),
    }));
    store.projectedCounter.update(counter => counter + 4);

    expect(store.editor.identity()).toEqual({
      givenName: 'ADA',
      familyName: 'LOVELACE',
    });
    expect(store.person.firstName()).toBe('ADA');
    expect(store.person.lastName()).toBe('LOVELACE');
    expect(store.counter()).toBe(5);
  });

  it('reacts to changes made directly to the original state', () => {
    store.updateOriginalState({
      person: {
        firstName: 'Dorothy',
        lastName: 'Vaughan',
        address: {
          city: 'Hampton',
          zipCode: '23666',
        },
      },
      preferences: {
        theme: 'dark',
        language: 'en',
      },
      counter: 7,
    });

    expect(store.editor()).toEqual({
      identity: {
        givenName: 'Dorothy',
        familyName: 'Vaughan',
      },
      location: {
        city: 'Hampton',
      },
      appearance: {
        theme: 'dark',
      },
    });
    expect(store.projectedCounter()).toBe(7);
  });

  it('keeps fine-grained reactivity when one projected leaf changes', async () => {
    const injector = TestBed.inject(Injector);
    let editorNotifications = 0;
    let identityNotifications = 0;
    let givenNameNotifications = 0;
    let familyNameNotifications = 0;
    let locationNotifications = 0;

    runInInjectionContext(injector, () => {
      signalMethod(() => editorNotifications++)(store.editor);
      signalMethod(() => identityNotifications++)(store.editor.identity);
      signalMethod(() => givenNameNotifications++)(store.editor.identity.givenName);
      signalMethod(() => familyNameNotifications++)(store.editor.identity.familyName);
      signalMethod(() => locationNotifications++)(store.editor.location);
    });

    await firstValueFrom(timer(0));
    editorNotifications = 0;
    identityNotifications = 0;
    givenNameNotifications = 0;
    familyNameNotifications = 0;
    locationNotifications = 0;

    store.editor.identity.givenName.set('Augusta');
    await firstValueFrom(timer(0));

    expect(editorNotifications).toBe(1);
    expect(identityNotifications).toBe(1);
    expect(givenNameNotifications).toBe(1);
    expect(familyNameNotifications).toBe(0);
    expect(locationNotifications).toBe(0);
  });

  it('exposes a readonly view without writable operations', () => {
    const readonlyEditor = store.editor.asReadonly();

    expect(isSignal(readonlyEditor)).toBeTrue();
    expect(readonlyEditor()).toEqual(store.editor());
    expect((readonlyEditor as unknown as { set?: unknown }).set).toBeUndefined();
    expect((readonlyEditor as unknown as { update?: unknown }).update).toBeUndefined();
  });
});
