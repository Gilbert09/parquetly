// Copies the parquet-wasm ESM build into public/ so the app loads it from our
// own origin instead of a CDN.
//
// Why not just import the package? The bundler-targeted entry point needs
// webpack's asyncWebAssembly experiment, and Next 16 refuses to build when a
// webpack() config is present while using Turbopack. Serving the files as
// static assets keeps every bundler out of the WASM entirely.
import { cp, mkdir, readFile, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);

// Must match PARQUET_WASM_VERSION in src/lib/parquetReader.ts
const EXPECTED = "0.7.1";

// parquet-wasm does not export ./package.json, so read it off disk.
const pkgPath = join(
  dirname(require.resolve("parquet-wasm/esm/parquet_wasm.js")),
  "..",
  "package.json"
);
const { version } = JSON.parse(await readFile(pkgPath, "utf8"));

if (version !== EXPECTED) {
  throw new Error(
    `parquet-wasm version drift: installed ${version}, but the app expects ` +
      `${EXPECTED}. Update PARQUET_WASM_VERSION in src/lib/parquetReader.ts ` +
      `and EXPECTED here together, or pin package.json back to ${EXPECTED}.`
  );
}

const srcDir = dirname(require.resolve("parquet-wasm/esm/parquet_wasm.js"));
const outRoot = join(process.cwd(), "public", "wasm", "parquet-wasm");
const outDir = join(outRoot, EXPECTED);

await rm(outRoot, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });
await cp(srcDir, outDir, { recursive: true });

console.log(`[parquet-wasm] v${EXPECTED} -> public/wasm/parquet-wasm/${EXPECTED}`);
