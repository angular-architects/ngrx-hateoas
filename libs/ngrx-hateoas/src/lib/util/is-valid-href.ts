
export function isValidHref(href: string | undefined | null): boolean {
  if (href === undefined || href === null) return false;
  return href.startsWith('/') || href.startsWith('http');
}
