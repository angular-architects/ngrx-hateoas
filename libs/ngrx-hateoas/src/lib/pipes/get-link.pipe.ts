import { Pipe, PipeTransform, inject } from "@angular/core";
import { HateoasService } from "../services/hateoas.service";
import { ResourceLink } from "../models";

@Pipe({
    name: 'getLink',
    standalone: true
})
export class GetLinkPipe implements PipeTransform {

    private hateoasService = inject(HateoasService);

    transform(resource: unknown, linkName: string): ResourceLink | undefined {
        return this.hateoasService.getLink(resource, linkName);
    }

}
