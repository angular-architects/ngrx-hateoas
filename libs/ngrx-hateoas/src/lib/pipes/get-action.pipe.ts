import { Pipe, PipeTransform, inject } from '@angular/core';
import { HateoasService } from '../services/hateoas.service';
import { ResourceAction } from '../models';

@Pipe({
  name: 'getAction',
  standalone: true
})
export class GetActionPipe implements PipeTransform {

  private hateoasService = inject(HateoasService);

  transform(resource: unknown, actionName: string): ResourceAction | undefined {
    return this.hateoasService.getAction(resource, actionName);
  }

}
