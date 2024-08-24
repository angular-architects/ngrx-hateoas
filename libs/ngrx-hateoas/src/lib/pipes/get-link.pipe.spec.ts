import { TestBed } from '@angular/core/testing';
import { HateoasConfig, HateoasService } from '../services/hateoas.service';
import { GetLinkPipe } from './get-link.pipe';

const testModel = {
  _links: {
      foo: { href: '/api/foo' }
  }
}

describe('getLink', () => {

  let getLinkPipe: GetLinkPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ GetLinkPipe, HateoasService, HateoasConfig ]});
    getLinkPipe = TestBed.inject(GetLinkPipe);
  });
    
  it('gets a link from hypermedia json', () => {
    const transformResult = getLinkPipe.transform(testModel, 'foo');
    expect(transformResult.href).toBe('/api/foo');
  });

  it('throws an exception for a non existing link', () => {
    expect(() => getLinkPipe.transform(testModel, 'foo1')).toThrowError('The requested link does not exist on the specified resource. Use the "hasLink" pipe to check the existance of the link first');
  });
  
});
