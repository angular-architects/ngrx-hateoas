import { isValidHref } from "./is-valid-href";

describe('isValidHref', () => {

    it('treats strings beginning with / as vaild', () => {
        expect(isValidHref('/')).toBeTrue();
        expect(isValidHref('/api')).toBeTrue();
        expect(isValidHref('/api/foo')).toBeTrue();
        expect(isValidHref('/api?foo=bar')).toBeTrue();
    });

    it('treats strings beginning with http as vaild', () => {
        expect(isValidHref('http://domain.tld/api')).toBeTrue();
        expect(isValidHref('https://domain.tld/api')).toBeTrue();
        expect(isValidHref('http://domain.tld/api/foo')).toBeTrue();
        expect(isValidHref('http://domain.tld/api?foo=bar')).toBeTrue();
    });

});
