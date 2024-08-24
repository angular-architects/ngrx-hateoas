import { TestBed } from '@angular/core/testing';
import { GetActionPipe } from './get-action.pipe';
import { HateoasConfig, HateoasService } from '../services/hateoas.service';

const testModel = {
  _actions: {
      create: { href: '/api/test', method: 'POST' }
  }
}

describe('GetActionPipe', () => {

  let getActionPipe: GetActionPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ GetActionPipe, HateoasService, HateoasConfig ]});
    getActionPipe = TestBed.inject(GetActionPipe);
  });
    
  it('gets an action from hypermedia json', () => {
    const transformResult = getActionPipe.transform(testModel, 'create');
    expect(transformResult.href).toBe('/api/test');
    expect(transformResult.method).toBe('POST');
  });

  it('throws an exception for a non existing action', () => {
    expect(() => getActionPipe.transform(testModel, 'create1')).toThrowError('The requested action does not exist on the specified resource. Use the "hasAction" pipe to check the existance of the link first');
  });

});
