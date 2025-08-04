import { HasActionPipe } from './has-action.pipe';
import { TestBed } from '@angular/core/testing';
import { HateoasService } from '../services/hateoas.service';
import { provideZonelessChangeDetection } from '@angular/core';

const testModel = {
  _actions: {
      create: { href: '/api/test', method: 'POST' }
  }
}

describe('HasActionPipe', () => {

  let hasActionPipe: HasActionPipe

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [HasActionPipe, HateoasService, provideZonelessChangeDetection()]});
    hasActionPipe = TestBed.inject(HasActionPipe);
  });
    
  it('returns true if an action with the specified name exists', () => {
    const transformResult = hasActionPipe.transform(testModel, 'create');
    expect(transformResult).toBeTrue();
  });

  it('returns false if an action with the specified name exists not', () => {
    const transformResult = hasActionPipe.transform(testModel, 'create1');
    expect(transformResult).toBeFalse();
  });

});
