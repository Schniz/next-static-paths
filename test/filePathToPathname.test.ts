import { filePathToPathname } from "../cli/filePathToPathname";
import { test, expect } from "vitest";

test.each([
  ["normal API route", "api/hello.js", "/api/hello"],
  ["nested index file", "conf/speakers/index.js", "/conf/speakers"],
  ["root index file", "index.js", "/"],
  ["middleware", "something/_middleware.js", "/something"],
  ["dot in the filepath", "something/file.json.js", "/something/file.json"],
])(`%s`, (_, filePath, expected) => {
  expect(filePathToPathname(["js"], filePath)).toEqual(expected);
});
