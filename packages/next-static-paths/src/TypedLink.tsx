import React from "react";
import { Paths } from "@@@next-static-paths";
import Link, { LinkProps } from "next/link";
import { pathFor } from "./pathFor";

export type TypedProps<K extends keyof Paths> = Paths[K] & { as: K };
export type TypedLinkProps<K extends keyof Paths> = Omit<LinkProps, "href"> &
  TypedProps<K>;

export function TypedLink<K extends keyof Paths>(props: TypedLinkProps<K>) {
  const as = (props as any).as as string;
  const generatedPath = (pathFor as any)(as, props);
  return <Link {...props} href={generatedPath} />;
}
