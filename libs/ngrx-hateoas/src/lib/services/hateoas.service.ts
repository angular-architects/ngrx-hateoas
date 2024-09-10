import { Injectable, inject } from "@angular/core";
import { ResourceAction, ResourceLink, ResourceSocket } from "../models";
import { HATEOAS_METADATA_PROVIDER } from "../provide";

@Injectable()
export class HateoasService {
    private hateoasConfig = inject(HATEOAS_METADATA_PROVIDER);

    getLink(resource: unknown, linkName: string): ResourceLink | undefined {
        return this.hateoasConfig.linkLookup(resource, linkName);
    }

    getAction(resource: unknown, actionName: string): ResourceAction | undefined {
        return this.hateoasConfig.actionLookup(resource, actionName);
    }

    getSocket(resource: unknown, socketName: string): ResourceSocket | undefined {
        return this.hateoasConfig.socketLookup(resource, socketName);
    }
}