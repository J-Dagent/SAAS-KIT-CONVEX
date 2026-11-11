import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const envPath = fileURLToPath(new URL("../.env.local", import.meta.url));

function readValue(source, key) {
  const match = source.match(new RegExp(`^${key}=(.*)$`, "m"));
  if (!match) return undefined;
  return match[1]
    .trim()
    .split(/\s+#/, 1)[0]
    .replace(/^(['"])(.*)\1$/, "$2");
}

if (process.env.CONVEX_DEPLOY_KEY?.trim()) process.exit(0);

if (!existsSync(envPath)) {
  throw new Error(
    "Connect a Convex Cloud deployment before running this command: pnpm --filter @repo/backend exec convex dev --configure existing --dev-deployment cloud --once",
  );
}

const env = readFileSync(envPath, "utf8");
const deployment = readValue(env, "CONVEX_DEPLOYMENT");

if (!/^(?:dev|prod):[a-z0-9-]+$/.test(deployment ?? "")) {
  throw new Error(
    "CONVEX_DEPLOYMENT must select a Convex Cloud deployment. Local Convex deployments are not supported by this project.",
  );
}
