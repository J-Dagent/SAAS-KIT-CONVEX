import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";

const config = defineConfig(({ mode }) => {
  const useShellOnly = mode === "production";

  return {
    envDir: useShellOnly ? false : undefined,
    resolve: {
      tsconfigPaths: true,
    },
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: "react",
                test: /node_modules[\\/]\.pnpm[\\/]react(-dom)?@/,
              },
            ],
          },
        },
      },
    },
    ssr: {
      noExternal: ["@convex-dev/better-auth", "convex"],
    },
    plugins: [
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
