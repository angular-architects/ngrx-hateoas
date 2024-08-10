
export function isValidActionVerb(method: string | undefined | null) {

  if (method === undefined || method === null) return false;

  const verb = method.toLocaleUpperCase().trim();

  if (verb === 'PUT'
    || verb === 'POST'
    || verb === 'DELETE'
    || verb === 'PATCH') {
    return true;
  } else {
    return false;
  }
}
