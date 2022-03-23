import { build } from "esbuild";
import path from "path";

async function main() {
  await build({
    entryPoints: [path.resolve(__dirname, "../cli/index.ts")],
    bundle: true,
    legalComments: "external",
    format: "iife",
    target: "esnext",
    external: ["prettier"],
    platform: "node",
    minify: true,
    outdir: path.resolve(__dirname, "../dist/cli"),
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
