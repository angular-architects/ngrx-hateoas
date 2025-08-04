import { TestBed } from '@angular/core/testing';
import { GetActionPipe } from './get-action.pipe';
import { HateoasService } from '../services/hateoas.service';
import { provideZonelessChangeDetection } from '@angular/core';

const testModel = {
  _actions: {
      create: { href: '/api/test', method: 'POST' }
  }
}

describe('GetActionPipe', () => {

  let getActionPipe: GetActionPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [GetActionPipe, HateoasService, provideZonelessChangeDetection()]});
    getActionPipe = TestBed.inject(GetActionPipe);
  });
    
  it('gets an action from hypermedia json', () => {
    const transformResult = getActionPipe.transform(testModel, 'create');
    expect(transformResult?.href).toBe('/api/test');
    expect(transformResult?.method).toBe('POST');
  });

  it('returns undefined for a non existing action', () => {
    expect(getActionPipe.transform(testModel, 'create1')).toBeUndefined();
  });

});
