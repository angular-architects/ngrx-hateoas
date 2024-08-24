import { TestBed } from '@angular/core/testing';
import { HateoasConfig, HateoasService } from '../services/hateoas.service';
import { HasSocketPipe } from './has-socket.pipe';

const testModel = {
  _sockets: {
      foo: { href: '/api/foo', method: 'newData' }
  }
}

describe('HasSocketPipe', () => {

  let hasSocketPipe: HasSocketPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ HasSocketPipe, HateoasService, HateoasConfig ]});
    hasSocketPipe = TestBed.inject(HasSocketPipe);
  });
    
  it('returns true if a socket with the specified name exists', () => {
    const transformResult = hasSocketPipe.transform(testModel, 'foo');
    expect(transformResult).toBeTrue();
  });

  it('returns false if a socket with the specified name exists not', () => {
    const transformResult = hasSocketPipe.transform(testModel, 'foo1');
    expect(transformResult).toBeFalse();
  });
  
});
