import { Pipe, PipeTransform, inject } from "@angular/core";
import { HateoasService } from "../services/hateoas.service";

@Pipe({
    name: 'hasLink',
    standalone: true
})
export class HasLinkPipe implements PipeTransform {

    private hateoasService = inject(HateoasService);

    transform(resource: any, linkName: string): boolean {
        return this.hateoasService.getLink(resource, linkName ) !== undefined;
    }
    
}