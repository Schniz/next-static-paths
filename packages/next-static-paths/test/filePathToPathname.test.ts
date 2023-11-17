import {appFilePathToPathname, pageFilePathToPathname} from "../cli/pageFilePathToPathname";
import { test, expect } from "vitest";

test.each([
  ["normal API route", "api/hello.js", "/api/hello"],
  ["nested index file", "conf/speakers/index.js", "/conf/speakers"],
  ["root index file", "index.js", "/"],
  ["middleware", "something/_middleware.js", "/something"],
  ["dot in the filepath", "something/file.json.js", "/something/file.json"],
])(`%s`, (_, filePath, expected) => {
  expect(pageFilePathToPathname(["js"], filePath)).toEqual(expected);
});

test.each([
  ["nested index file", "conf/speakers/page.js", "/conf/speakers"],
  ["root index file", "page.js", "/"],
  ["page inside ()", "(auth)/sign-in/page.js", "/sign-in"],
  ["page with [[...rest]]", "[[...rest]]/page.js", "/[...rest]"],
])(`%s`, (_, filePath, expected) => {
  expect(appFilePathToPathname(["js"], filePath)).toEqual(expected);
});
