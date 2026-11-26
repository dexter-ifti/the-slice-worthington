import { randomUUID } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

const isVercelPreview =
  process.env["VERCEL_ENV"] === "preview" || process.env["VERCEL_TARGET_ENV"] === "staging";

export default defineConfig({
  define: { __SLICE_BUILD_ID__: JSON.stringify(randomUUID()) },
  plugins: [
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    tanstackStart({
      server: { entry: "server" },
      pages: [{ path: "/privacy" }],
      prerender: {
        enabled: true,
        crawlLinks: true,
        failOnError: true,
      },
    }),
    nitro({
      routeRules: isVercelPreview ? { "/**": { headers: { "x-robots-tag": "noindex" } } } : {},
    }),
    viteReact(),
    {
      name: "native-content-security-policy",
      enforce: "post",
      apply: (_, { command, mode }) => command === "build" && mode === "native",
      buildApp: {
        order: "post",
        async handler({ environments }) {
          const output = environments["client"]?.config.build.outDir;
          if (!output) throw new Error("Missing native client output directory");
          const entries = await readdir(output, { recursive: true, withFileTypes: true });

          // React hoists resource hints and stylesheets ahead of the shell's meta tag.
          // Apply CSP before the WebView starts loading those resources.
          for (const entry of entries) {
            if (!entry.isFile() || !entry.name.endsWith(".html")) continue;

            const file = join(entry.parentPath, entry.name);
            const html = await readFile(file, "utf8");
            const head = /<head>(<meta charset="utf-8"\s*\/?>)?/i;
            const csp = html.match(/<meta http-equiv="Content-Security-Policy"[^>]*>/i)?.[0];
            if (!csp || !head.test(html)) {
              throw new Error(`Missing native Content Security Policy in ${file}`);
            }

            const securedHtml = html.replace(csp, "").replace(head, (start) => start + csp);
            await writeFile(file, securedHtml);
          }
        },
      },
    },
  ],
});
