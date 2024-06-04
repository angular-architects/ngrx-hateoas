import { Pipe, PipeTransform, inject } from '@angular/core';
import { HateoasService } from '../services/hateoas.service';
import { ResourceSocket } from '../models';

@Pipe({
  name: 'getSocket',
  standalone: true
})
export class GetSocketPipe implements PipeTransform {

  private hateoasService = inject(HateoasService);

  transform(resource: any, socketName: string): ResourceSocket {
    const socket = this.hateoasService.getSocket(resource, socketName);

    if (socket === undefined) {
      throw new Error('The requested socket does not exist on the specified resource. Use the "hasSocket" pipe to check the existance of the link first');
    }

    return socket;
  }

}
