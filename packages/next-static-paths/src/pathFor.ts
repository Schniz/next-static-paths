import type { Paths } from "@@@next-static-paths";

type PathKeysWithoutArguments = {
  [key in keyof Paths]: Record<never, never> extends Paths[key] ? key : never;
}[keyof Paths];

type PathKeysWithArguments = {
  [key in keyof Paths]: Record<never, never> extends Paths[key] ? never : key;
}[keyof Paths];

/**
 * Constructs an absolute path for a given route
 * that was generated using `next-static-paths generate`
 */
export function pathFor<K extends PathKeysWithoutArguments>(
  key: K,
  args?: undefined,
): string;
export function pathFor<K extends PathKeysWithArguments>(
  key: K,
  args: Paths[K],
): string;
export function pathFor<
  K extends PathKeysWithArguments | PathKeysWithoutArguments,
>(key: K, args?: Record<Paths[K][number], string>): string {
  return (key as string).replace(
    /\[(?:\.\.\.)?([^\]]+)\]/g,
    (_, argumentKey) => {
      if (typeof args === "undefined" || !(argumentKey in args)) {
        throw new Error(
          `pathFor: argument ${argumentKey} is missing for route ${key}`,
        );
      }

      const value = (args as Record<string, string | string[]>)[
        argumentKey as string
      ] as string | string[];

      if (typeof value === "string") {
        return encodeURIComponent(value);
      } else {
        return value.map(encodeURIComponent).join("/");
      }
    },
  );
}
