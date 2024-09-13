import { Pipe, PipeTransform, inject } from '@angular/core';
import { HateoasService } from '../services/hateoas.service';
import { ResourceSocket } from '../models';

@Pipe({
  name: 'getSocket',
  standalone: true
})
export class GetSocketPipe implements PipeTransform {

  private hateoasService = inject(HateoasService);

  transform(resource: unknown, socketName: string): ResourceSocket | undefined {
    return this.hateoasService.getSocket(resource, socketName);
  }

}
