import { Injectable, inject } from "@angular/core";
import { Resource, ResourceAction, ResourceLink, ResourceSocket } from "../models";

export class HateoasConfig {
    linkLookup(resource: Resource, linkName: string): ResourceLink | undefined {
        return (resource as any)?._links?.[linkName];
    }
    actionLookup(resource: Resource, actionName: string): ResourceAction | undefined {
        return (resource as any)?._actions?.[actionName];
    }
    socketLookup(resource: Resource, socketName: string): ResourceSocket | undefined {
        return (resource as any)?._sockets?.[socketName];
    }
}

@Injectable()
export class HateoasService {
    private hateoasConfig = inject(HateoasConfig);

    getLink(resource: Resource, linkName: string): ResourceLink | undefined {
        return this.hateoasConfig.linkLookup(resource, linkName);
    }

    getAction(resource: Resource, actionName: string): ResourceAction | undefined {
        return this.hateoasConfig.actionLookup(resource, actionName);
    }

    getSocket(resource: Resource, socketName: string): ResourceSocket | undefined {
        return this.hateoasConfig.socketLookup(resource, socketName);
    }
}