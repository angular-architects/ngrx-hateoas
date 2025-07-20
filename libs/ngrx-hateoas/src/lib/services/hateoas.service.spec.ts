import { TestBed } from '@angular/core/testing';
import { HateoasService } from './hateoas.service';
import { ResourceAction, ResourceLink, ResourceSocket } from '../models';
import { HATEOAS_METADATA_PROVIDER, MetadataProvider } from '../provide';
import { provideZonelessChangeDetection } from '@angular/core';

const dummyHateoasMetadataProvider: MetadataProvider = {
    isMetadataKey(keyName: string) {
        return keyName === 'myMeta';
    },
    getLinks: function (resource: Record<string, Record<string, string>>): ResourceLink[] {
        const result: ResourceLink[] = [];
        for(const key in resource['myMeta']) {
            if(key.startsWith('_link_')) result.push({rel: key.substring('_link_'.length), href: resource['myMeta'][key]})
        }
        return result;
    },
    getActions: function (resource: Record<string, Record<string, string>>): ResourceAction[] {
        const result: ResourceAction[] = [];
        for(const key in resource['myMeta']) {
            if(key.startsWith('_action_')) result.push({rel: key.substring('_action_'.length), href: resource['myMeta'][key], method: 'PUT'})
        }
        return result;
    },
    getSockets: function (resource: Record<string, Record<string, string>>): ResourceSocket[] {
        const result: ResourceSocket[] = [];
        for(const key in resource['myMeta']) {
            if(key.startsWith('_socket_')) result.push({rel: key.substring('_socket_'.length), href: resource['myMeta'][key], event: 'update'})
        }
        return result;
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

    it('reads all links', () => {
        const result = hateoasService.getLinks(testObj)
        expect(result).toEqual([{ rel: 'myLink', href: '/my/link' }, { rel: 'myLinkWithQuery', href: '/my/link?myQuery=true' }]);
    });

    it('reads all actions', () => {
        const result = hateoasService.getActions(testObj)
        expect(result).toEqual([{ rel: 'myAction', href: '/my/action', method: 'PUT' }]);
    });

    it('reads all sockets', () => {
        const result = hateoasService.getSockets(testObj)
        expect(result).toEqual([{ rel: 'mySocket', href: '/my/socket', event: 'update' }]);
    });

});
