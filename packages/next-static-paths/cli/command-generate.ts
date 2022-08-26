import {
  command,
  multioption,
  option,
  string,
  array,
  extendType,
} from "cmd-ts";
import { Directory } from "cmd-ts/batteries/fs";
import globby from "globby";
import path from "path";
import fs from "fs/promises";
import chalk from "chalk";
import { existsSync } from "fs";
import { type Writable } from "stream";
import { filePathToPathname } from "./filePathToPathname";
import {
  getHelperJsDocs,
  HelperJsDocs,
  generateHelperCode,
} from "./helperJsDocs";
import {
  ArgObject,
  argObjectToTypeString,
  getArgumentsFromPath,
} from "./argObject";

const logRoutes = chalk.blue.bold(`routes:`);
const danger = chalk.red.bold(`danger:`);
const logOutput = chalk.magenta.bold(`output:`);

interface Route {
  filepath: string;
  pathname: string;
  arguments: ArgObject;
  helper?: HelperJsDocs;
}

const defaultPageExtensions = ["js", "jsx", "ts", "tsx"] as const;
const PageExtensionType = extendType(array(string), {
  async from(value: string[]): Promise<readonly string[]> {
    if (!value.length) {
      return defaultPageExtensions;
    }

    return value.map((x) => x.replace(/^\./, ""));
  },
  defaultValue: () => defaultPageExtensions,
  defaultValueIsSerializable: true,
  displayName: "ext",
});

export const generate = command({
  name: "next-static-paths",
  description: "Generate static path generation and helpers for next.js",
  args: {
    outputDir: option({
      long: "output",
      description: "The directory where the files will be stored",
      defaultValue: () => "./generated",
      defaultValueIsSerializable: true,
    }),
    pagesDirectory: option({
      type: Directory,
      long: "pages-dir",
      defaultValue: () => "./pages",
      defaultValueIsSerializable: true,
    }),
    runtimeFilename: option({
      type: {
        ...string,
        displayName: "file",
      },
      long: "runtime-filename",
      description:
        "the filename for which the runtime helpers will be generated to",
      defaultValue: () => "paths.ts",
      defaultValueIsSerializable: true,
    }),
    staticFilename: option({
      type: {
        ...string,
        displayName: "file",
      },
      long: "static-filename",
      description:
        "the filename for which the static typedefs will be generated to",
      defaultValue: () => "static-paths.d.ts",
      defaultValueIsSerializable: true,
    }),
    pageExtensions: multioption({
      long: "page-extension",
      type: PageExtensionType,
      description: "The pageExtensions config from next.config.js",
    }),
  },
  async handler({
    outputDir,
    staticFilename,
    runtimeFilename,
    pageExtensions,
    pagesDirectory,
  }) {
    const glob = `**/*.{${pageExtensions.join(",")}}`;
    const globber = globby.stream(glob, {
      cwd: pagesDirectory,
      ignore: [
        ignoredFile("_app", pageExtensions),
        ignoredFile("_document", pageExtensions),
      ],
    });
    const routes = new Map<string, Route>();

    for await (const pathAsMaybeString of globber) {
      const filepath = String(pathAsMaybeString);
      const contents = await fs.readFile(
        path.join(pagesDirectory, filepath),
        "utf8"
      );

      const helper = getHelperJsDocs(contents);
      const pathname = filePathToPathname(pageExtensions, filepath);

      const previousValue = routes.get(pathname);
      routes.set(pathname, {
        ...previousValue,
        filepath,
        pathname,
        arguments: getArgumentsFromPath(pathname),
        helper,
      });
    }

    const sortedRoutes = new Map([...routes].sort());

    const helpers: string[] = [];
    for (const { pathname, helper, arguments: args } of sortedRoutes.values()) {
      if (helper) {
        helpers.push(generateHelperCode(helper, pathname, args));
        console.error(
          `${logRoutes} Found ${pathname} (${chalk.cyan(helper.name)})`
        );
      } else {
        console.error(`${logRoutes} Found ${pathname}`);
      }
    }

    const paths = {
      runtime: path.join(outputDir, runtimeFilename),
      static: path.join(outputDir, staticFilename),
    };

    await fs.mkdir(outputDir, { recursive: true });

    if (helpers.length) {
      console.error(
        `${logOutput} Generated ${helpers.length} helpers to ${chalk.cyan(
          paths.runtime
        )}`
      );
      await fs.writeFile(
        paths.runtime,
        maybePrettify([getIntroString(), "", ...helpers].join("\n\n")),
        "utf8"
      );
    } else if (existsSync(paths.runtime)) {
      console.error(
        `${danger} no helpers found, deleting ${chalk.red(paths.runtime)}`
      );
      await fs.rm(paths.runtime);
    }

    console.error(
      `${logOutput} generating static interface to ${chalk.cyan(paths.static)}`
    );
    await fs.writeFile(
      paths.static,
      maybePrettify(
        [
          getIntroString(),
          "",
          `declare module "@@@next-static-paths" {`,
          getInterface([...sortedRoutes.values()]).replace(/^/gm, "  "),
          "}",
        ].join("\n")
      ),
      "utf8"
    );

    await write(process.stderr, chalk.bgGreen.black.bold(" SUCCESS ") + " ");
    await write(process.stderr, "Generated ");
    if (helpers.length) {
      await write(process.stderr, `${chalk.cyan(helpers.length)} helpers for `);
    }
    await write(
      process.stderr,
      `${chalk.cyan(sortedRoutes.size)} static paths.`
    );
    await write(process.stderr, "\n");
  },
});

function ignoredFile(name: string, extensions: readonly string[]) {
  return `${name}.{${extensions.join(",")}}`;
}

function getInterface(routes: readonly Route[]) {
  const fields = routes
    .map((x) => {
      let pathname = x.pathname;
      let args = x.arguments;
      const typedef = argObjectToTypeString(args);
      return `${JSON.stringify(pathname)}: ${typedef}`;
    })
    .join(",\n");
  return `interface Paths {\n${fields}\n}`;
}

function getIntroString(): string {
  return [
    `// This file is generated by scripts/generate-paths.ts`,
    `// Do not edit this file directly.`,
    "",
    "// @generated",
    `// prettier-ignore`,
    `/* eslint-disable */`,
  ].join("\n");
}

function write(writable: Writable, data: string): Promise<void> {
  return new Promise((resolve, reject) => {
    writable.write(data, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function maybePrettify(input: string): string {
  try {
    const resolved = require("prettier");
    return resolved.format(input, { parser: "typescript" });
  } catch {}
  return input;
}
