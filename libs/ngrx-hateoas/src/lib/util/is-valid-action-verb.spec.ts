import { isValidActionVerb } from "./is-valid-action-verb";

describe('isValidActionVerb', () => {

    it('treats PUT as valid', () => {
        expect(isValidActionVerb('PUT')).toBeTrue();
        expect(isValidActionVerb('put')).toBeTrue();
        expect(isValidActionVerb(' PUT ')).toBeTrue();
        expect(isValidActionVerb(' Put ')).toBeTrue();
    });

    it('treats POST as valid', () => {
        expect(isValidActionVerb('POST')).toBeTrue();
        expect(isValidActionVerb('post')).toBeTrue();
        expect(isValidActionVerb(' POST ')).toBeTrue();
        expect(isValidActionVerb(' Post ')).toBeTrue();
    });

    it('treats DELETE as valid', () => {
        expect(isValidActionVerb('DELETE')).toBeTrue();
        expect(isValidActionVerb('delete')).toBeTrue();
        expect(isValidActionVerb(' DELETE ')).toBeTrue();
        expect(isValidActionVerb(' Delete ')).toBeTrue();
    });

    it('treats PATCH as valid', () => {
        expect(isValidActionVerb('PATCH')).toBeTrue();
        expect(isValidActionVerb('patch')).toBeTrue();
        expect(isValidActionVerb(' PATCH ')).toBeTrue();
        expect(isValidActionVerb(' Patch ')).toBeTrue();
    });

    it('treats undefined and null not as valid', () => {
        expect(isValidActionVerb(undefined)).toBeFalse();
        expect(isValidActionVerb(null)).toBeFalse();
    });

    it('treats wront string not as valid', () => {
        expect(isValidActionVerb('PUT1')).toBeFalse();
        expect(isValidActionVerb('1POST')).toBeFalse();
        expect(isValidActionVerb('anything')).toBeFalse();
    });

});
