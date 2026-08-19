import { TestBed } from "@angular/core/testing";
import { AntiForgeryOptions, CustomHeadersOptions, HATEOAS_ANTI_FORGERY, HATEOAS_CUSTOM_HEADERS, HATEOAS_LOGIN_REDIRECT, HATEOAS_METADATA_PROVIDER, LoginRedirectOptions, MetadataProvider, provideHateoas, withAntiForgery, withCustomHeaders, withLoginRedirect, withMetadataProvider } from "./provide";
import { ResourceAction, ResourceLink, ResourceSocket } from "./models";

describe('provideHateaos', () => {

    beforeEach(() => {
        TestBed.resetTestingModule();
    });

    describe('withAntiForgery', () => {

        it('registers default anti forgery options', () => {
            TestBed.configureTestingModule({ providers: [provideHateoas(withAntiForgery())] });

            expect(TestBed.inject(HATEOAS_ANTI_FORGERY)).toEqual({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' });
        });

        it('registers custom anti forgery options in injection context', () => {

            const dummyAntiForgeryOptions: AntiForgeryOptions = {
                cookieName: 'foo', 
                headerName: 'bar'
            };

            TestBed.configureTestingModule({ providers: [provideHateoas(withAntiForgery(dummyAntiForgeryOptions))]});
            const antiForgeryOptions = TestBed.inject(HATEOAS_ANTI_FORGERY);

            expect(antiForgeryOptions.cookieName).toBe(dummyAntiForgeryOptions.cookieName);
            expect(antiForgeryOptions.headerName).toBe(dummyAntiForgeryOptions.headerName);
        });

    });

    describe('withLoginRedirect', () => {

        it('registers default login redirect options', () => {
            TestBed.configureTestingModule({ providers: [provideHateoas(withLoginRedirect())] });

            expect(TestBed.inject(HATEOAS_LOGIN_REDIRECT)).toEqual({ loginUrl: '/login', redirectUrlParamName: 'redirectUrl' });
        });

        it('registers custom login redirect options in injection context', () => {

            const dummyLoginRedirectOptions: LoginRedirectOptions = {
                loginUrl: 'foo', 
                redirectUrlParamName: 'bar'
            };

            TestBed.configureTestingModule({ providers: [provideHateoas(withLoginRedirect(dummyLoginRedirectOptions))]});
            const loginRedirectOptoins = TestBed.inject(HATEOAS_LOGIN_REDIRECT);

            expect(loginRedirectOptoins.loginUrl).toBe(dummyLoginRedirectOptions.loginUrl);
            expect(loginRedirectOptoins.redirectUrlParamName).toBe(dummyLoginRedirectOptions.redirectUrlParamName);
        });

    });

    describe('withCustomHeaders', () => {

        it('registers empty default headers', () => {
            TestBed.configureTestingModule({ providers: [provideHateoas(withCustomHeaders())] });

            expect(TestBed.inject(HATEOAS_CUSTOM_HEADERS).headers).toEqual({});
        });

        it('registers custom header options in injection context', () => {

            const dummyCustomHeaderOptions: CustomHeadersOptions = {
                headers: {
                    foo: 'bar'
                } 
            };

            TestBed.configureTestingModule({ providers: [provideHateoas(withCustomHeaders(dummyCustomHeaderOptions))]});
            const customHeaderOptions = TestBed.inject(HATEOAS_CUSTOM_HEADERS);

            expect(customHeaderOptions.headers).toBe(dummyCustomHeaderOptions.headers);
        });

    });

    describe('withMedatadaProvider', () => {

        it('collects valid default metadata and ignores invalid entries', () => {
            TestBed.configureTestingModule({ providers: [provideHateoas()] });
            const provider = TestBed.inject(HATEOAS_METADATA_PROVIDER);
            const resource = {
                _links: { self: { href: '/self' }, invalid: null },
                _actions: { save: { href: '/save', method: 'PUT' }, invalid: { href: '/invalid' } },
                _sockets: { changes: { href: '/changes', event: 'changed' }, invalid: { href: '/invalid' } }
            };

            expect(provider.getAllLinks(resource)).toEqual([{ rel: 'self', href: '/self' }]);
            expect(provider.getAllActions(resource)).toEqual([{ rel: 'save', href: '/save', method: 'PUT' }]);
            expect(provider.getAllSockets(resource)).toEqual([{ rel: 'changes', href: '/changes', event: 'changed' }]);
            expect(provider.getAllLinks(null)).toEqual([]);
            expect(provider.getAllActions({ _actions: null })).toEqual([]);
            expect(provider.getAllSockets({ _sockets: 'invalid' })).toEqual([]);
        });

        it('registers custom metadataprovider in injection context', () => {

            const dummyMetadataProvider: MetadataProvider = {
                isMetadataKey(keyName: string) {
                    return keyName === 'myMeta';
                },
                linkLookup() {
                    return undefined;
                },
                getAllLinks(): ResourceLink[] {
                    return [];
                },
                actionLookup() {
                    return undefined;
                },
                getAllActions(): ResourceAction[] {
                    return [];
                },
                socketLookup() {
                    return undefined;
                },
                getAllSockets(): ResourceSocket[] {
                    return [];
                }
            }

            TestBed.configureTestingModule({ providers: [provideHateoas(withMetadataProvider(dummyMetadataProvider))]});
            const metadataProvider = TestBed.inject(HATEOAS_METADATA_PROVIDER);

            expect(metadataProvider.isMetadataKey).toBe(dummyMetadataProvider.isMetadataKey);
            expect(metadataProvider.linkLookup).toBe(dummyMetadataProvider.linkLookup);
            expect(metadataProvider.getAllLinks).toBe(dummyMetadataProvider.getAllLinks);
            expect(metadataProvider.actionLookup).toBe(dummyMetadataProvider.actionLookup);
            expect(metadataProvider.getAllActions).toBe(dummyMetadataProvider.getAllActions);
            expect(metadataProvider.socketLookup).toBe(dummyMetadataProvider.socketLookup);
            expect(metadataProvider.getAllSockets).toBe(dummyMetadataProvider.getAllSockets);
        });

    });

});
