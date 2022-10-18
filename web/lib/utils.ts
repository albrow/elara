export function range(size: number): ReadonlyArray<number> {
  return [...Array(size).keys()].map((i) => i);
}
