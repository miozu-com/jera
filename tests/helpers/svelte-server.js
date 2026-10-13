/**
 * Lets `node --test` import `.svelte` components and `.svelte.js` rune modules
 * by compiling them for the server on load (svelte/compiler, already the
 * library's only devDependency). Nothing else is added: render with
 * `svelte/server` and assert on the HTML.
 *
 * Import this module first, then `await import()` the component.
 */

import { registerHooks } from "node:module";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { compile, compileModule } from "svelte/compiler";

registerHooks({
  load(url, context, nextLoad) {
    const isComponent = url.endsWith(".svelte");
    const isRuneModule = url.endsWith(".svelte.js");
    if (!isComponent && !isRuneModule) return nextLoad(url, context);

    const filename = fileURLToPath(url);
    const source = readFileSync(filename, "utf8");
    const { js } = isComponent
      ? compile(source, { filename, generate: "server", css: "external" })
      : compileModule(source, { filename, generate: "server" });
    return { format: "module", source: js.code, shortCircuit: true };
  },
});
