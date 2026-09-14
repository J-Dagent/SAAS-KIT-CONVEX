import { defineConfig, loadEnv } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";

function readProductionConvexUrl(name: string, hostnameSuffix: string) {
  const value = process.env[name];
  if (!value) return "";

  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.endsWith(hostnameSuffix)
      ? value
      : "";
  } catch {
    return "";
  }
}

const config = defineConfig(({ mode }) => {
  const localEnv = loadEnv(mode, process.cwd(), "VITE_CONVEX_");
  const useShellOnly = mode === "production";
  const convexUrl = useShellOnly
    ? readProductionConvexUrl("VITE_CONVEX_URL", ".convex.cloud")
    : localEnv.VITE_CONVEX_URL ?? "";
  const convexSiteUrl = useShellOnly
    ? readProductionConvexUrl("VITE_CONVEX_SITE_URL", ".convex.site")
    : localEnv.VITE_CONVEX_SITE_URL ?? "";

  return {
    envDir: useShellOnly ? false : undefined,
    define: {
      __CONVEX_URL__: JSON.stringify(convexUrl),
      __CONVEX_SITE_URL__: JSON.stringify(convexSiteUrl),
    },
    ssr: {
      noExternal: ["@convex-dev/better-auth"],
    },
    plugins: [
      viteTsConfigPaths({
        projects: ["./tsconfig.json"],
      }),
      tailwindcss(),
      tanstackStart({
        srcDirectory: "src",
        start: { entry: "./start.tsx" },
        server: { entry: "./server.ts" },
      }),
      viteReact(),
      cloudflare(
        useShellOnly
          ? {
              configPath: "./config/cloudflare/wrangler.production.jsonc",
              inspectorPort: false,
              viteEnvironment: { name: "ssr" },
            }
          : {
              inspectorPort: false,
              viteEnvironment: { name: "ssr" },
            },
      ),
    ],
  };
});

export default config;
