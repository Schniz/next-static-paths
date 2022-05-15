import { TypedLink } from "next-static-paths";
import { test, expect, describe } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

test("no args throws", () => {
  expect(() => {
    renderToStaticMarkup(
      // @ts-expect-error
      <TypedLink />
    );
  }).toThrowError(/`as` prop is required/);
});

test("/", () => {
  expect(
    renderToStaticMarkup(
      <TypedLink as="/">
        <a>Hello</a>
      </TypedLink>
    )
  ).toEqual(`<a href="/">Hello</a>`);
});

describe("/dynamic/[userId]", () => {
  test("fails if missing userId", () => {
    expect(() => {
      // @ts-ignore
      renderToStaticMarkup(<TypedLink as="/dynamic/[userId]" />);
    }).toThrowError(/argument userId is missing/);
  });
  test("renders correctly", () => {
    expect(
      renderToStaticMarkup(
        <TypedLink as="/dynamic/[userId]" userId="my-user-id">
          <a>Hello</a>
        </TypedLink>
      )
    ).toEqual(`<a href="/dynamic/my-user-id">Hello</a>`);
  });
});

describe("/splat/[...rest]", () => {
  test("throws if missing userId", () => {
    expect(() => {
      // @ts-ignore
      renderToStaticMarkup(<TypedLink as="/splat/[...rest]" />);
    }).toThrowError(/argument rest is missing/);
  });
  test("renders correctly", () => {
    expect(
      renderToStaticMarkup(
        <TypedLink as="/splat/[...rest]" rest={["my-rest", "wel/come"]}>
          <a>Hello</a>
        </TypedLink>
      )
    ).toEqual(`<a href="/splat/my-rest/wel%2Fcome">Hello</a>`);
  });
});
