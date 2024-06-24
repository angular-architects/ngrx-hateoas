import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders, Provider } from "@angular/core";
import { HateoasConfig, HateoasService } from "./services/hateoas.service";
import { RequestService } from "./services/request.service";

export enum HateoasFeatureKind {
    AntiForgery,
    LoginRedirect,
    CustomHeaders
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

export function provideHateoas(...features: HateoasFeature[]): EnvironmentProviders {
    return makeEnvironmentProviders([{
        provide: HateoasConfig,
        useValue: new HateoasConfig()
    }, {
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
