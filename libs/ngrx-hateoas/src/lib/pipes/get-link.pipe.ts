import { Pipe, PipeTransform, inject } from "@angular/core";
import { HateoasService } from "../services/hateoas.service";
import { ResourceLink } from "../models";

@Pipe({
    name: 'getLink',
    standalone: true
})
export class GetLinkPipe implements PipeTransform {

    private hateoasService = inject(HateoasService);

    transform(resource: unknown, linkName: string): ResourceLink {
        const link = this.hateoasService.getLink(resource, linkName);

        if (link === undefined) {
            throw new Error('The requested link does not exist on the specified resource. Use the "hasLink" pipe to check the existance of the link first');
        }

        return link;
    }

}
