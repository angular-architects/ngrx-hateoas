import { TestBed } from '@angular/core/testing';
import { HateoasConfig, HateoasService } from '../services/hateoas.service';
import { GetSocketPipe } from './get-socket.pipe';

const testModel = {
  _sockets: {
      foo: { href: '/api/foo', method: 'newData' }
  }
}

describe('GetSocketPipe', () => {

  let getSocketPipe: GetSocketPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ GetSocketPipe, HateoasService, HateoasConfig ]});
    getSocketPipe = TestBed.inject(GetSocketPipe);
  });
    
  it('gets a socket from hypermedia json', () => {
    const transformResult = getSocketPipe.transform(testModel, 'foo');
    expect(transformResult.href).toBe('/api/foo');
    expect(transformResult.method).toBe('newData');
  });

  it('throws an exception for a non existing socket', () => {
    expect(() => getSocketPipe.transform(testModel, 'foo1')).toThrowError('The requested socket does not exist on the specified resource. Use the "hasSocket" pipe to check the existance of the link first');
  });
  
});
