import { TestBed } from "@angular/core/testing";
import { AntiForgeryOptions, CustomHeadersOptions, HATEOAS_ANTI_FORGERY, HATEOAS_CUSTOM_HEADERS, HATEOAS_LOGIN_REDIRECT, HATEOAS_METADATA_PROVIDER, LoginRedirectOptions, MetadataProvider, provideHateoas, withAntiForgery, withCustomHeaders, withLoginRedirect, withMetadataProvider } from "./provide";
import { ResourceAction, ResourceLink, ResourceSocket } from "./models";

describe('provideHateaos', () => {

    beforeEach(() => {
        TestBed.resetTestingModule();
    });

    describe('withAntiForgery', () => {

        it('registers custom anti forgery options in injection context', () => {

            const dummyAntiForgeryOptions: AntiForgeryOptions = {
                cookieName: 'foo', 
                headerName: 'bar'
            };

            TestBed.configureTestingModule({ providers: [ provideHateoas(withAntiForgery(dummyAntiForgeryOptions)) ]});
            const antiForgeryOptions = TestBed.inject(HATEOAS_ANTI_FORGERY);

            expect(antiForgeryOptions.cookieName).toBe(dummyAntiForgeryOptions.cookieName);
            expect(antiForgeryOptions.headerName).toBe(dummyAntiForgeryOptions.headerName);
        });

    });

    describe('withLoginRedirect', () => {

        it('registers custom login redirect options in injection context', () => {

            const dummyLoginRedirectOptions: LoginRedirectOptions = {
                loginUrl: 'foo', 
                redirectUrlParamName: 'bar'
            };

            TestBed.configureTestingModule({ providers: [ provideHateoas(withLoginRedirect(dummyLoginRedirectOptions)) ]});
            const loginRedirectOptoins = TestBed.inject(HATEOAS_LOGIN_REDIRECT);

            expect(loginRedirectOptoins.loginUrl).toBe(dummyLoginRedirectOptions.loginUrl);
            expect(loginRedirectOptoins.redirectUrlParamName).toBe(dummyLoginRedirectOptions.redirectUrlParamName);
        });

    });

    describe('withCustomHeaders', () => {

        it('registers custom header options in injection context', () => {

            const dummyCustomHeaderOptions: CustomHeadersOptions = {
                headers: {
                    foo: 'bar'
                } 
            };

            TestBed.configureTestingModule({ providers: [ provideHateoas(withCustomHeaders(dummyCustomHeaderOptions)) ]});
            const customHeaderOptions = TestBed.inject(HATEOAS_CUSTOM_HEADERS);

            expect(customHeaderOptions.headers).toBe(dummyCustomHeaderOptions.headers);
        });

    });

    describe('withMedatadaProvider', () => {

        it('registers custom metadataprovider in injection context', () => {

            const dummyMetadataProvider: MetadataProvider = {
                isMetadataKey(keyName: string) {
                    return keyName === 'myMeta';
                },
                linkLookup(resource, linkName) {
                    return { href: (resource as Record<string, Record<string, string>>)['myMeta'][`_link_${linkName}`] } satisfies ResourceLink;
                },
                actionLookup(resource, actionName) {
                    return { href: (resource as Record<string, Record<string, string>>)['myMeta'][`_action_${actionName}`], method: 'PUT' } satisfies ResourceAction;
                },
                socketLookup(resource, socketName) {
                    return { href: (resource as Record<string, Record<string, string>>)['myMeta'][`_socket_${socketName}`], event: 'update' } satisfies ResourceSocket;
                }
            }

            TestBed.configureTestingModule({ providers: [ provideHateoas(withMetadataProvider(dummyMetadataProvider)) ]});
            const metadataProvider = TestBed.inject(HATEOAS_METADATA_PROVIDER);

            expect(metadataProvider.isMetadataKey).toBe(dummyMetadataProvider.isMetadataKey);
            expect(metadataProvider.linkLookup).toBe(dummyMetadataProvider.linkLookup);
            expect(metadataProvider.actionLookup).toBe(dummyMetadataProvider.actionLookup);
            expect(metadataProvider.socketLookup).toBe(dummyMetadataProvider.socketLookup);
        });

    });

});