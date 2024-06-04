import { Pipe, PipeTransform, inject } from '@angular/core';
import { HateoasService } from '../services/hateoas.service';

@Pipe({
  name: 'hasSocket',
  standalone: true
})
export class HasSocketPipe implements PipeTransform {

  private hateoasService = inject(HateoasService);

  transform(resource: any, socketName: string): boolean {
    return this.hateoasService.getSocket(resource, socketName) !== undefined;
  }

}
