import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders, Provider } from "@angular/core";
import { HateoasService } from "./services/hateoas.service";
import { RequestService } from "./services/request.service";
import { Resource, ResourceAction, ResourceLink, ResourceSocket } from "./models";

export enum HateoasFeatureKind {
    AntiForgery,
    LoginRedirect,
    CustomHeaders,
    MetadataProvider
}

export interface HateoasFeature {
    kind: HateoasFeatureKind;
    providers: Provider[];
}

export interface AntiForgeryOptions {
    cookieName: string;
    headerName: string;
}

const defaultAntiForgeryOptions: AntiForgeryOptions = {
    cookieName: 'XSRF-TOKEN',
    headerName: 'X-XSRF-TOKEN'
}

export interface LoginRedirectOptions {
    loginUrl: string;
    redirectUrlParamName: string;
}

const defaultLoginRedirectOptions: LoginRedirectOptions = {
    loginUrl: '/login',
    redirectUrlParamName: 'redirectUrl'
}

export interface CustomHeadersOptions {
    headers: Record<string, string>;
}

const defaultCustomHeaderOptions: CustomHeadersOptions = {
    headers: {}
}

export interface MetadataProvider {
    isMetadataKey(keyName: string): boolean;
    linkLookup(resource: unknown, linkName: string): ResourceLink | undefined;
    getAllLinks(resource: unknown): ResourceLink[];
    actionLookup(resource: unknown, actionName: string): ResourceAction | undefined;
    getAllActions(resource: unknown): ResourceAction[];
    socketLookup(resource: unknown, socketName: string): ResourceSocket | undefined;
    getAllSockets(resource: unknown): ResourceSocket[];
}

function isResource(resource: unknown): resource is Resource {
    return typeof resource === 'object' && resource !== null;
}

function isResourceLinkRecord(resourceLinks: unknown): resourceLinks is Record<string, ResourceLink> {
    return typeof resourceLinks === 'object' && resourceLinks !== null;
}

function isResourceActionRecord(resourceActions: unknown): resourceActions is Record<string, ResourceAction> {
    return typeof resourceActions === 'object' && resourceActions !== null;
}

function isResourceSocketRecord(resourceSockets: unknown): resourceSockets is Record<string, ResourceSocket> {
    return typeof resourceSockets === 'object' && resourceSockets !== null;
}

function isResourceLink(resourceLink: unknown): resourceLink is ResourceLink {
    return typeof resourceLink === 'object' && resourceLink !== null && 'href' in resourceLink;
}

function isResourceAction(resourceAction: unknown): resourceAction is ResourceAction {
    return typeof resourceAction === 'object' && resourceAction !== null && 'href' in resourceAction && 'method' in resourceAction;
}

function isResourceSocket(resourceSocket: unknown): resourceSocket is ResourceSocket {
    return typeof resourceSocket === 'object' && resourceSocket !== null && 'href' in resourceSocket && 'event' in resourceSocket;
}

const defaultMetadataProvider: MetadataProvider = {
    isMetadataKey(keyName: string) {
        return keyName.startsWith('_');
    },
    linkLookup(resource: unknown, linkName: string): ResourceLink | undefined {
        if(isResource(resource) && isResourceLinkRecord(resource['_links']) && isResourceLink(resource['_links'][linkName]))
            return { rel: linkName,  href: resource['_links'][linkName].href };
        else
            return undefined;
    },
    getAllLinks: function (resource: unknown): ResourceLink[] {
        const result: ResourceLink[] = [];
        if(isResource(resource) && isResourceLinkRecord(resource['_links']) ) {
            for(const key in resource['_links']) {
                if(isResourceLink(resource['_links'][key])) result.push({rel: key, href: resource['_links'][key].href});
            }
        }
        return result;
    },
    actionLookup(resource: unknown, actionName: string): ResourceAction | undefined {
        if(isResource(resource) && isResourceActionRecord(resource['_actions']) && isResourceAction(resource['_actions'][actionName]))
            return { rel: actionName, href: resource['_actions'][actionName].href, method: resource['_actions'][actionName].method };
        else
            return undefined;
    },
    getAllActions: function (resource: unknown): ResourceAction[] {
        const result: ResourceAction[] = [];
        if(isResource(resource) && isResourceActionRecord(resource['_actions']) ) {
            for(const key in resource['_actions']) {
                if(isResourceAction(resource['_actions'][key])) result.push({rel: key, href: resource['_actions'][key].href, method: resource['_actions'][key].method});
            }
        }
        return result;
    },
    socketLookup(resource: unknown, socketName: string): ResourceSocket | undefined {
        if(isResource(resource) && isResourceSocketRecord(resource['_sockets']) && isResourceSocket(resource['_sockets'][socketName]))
            return { rel: socketName, href: resource['_sockets'][socketName].href, event: resource['_sockets'][socketName].event };
        else
            return undefined;
    },
    getAllSockets: function (resource: unknown): ResourceSocket[] {
        const result: ResourceSocket[] = [];
        if(isResource(resource) && isResourceSocketRecord(resource['_sockets']) ) {
            for(const key in resource['_sockets']) {
                if(isResourceSocket(resource['_sockets'][key])) result.push({rel: key, href: resource['_sockets'][key].href, event: resource['_sockets'][key].event});
            }
        }
        return result;
    }
}

export const HATEOAS_ANTI_FORGERY = new InjectionToken<AntiForgeryOptions>('HATEOAS_ANTI_FORGERY');

export function withAntiForgery(options?: AntiForgeryOptions): HateoasFeature {
    return {
        kind: HateoasFeatureKind.AntiForgery,
        providers: [
            { provide: HATEOAS_ANTI_FORGERY, useValue: { ...defaultAntiForgeryOptions, ...options } }
        ]
    };
}

export const HATEOAS_LOGIN_REDIRECT = new InjectionToken<LoginRedirectOptions>('HATEOAS_LOGIN_REDIRECT');

export function withLoginRedirect(options?: LoginRedirectOptions): HateoasFeature {
    return {
        kind: HateoasFeatureKind.LoginRedirect,
        providers: [
            { provide: HATEOAS_LOGIN_REDIRECT, useValue: { ...defaultLoginRedirectOptions, ...options } }
        ]
    };
}

export const HATEOAS_CUSTOM_HEADERS = new InjectionToken<CustomHeadersOptions>('HATEOAS_CUSTOM_HEADERS');

export function withCustomHeaders(options?: CustomHeadersOptions): HateoasFeature {
    return {
        kind: HateoasFeatureKind.CustomHeaders,
        providers: [
            { provide: HATEOAS_CUSTOM_HEADERS, useValue: { ...defaultCustomHeaderOptions, ...options } }
        ]
    };
}

export const HATEOAS_METADATA_PROVIDER = new InjectionToken<MetadataProvider>('HATEOAS_METADATA_PROVIDER', { providedIn: 'root', factory: () => defaultMetadataProvider });

export function withMetadataProvider(provider?: MetadataProvider): HateoasFeature {
    return {
        kind: HateoasFeatureKind.MetadataProvider,
        providers: [
            { provide: HATEOAS_METADATA_PROVIDER, useValue: { ...defaultMetadataProvider, ...provider }}
        ]
    }
}

export function provideHateoas(...features: HateoasFeature[]): EnvironmentProviders {
    return makeEnvironmentProviders([{
        provide: HateoasService,
        useClass: HateoasService
    }, {
        provide: RequestService,
        useClass: RequestService
    },
    // Add providers from features
    features?.map(f => f.providers)
    ]);
}
