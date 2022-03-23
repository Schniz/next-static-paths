import { generate } from "../cli/command-generate";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { test, expect, spyOn } from "vitest";
import { mkdirSync } from "fs";

test("deletes the runtimes file when file is missing", async () => {
  const testDir = await createFileSystem({
    [`pages/dynamic/[id].js`]: `// @pathHelper page`,
  });

  const spies = spyOnStderr();
  await generate.handler({
    outputDir: `${testDir}/generated`,
    pageExtensions: ["jsx", "js"],
    pagesDirectory: `${testDir}/pages`,
    runtimeFilename: "runtime.ts",
    staticFilename: "static.d.ts",
  });

  expect(await getFileSystem(`${testDir}/generated`)).toMatchObject({
    "runtime.ts": expect.stringContaining("export function pagePath"),
  });

  await fs.writeFile(
    path.join(testDir, "pages/dynamic/[id].js"),
    `// @hideFromPath`
  );

  spies.clear();
  await generate.handler({
    outputDir: `${testDir}/generated`,
    pageExtensions: ["jsx", "js"],
    pagesDirectory: `${testDir}/pages`,
    runtimeFilename: "runtime.ts",
    staticFilename: "static.d.ts",
  });
  expect(spies.consoleError).toHaveBeenCalledWith(
    expect.stringContaining(`no helpers found`)
  );

  expect(await getFileSystem(`${testDir}/generated`)).toEqual({
    "static.d.ts": expect.stringContaining("@generated"),
  });
});

test("generates the files", async () => {
  const testDir = await createFileSystem({
    [`pages/index.js`]: `// @pathHelper home`,
    [`pages/dynamic/[value1]/[value2]/[value3].js`]: `// @pathHelper threeValues`,
  });

  const spies = spyOnStderr();
  await generate.handler({
    outputDir: `${testDir}/generated`,
    pageExtensions: ["jsx", "js"],
    pagesDirectory: `${testDir}/pages`,
    runtimeFilename: "runtime.ts",
    staticFilename: "static.d.ts",
  });
  expect(spies.consoleError).toHaveBeenCalledWith(
    expect.stringContaining("Found /")
  );
  expect(spies.consoleError).toHaveBeenCalledWith(
    expect.stringContaining("Found /dynamic/[value1]/[value2]/[value3]")
  );

  const fileSystem = await getFileSystem(`${testDir}/generated`);

  expect(fileSystem).toEqual({
    "runtime.ts": expect.stringContaining(`export const homePath =`),
    "static.d.ts": expect.stringContaining(`"/": Record<never, never>`),
  });

  expect(fileSystem).toEqual({
    "runtime.ts": expect.stringContaining(`export function threeValuesPath`),
    "static.d.ts": expect.stringContaining(
      `"/dynamic/[value1]/[value2]/[value3]":`
    ),
  });
});

async function createFileSystem(
  files: Record<string, string>,
  testDir: string = randomTempDir()
): Promise<string> {
  for (const [key, value] of Object.entries(files)) {
    await fs.mkdir(path.join(testDir, path.dirname(key)), { recursive: true });
    await fs.writeFile(path.join(testDir, key), value);
  }

  return testDir;
}

async function getFileSystem(
  rootPath: string
): Promise<Record<string, string>> {
  const files = await fs.readdir(rootPath);
  const fileSystem: Record<string, string> = {};

  for (const file of files) {
    const filePath = rootPath + "/" + file;
    const stat = await fs.stat(filePath);

    if (stat.isDirectory()) {
      const subFiles = await getFileSystem(filePath);
      Object.assign(fileSystem, subFiles);
    } else {
      const content = await fs.readFile(filePath, "utf8");
      const relativePath = path.relative(rootPath, filePath);
      fileSystem[relativePath] = content;
    }
  }

  return fileSystem;
}

function randomTempDir() {
  const tmpdir = os.tmpdir();
  const random = `test-${Math.random() * 100000}`;
  const testDir = path.join(tmpdir, random);
  mkdirSync(testDir);
  return testDir;
}

function spyOnStderr() {
  const consoleError = spyOn(console, "error").mockImplementation(() => {});
  const write = spyOn(process.stderr, "write").mockImplementation(
    (a: any, b: any, c: any) => {
      if (typeof b === "function") {
        b();
      } else if (typeof c === "function") {
        c();
      }
      return true;
    }
  );
  return {
    consoleError,
    write,
    clear() {
      consoleError.mockClear();
      write.mockClear();
    },
  };
}
