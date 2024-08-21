import { TestBed } from '@angular/core/testing';
import { RequestService } from './request.service';
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
            const clientRequestPromise = requestService.request('DELETE', '/api/test', { strProp: 'foo'}); 
            const serverRequest = httpTestingController.expectOne('/api/test');
            expect(serverRequest.request.method).toBe('DELETE');
            expect(serverRequest.request.body.strProp).toBe('foo');
            serverRequest.flush(null, { status: 204, statusText: 'No Content' });
            const clientRequest = await clientRequestPromise;
            expect(clientRequest).toBeNull();
        });
    });

});
