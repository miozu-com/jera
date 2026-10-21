/**
 * Gives jera's source modules a Vite-like `import.meta.env` under `node --test`,
 * so tests can exercise the development-only branches (`import.meta.env?.DEV`).
 * `DEV` reads `globalThis.__JERA_DEV__` at call time: set it to true for a dev
 * run, leave it unset for production behaviour.
 *
 * Import after `./svelte-server.js` (hooks run last-registered first, so this
 * one sees every module, compiled or not).
 */

import { registerHooks } from "node:module";

const PRELUDE =
  "if (!import.meta.env) import.meta.env = { get DEV() { return globalThis.__JERA_DEV__ === true; } };\n";

registerHooks({
  load(url, context, nextLoad) {
    const result = nextLoad(url, context);
    if (!url.includes("/src/") || result.format !== "module" || result.source == null) return result;
    const source = String(result.source);
    if (!source.includes("import.meta.env")) return result;
    return { ...result, source: PRELUDE + source };
  },
});
