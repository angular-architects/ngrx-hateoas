import { TestBed } from '@angular/core/testing';
import { HateoasService } from '../services/hateoas.service';
import { GetLinkPipe } from './get-link.pipe';

const testModel = {
  _links: {
      foo: { href: '/api/foo' }
  }
}

describe('GetLinkPipe', () => {

  let getLinkPipe: GetLinkPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ GetLinkPipe, HateoasService ]});
    getLinkPipe = TestBed.inject(GetLinkPipe);
  });
    
  it('gets a link from hypermedia json', () => {
    const transformResult = getLinkPipe.transform(testModel, 'foo');
    expect(transformResult?.href).toBe('/api/foo');
  });

  it('returns undefined for a non existing link', () => {
    expect(getLinkPipe.transform(testModel, 'foo1')).toBeUndefined();
  });
  
});
