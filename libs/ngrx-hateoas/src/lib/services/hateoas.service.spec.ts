import { TestBed } from '@angular/core/testing';
import { HateoasService } from './hateoas.service';
import { ResourceAction, ResourceLink, ResourceSocket } from '../models';
import { HATEOAS_METADATA_PROVIDER, MetadataProvider } from '../provide';

const dummyHateoasMetadataProvider: MetadataProvider = {
    linkLookup(resource, linkName) {
        return { href: (resource as any)['myMeta'][`_link_${linkName}`] } satisfies ResourceLink;
    },
    actionLookup(resource, actionName) {
        return { href: (resource as any)['myMeta'][`_action_${actionName}`], method: 'PUT' } satisfies ResourceAction;
    },
    socketLookup(resource, socketName) {
        return { href: (resource as any)['myMeta'][`_socket_${socketName}`], method: 'update' } satisfies ResourceSocket;
    }
}

const testObj = {
    myMeta: {
        _link_myLink: '/my/link',
        _action_myAction: '/my/action',
        _socket_mySocket: '/my/socket'
    }
}

describe('HateoasService', () => {

    let hateoasService: HateoasService;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [ { provide: HATEOAS_METADATA_PROVIDER, useValue: dummyHateoasMetadataProvider  }, HateoasService ]});
        hateoasService = TestBed.inject(HateoasService);
    });

    it('reads links correctly', () => {
        expect(hateoasService.getLink(testObj, 'myLink')?.href).toBe('/my/link');
    });

    it('reads actions correctly', () => {
        expect(hateoasService.getAction(testObj, 'myAction')?.href).toBe('/my/action');
        expect(hateoasService.getAction(testObj, 'myAction')?.method).toBe('PUT');
    });

    it('reads sockets correctly', () => {
        expect(hateoasService.getSocket(testObj, 'mySocket')?.href).toBe('/my/socket');
        expect(hateoasService.getSocket(testObj, 'mySocket')?.method).toBe('update');
    });

});
