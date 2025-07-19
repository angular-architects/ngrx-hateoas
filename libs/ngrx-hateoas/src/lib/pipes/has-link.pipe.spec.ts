import { TestBed } from '@angular/core/testing';
import { HateoasService } from '../services/hateoas.service';
import { HasLinkPipe } from './has-link.pipe';
import { provideZonelessChangeDetection } from '@angular/core';

const testModel = {
  _links: {
      foo: { href: '/api/foo' }
  }
}

describe('HasLinkPipe', () => {

  let hasLinkPipe: HasLinkPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [HasLinkPipe, HateoasService, provideZonelessChangeDetection()]});
    hasLinkPipe = TestBed.inject(HasLinkPipe);
  });
    
  it('returns true if a link with the specified name exists', () => {
    const transformResult = hasLinkPipe.transform(testModel, 'foo');
    expect(transformResult).toBeTrue();
  });

  it('returns false if a link with the specified name exists not', () => {
    const transformResult = hasLinkPipe.transform(testModel, 'foo1');
    expect(transformResult).toBeFalse();
  });
  
});
