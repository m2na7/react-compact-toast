/** Copy of `source` without the keys whose value is `undefined`, so they do not shadow defaults when spread. */
export function definedOnly<T extends object>(source: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(source).filter(([, value]) => value !== undefined)
  ) as Partial<T>;
}
