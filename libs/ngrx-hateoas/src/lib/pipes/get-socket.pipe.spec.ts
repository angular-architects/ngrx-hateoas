import { TestBed } from '@angular/core/testing';
import { HateoasService } from '../services/hateoas.service';
import { GetSocketPipe } from './get-socket.pipe';

const testModel = {
  _sockets: {
      foo: { href: '/api/foo', event: 'newData' }
  }
}

describe('GetSocketPipe', () => {

  let getSocketPipe: GetSocketPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ GetSocketPipe, HateoasService ]});
    getSocketPipe = TestBed.inject(GetSocketPipe);
  });
    
  it('gets a socket from hypermedia json', () => {
    const transformResult = getSocketPipe.transform(testModel, 'foo');
    expect(transformResult?.href).toBe('/api/foo');
    expect(transformResult?.event).toBe('newData');
  });

  it('returns undefined for a non existing socket', () => {
    expect(getSocketPipe.transform(testModel, 'foo1')).toBeUndefined();
  });
  
});
