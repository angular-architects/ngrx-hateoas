import { Pipe, PipeTransform, inject } from '@angular/core';
import { HateoasService } from '../services/hateoas.service';

@Pipe({
  name: 'hasAction',
  standalone: true
})
export class HasActionPipe implements PipeTransform {

  private hateoasService = inject(HateoasService);

  transform(resource: any, actionName: string): boolean {
    return this.hateoasService.getAction(resource, actionName) !== undefined;
  }

}
