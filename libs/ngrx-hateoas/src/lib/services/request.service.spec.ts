import { AntiForgeryOptions, CustomHeadersOptions, HATEOAS_ANTI_FORGERY, HATEOAS_LOGIN_REDIRECT, LoginRedirectOptions, HATEOAS_CUSTOM_HEADERS } from './../provide';
import { TestBed } from '@angular/core/testing';
import { RequestService, WINDOW } from './request.service';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

describe('RequestService', () => {

    describe('without feature options', () => {

        let requestService: RequestService;
        let httpTestingController: HttpTestingController;

        beforeEach(() => {
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({ providers: [ RequestService, provideHttpClient(), provideHttpClientTesting() ]});
            requestService = TestBed.inject(RequestService);
            httpTestingController = TestBed.inject(HttpTestingController);
        });

        it('makes GET requests correctly', async () => {    
            const clientRequestPromise = requestService.request('GET', '/api/test'); 
            const serverRequest = httpTestingController.expectOne('/api/test');
            expect(serverRequest.request.method).toBe('GET');
            serverRequest.flush({});
            const clientRequest = await clientRequestPromise;
            expect(clientRequest).toBeDefined();
        });

        it('makes PUT requests correctly', async () => {    
            const clientRequestPromise = requestService.request('PUT', '/api/test', { strProp: 'foo'}); 
            const serverRequest = httpTestingController.expectOne('/api/test');
            expect(serverRequest.request.method).toBe('PUT');
            expect(serverRequest.request.body.strProp).toBe('foo');
            serverRequest.flush(null, { status: 204, statusText: 'No Content' });
            const clientRequest = await clientRequestPromise;
            expect(clientRequest).toBeNull();
        });

        it('makes POST requests correctly', async () => {    
            const clientRequestPromise = requestService.request('POST', '/api/test', { strProp: 'foo'}); 
            const serverRequest = httpTestingController.expectOne('/api/test');
            expect(serverRequest.request.method).toBe('POST');
            expect(serverRequest.request.body.strProp).toBe('foo');
            serverRequest.flush(null, { status: 201, statusText: 'Created' });
            const clientRequest = await clientRequestPromise;
            expect(clientRequest).toBeNull();
        });

        it('makes DELETE requests correctly', async () => {    
            const clientRequestPromise = requestService.request('DELETE', '/api/test'); 
            const serverRequest = httpTestingController.expectOne('/api/test');
            expect(serverRequest.request.method).toBe('DELETE');
            serverRequest.flush(null, { status: 204, statusText: 'No Content' });
            const clientRequest = await clientRequestPromise;
            expect(clientRequest).toBeNull();
        });
    });

    describe('with anti forgery options', () => {

        let requestService: RequestService;
        let httpTestingController: HttpTestingController;

        const antiForgeryOptions: AntiForgeryOptions = {
            cookieName: 'XSRF-COOKIE-NAME',
            headerName: 'X-XSRF-HEADER_NAME'
        }

        beforeEach(() => {
            document.cookie = "XSRF-COOKIE-NAME=Xsrf-Cookie-Content";
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({ providers: [ 
                RequestService, 
                { provide: HATEOAS_ANTI_FORGERY, useValue: antiForgeryOptions },
                provideHttpClient(), 
                provideHttpClientTesting() 
            ]});
            requestService = TestBed.inject(RequestService);
            httpTestingController = TestBed.inject(HttpTestingController);
        });

        it('makes GET requests correctly', async () => {    
            const clientRequestPromise = requestService.request('GET', '/api/test'); 
            const serverRequest = httpTestingController.expectOne('/api/test');
            expect(serverRequest.request.method).toBe('GET');
            expect(serverRequest.request.headers.has('X-XSRF-HEADER_NAME')).toBeFalse();
            serverRequest.flush({});
            const clientRequest = await clientRequestPromise;
            expect(clientRequest).toBeDefined();
        });

        it('makes PUT requests correctly', async () => {    
            const clientRequestPromise = requestService.request('PUT', '/api/test', { strProp: 'foo'}); 
            const serverRequest = httpTestingController.expectOne('/api/test');
            expect(serverRequest.request.method).toBe('PUT');
            expect(serverRequest.request.headers.has('X-XSRF-HEADER_NAME')).toBeTrue();
            expect(serverRequest.request.headers.get('X-XSRF-HEADER_NAME')).toBe('Xsrf-Cookie-Content');
            expect(serverRequest.request.body.strProp).toBe('foo');
            serverRequest.flush(null, { status: 204, statusText: 'No Content' });
            const clientRequest = await clientRequestPromise;
            expect(clientRequest).toBeNull();
        });

        it('makes POST requests correctly', async () => {    
            const clientRequestPromise = requestService.request('POST', '/api/test', { strProp: 'foo'}); 
            const serverRequest = httpTestingController.expectOne('/api/test');
            expect(serverRequest.request.method).toBe('POST');
            expect(serverRequest.request.body.strProp).toBe('foo');
            expect(serverRequest.request.headers.has('X-XSRF-HEADER_NAME')).toBeTrue();
            expect(serverRequest.request.headers.get('X-XSRF-HEADER_NAME')).toBe('Xsrf-Cookie-Content');
            serverRequest.flush(null, { status: 201, statusText: 'Created' });
            const clientRequest = await clientRequestPromise;
            expect(clientRequest).toBeNull();
        });

        it('makes DELETE requests correctly', async () => {    
            const clientRequestPromise = requestService.request('DELETE', '/api/test'); 
            const serverRequest = httpTestingController.expectOne('/api/test');
            expect(serverRequest.request.method).toBe('DELETE');
            expect(serverRequest.request.headers.has('X-XSRF-HEADER_NAME')).toBeTrue();
            expect(serverRequest.request.headers.get('X-XSRF-HEADER_NAME')).toBe('Xsrf-Cookie-Content');
            serverRequest.flush(null, { status: 204, statusText: 'No Content' });
            const clientRequest = await clientRequestPromise;
            expect(clientRequest).toBeNull();
        });
    });

    describe('with login redirect options', () => {

        let requestService: RequestService;
        let httpTestingController: HttpTestingController;
        let currentLocation: string;

        const loginRedirectOptions: LoginRedirectOptions = {
            loginUrl: '/login-path',
            redirectUrlParamName: 'redirect-url'
        }

        beforeEach(() => {
            
            currentLocation = '/angular/route'

            const windowsStub = {
                location: {
                    set href(value: string) { currentLocation = value; },
                    get href() { return currentLocation; }
                }
            } as Window & typeof globalThis;

            TestBed.resetTestingModule();
            TestBed.configureTestingModule({ providers: [ 
                RequestService, 
                { provide: WINDOW, useValue: windowsStub },
                { provide: HATEOAS_LOGIN_REDIRECT, useValue: loginRedirectOptions },
                provideHttpClient(), 
                provideHttpClientTesting() 
            ]});
            requestService = TestBed.inject(RequestService);
            httpTestingController = TestBed.inject(HttpTestingController);
        });

        it('makes GET requests correctly', async () => {    
            const clientRequestPromise = requestService.request('GET', '/api/test'); 
            const serverRequest = httpTestingController.expectOne('/api/test');
            expect(serverRequest.request.method).toBe('GET');
            serverRequest.flush(null, { status: 401, statusText: 'Unauthorized' });
            const clientRequest = await clientRequestPromise;
            expect(clientRequest).toBeUndefined();
            expect(currentLocation).toBe('/login-path?redirect-url=%2Fangular%2Froute');
        });

        it('makes PUT requests correctly', async () => {    
            const clientRequestPromise = requestService.request('PUT', '/api/test', { strProp: 'foo'}); 
            const serverRequest = httpTestingController.expectOne('/api/test');
            expect(serverRequest.request.method).toBe('PUT');
            serverRequest.flush(null, { status: 401, statusText: 'Unauthorized' });
            const clientRequest = await clientRequestPromise;
            expect(clientRequest).toBeUndefined();
            expect(currentLocation).toBe('/login-path?redirect-url=%2Fangular%2Froute');
        });

        it('makes POST requests correctly', async () => {    
            const clientRequestPromise = requestService.request('POST', '/api/test', { strProp: 'foo'}); 
            const serverRequest = httpTestingController.expectOne('/api/test');
            expect(serverRequest.request.method).toBe('POST');
            serverRequest.flush(null, { status: 401, statusText: 'Unauthorized' });
            const clientRequest = await clientRequestPromise;
            expect(clientRequest).toBeUndefined();
            expect(currentLocation).toBe('/login-path?redirect-url=%2Fangular%2Froute');
        });

        it('makes DELETE requests correctly', async () => {    
            const clientRequestPromise = requestService.request('DELETE', '/api/test'); 
            const serverRequest = httpTestingController.expectOne('/api/test');
            expect(serverRequest.request.method).toBe('DELETE');
            serverRequest.flush(null, { status: 401, statusText: 'Unauthorized' });
            const clientRequest = await clientRequestPromise;
            expect(clientRequest).toBeUndefined();
            expect(currentLocation).toBe('/login-path?redirect-url=%2Fangular%2Froute');
        });
    });

    describe('with custom header options', () => {

        let requestService: RequestService;
        let httpTestingController: HttpTestingController;

        beforeEach(() => {
            const customHeaderOptions: CustomHeadersOptions = {
                headers: {
                    'X-Foo': 'Bar'
                }
            }
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({ providers: [ 
                RequestService,
                { provide: HATEOAS_CUSTOM_HEADERS, useValue: customHeaderOptions },
                provideHttpClient(),
                provideHttpClientTesting() 
            ]});
            requestService = TestBed.inject(RequestService);
            httpTestingController = TestBed.inject(HttpTestingController);
        });

        it('makes GET requests correctly', async () => {    
            const clientRequestPromise = requestService.request('GET', '/api/test'); 
            const serverRequest = httpTestingController.expectOne('/api/test');
            expect(serverRequest.request.method).toBe('GET');
            expect(serverRequest.request.headers.has('X-FOO')).toBeTrue();
            expect(serverRequest.request.headers.get('X-FOO')).toBe('Bar');
            serverRequest.flush({});
            const clientRequest = await clientRequestPromise;
            expect(clientRequest).toBeDefined();
        });

        it('makes PUT requests correctly', async () => {    
            const clientRequestPromise = requestService.request('PUT', '/api/test', { strProp: 'foo'}); 
            const serverRequest = httpTestingController.expectOne('/api/test');
            expect(serverRequest.request.method).toBe('PUT');
            expect(serverRequest.request.body.strProp).toBe('foo');
            expect(serverRequest.request.headers.has('X-FOO')).toBeTrue();
            expect(serverRequest.request.headers.get('X-FOO')).toBe('Bar');
            serverRequest.flush(null, { status: 204, statusText: 'No Content' });
            const clientRequest = await clientRequestPromise;
            expect(clientRequest).toBeNull();
        });

        it('makes POST requests correctly', async () => {    
            const clientRequestPromise = requestService.request('POST', '/api/test', { strProp: 'foo'}); 
            const serverRequest = httpTestingController.expectOne('/api/test');
            expect(serverRequest.request.method).toBe('POST');
            expect(serverRequest.request.body.strProp).toBe('foo');
            expect(serverRequest.request.headers.has('X-FOO')).toBeTrue();
            expect(serverRequest.request.headers.get('X-FOO')).toBe('Bar');
            serverRequest.flush(null, { status: 201, statusText: 'Created' });
            const clientRequest = await clientRequestPromise;
            expect(clientRequest).toBeNull();
        });

        it('makes DELETE requests correctly', async () => {    
            const clientRequestPromise = requestService.request('DELETE', '/api/test'); 
            const serverRequest = httpTestingController.expectOne('/api/test');
            expect(serverRequest.request.method).toBe('DELETE');
            expect(serverRequest.request.headers.has('X-FOO')).toBeTrue();
            expect(serverRequest.request.headers.get('X-FOO')).toBe('Bar');
            serverRequest.flush(null, { status: 204, statusText: 'No Content' });
            const clientRequest = await clientRequestPromise;
            expect(clientRequest).toBeNull();
        });
    });

});
