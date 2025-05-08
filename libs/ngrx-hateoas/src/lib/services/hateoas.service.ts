import { Injectable, inject } from "@angular/core";
import { ResourceAction, ResourceLink, ResourceSocket } from "../models";
import { HATEOAS_METADATA_PROVIDER } from "../provide";

@Injectable()
export class HateoasService {
    private hateoasConfig = inject(HATEOAS_METADATA_PROVIDER);

    getUrl(resource: unknown, linkName: string, params?: Record<string, unknown>) {
        let href = this.getLink(resource, linkName)?.href;
        if (!href) {
            throw new Error(linkName + ' is missing on provided resource');
        }
        if (params) {
            let isFirstParam = !href.includes('?');
            for (const paramKey in params) {
                href += `${isFirstParam ? '?' : '&'}${paramKey}=${params[paramKey]}`;
                isFirstParam = false;
            }
        }
        return href;
    }

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