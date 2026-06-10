// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // Disable Cloudflare adapter so we can deploy as static SPA (Vercel/Netlify/etc.)
  cloudflare: false,
  tanstackStart: {
    // SPA mode: prerender a single shell, route on the client.
    // Output goes to .output/public as plain static files.
    spa: {
      enabled: true,
    },
  },
});
