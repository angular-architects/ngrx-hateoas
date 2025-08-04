import { TestBed } from '@angular/core/testing';
import { HateoasService } from './hateoas.service';
import { ResourceAction, ResourceLink, ResourceSocket } from '../models';
import { HATEOAS_METADATA_PROVIDER, MetadataProvider } from '../provide';
import { provideZonelessChangeDetection } from '@angular/core';

const dummyHateoasMetadataProvider: MetadataProvider = {
    isMetadataKey(keyName: string) {
        return keyName === 'myMeta';
    },
    linkLookup(resource: Record<string, Record<string, string>>, linkName: string) {
        return resource['myMeta'][`_link_${linkName}`] ? { href: resource['myMeta'][`_link_${linkName}`] } satisfies ResourceLink : undefined;
    },
    actionLookup(resource: Record<string, Record<string, string>>, actionName: string) {
        return resource['myMeta'][`_action_${actionName}`] ? { href: resource['myMeta'][`_action_${actionName}`], method: 'PUT' } satisfies ResourceAction : undefined;
    },
    socketLookup(resource: Record<string, Record<string, string>>, socketName: string) {
        return resource['myMeta'][`_socket_${socketName}`] ?  { href: resource['myMeta'][`_socket_${socketName}`], event: 'update' } satisfies ResourceSocket : undefined;
    }
}

const testObj = {
    myMeta: {
        _link_myLink: '/my/link',
        _link_myLinkWithQuery: '/my/link?myQuery=true',
        _action_myAction: '/my/action',
        _socket_mySocket: '/my/socket'
    }
}

describe('HateoasService', () => {

    let hateoasService: HateoasService;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [{ provide: HATEOAS_METADATA_PROVIDER, useValue: dummyHateoasMetadataProvider  }, HateoasService, provideZonelessChangeDetection()]});
        hateoasService = TestBed.inject(HateoasService);
    });

    it('reads links correctly', () => {
        expect(hateoasService.getLink(testObj, 'myLink')?.href).toBe('/my/link');
    });


    it('reads missing links correctly', () => {
        expect(hateoasService.getLink(testObj, 'missingLink')).toBeUndefined();
    });

    it('reads actions correctly', () => {
        expect(hateoasService.getAction(testObj, 'myAction')?.href).toBe('/my/action');
        expect(hateoasService.getAction(testObj, 'myAction')?.method).toBe('PUT');
    });

    it('reads missing actions correctly', () => {
        expect(hateoasService.getAction(testObj, 'missingAction')).toBeUndefined();
    });

    it('reads sockets correctly', () => {
        expect(hateoasService.getSocket(testObj, 'mySocket')?.href).toBe('/my/socket');
        expect(hateoasService.getSocket(testObj, 'mySocket')?.event).toBe('update');
    });

    it('reads missing sockets correctly', () => {
        expect(hateoasService.getSocket(testObj, 'missingSocket')).toBeUndefined();
    });

    it('constructs URL correctly without parameters', () => {
        expect(hateoasService.getUrl(testObj, 'myLink')).toBe('/my/link');
    });

    it('constructs URL correctly with parameters', () => {
        const params = { param1: 'value1', param2: 'value2' };
        expect(hateoasService.getUrl(testObj, 'myLink', params)).toBe('/my/link?param1=value1&param2=value2');
    });

    it('constructs URL correctly with parameters and link with parameters', () => {
        const params = { param1: 'value1', param2: 'value2' };
        expect(hateoasService.getUrl(testObj, 'myLinkWithQuery', params)).toBe('/my/link?myQuery=true&param1=value1&param2=value2');
    });

    it('throws an error if link is missing', () => {
        expect(() => hateoasService.getUrl(testObj, 'missingLink')).toThrowError('missingLink is missing on provided resource');
    });

});
