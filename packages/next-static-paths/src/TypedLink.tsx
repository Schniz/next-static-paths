import React from "react";
import { Paths } from "@@@next-static-paths";
import Link, { LinkProps } from "next/link";
import { pathFor } from "./pathFor";

export type TypedProps<K extends keyof Paths> = Paths[K] & { as: K };
export type TypedLinkProps<K extends keyof Paths> = Omit<LinkProps, "href"> &
  TypedProps<K>;

export function TypedLink<K extends keyof Paths>(
  props: React.PropsWithChildren<TypedLinkProps<K>>
) {
  const as = (props as any).as as string;
  const restProps = omit(props, "as");
  if (typeof as !== "string") {
    throw new Error("`as` prop is required");
  }
  const generatedPath = (pathFor as any)(as, restProps);
  return <Link {...restProps} href={generatedPath} />;
}

function omit<T, Keys extends string>(
  value: T,
  ...keys: Keys[]
): Omit<T, Keys> {
  const output = {} as Omit<T, Keys>;
  for (const [key, v] of Object.entries(value)) {
    if (!keys.includes(key as Keys)) {
      output[key as keyof Omit<T, Keys>] = v;
    }
  }
  return output;
}
