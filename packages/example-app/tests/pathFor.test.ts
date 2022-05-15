import { test, expect } from "vitest";
import { pathFor } from "next-static-paths";

test("/", () => {
  expect(pathFor("/")).toEqual("/");
});

test("/dynamic/[userId]", () => {
  expect(() => {
    // @ts-expect-error
    pathFor("/dynamic/[userId]");
  }).toThrowError(/argument userId is missing/i);

  expect(() => {
    // @ts-expect-error
    pathFor("/dynamic/[userId]", { hello: "world" });
  }).toThrowError(/argument userId is missing/i);

  // @ts-expect-error
  pathFor("/dynamic/[userId]", { userId: "userId", hello: "world" });

  expect(pathFor("/dynamic/[userId]", { userId: "userId" })).toEqual(
    "/dynamic/userId"
  );
});

test("/splat/[...rest]", () => {
  expect(() => {
    // @ts-expect-error
    pathFor("/splat/[...rest]");
  }).toThrowError(/argument rest is missing/i);

  // @ts-expect-error
  pathFor("/splat/[...rest]", { rest: "rest" });

  // @ts-expect-error
  pathFor("/splat/[...rest]", { rest: [10] });

  pathFor("/splat/[...rest]", { rest: [] });
  expect(pathFor("/splat/[...rest]", { rest: ["hello", "wor/ld"] })).toEqual(
    "/splat/hello/wor%2Fld"
  );
});
