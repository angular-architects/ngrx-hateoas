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
    linkLookup(resource: unknown, linkName: string): ResourceLink | undefined;
    actionLookup(resource: unknown, actionName: string): ResourceAction | undefined;
    socketLookup(resource: unknown, socketName: string): ResourceSocket | undefined;
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
    return typeof resourceSocket === 'object' && resourceSocket !== null && 'href' in resourceSocket && 'method' in resourceSocket;
}

const defaultMetadataProvider: MetadataProvider = {
    linkLookup(resource: unknown, linkName: string): ResourceLink | undefined {
        if(isResource(resource) && isResourceLinkRecord(resource['_links']) && isResourceLink(resource['_links'][linkName]))
            return resource['_links'][linkName];
        else
            return undefined;
    },
    actionLookup(resource: unknown, actionName: string): ResourceAction | undefined {
        if(isResource(resource) && isResourceActionRecord(resource['_actions']) && isResourceAction(resource['_actions'][actionName]))
            return resource['_actions'][actionName];
        else
            return undefined;
    },
    socketLookup(resource: unknown, socketName: string): ResourceSocket | undefined {
        if(isResource(resource) && isResourceSocketRecord(resource['_sockets']) && isResourceSocket(resource['_sockets'][socketName]))
            return resource['_sockets'][socketName];
        else
            return undefined;
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
