import { Injectable, inject } from "@angular/core";
import { ResourceAction, ResourceLink, ResourceSocket } from "../models";

export class HateoasConfig {
    linkLookup(resource: unknown, linkName: string): ResourceLink | undefined {
        return (resource as any)?._links?.[linkName];
    }
    actionLookup(resource: unknown, actionName: string): ResourceAction | undefined {
        return (resource as any)?._actions?.[actionName];
    }
    socketLookup(resource: unknown, socketName: string): ResourceSocket | undefined {
        return (resource as any)?._sockets?.[socketName];
    }
}

@Injectable()
export class HateoasService {
    private hateoasConfig = inject(HateoasConfig);

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