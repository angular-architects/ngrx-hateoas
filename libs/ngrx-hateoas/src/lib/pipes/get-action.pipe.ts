import { Pipe, PipeTransform, inject } from '@angular/core';
import { HateoasService } from '../services/hateoas.service';
import { ResourceAction } from '../models';

@Pipe({
  name: 'getAction',
  standalone: true
})
export class GetActionPipe implements PipeTransform {

  private hateoasService = inject(HateoasService);

  transform(resource: any, actionName: string): ResourceAction {
    const action = this.hateoasService.getAction(resource, actionName);

    if (action === undefined) {
      throw new Error('The requested action does not exist on the specified resource. Use the "hasAction" pipe to check the existance of the link first');
    }

    return action;
  }

}
