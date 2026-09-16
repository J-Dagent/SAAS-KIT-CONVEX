import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const backendEnvPath = fileURLToPath(new URL("../.env.local", import.meta.url));
const appEnvPath = fileURLToPath(
  new URL("../../../apps/user-application/.env.local", import.meta.url),
);

function readValue(source, key) {
  const line = source
    .split(/\r?\n/)
    .find((candidate) => candidate.startsWith(`${key}=`));
  if (!line) return undefined;

  const rawValue = line.slice(key.length + 1).trim().split(/\s+#/, 1)[0];
  if (
    (rawValue.startsWith('"') && rawValue.endsWith('"')) ||
    (rawValue.startsWith("'") && rawValue.endsWith("'"))
  ) {
    return rawValue.slice(1, -1);
  }
  return rawValue;
}

function requireCloudUrl(value, suffix, name) {
  if (!value) return undefined;

  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} must be a valid URL.`);
  }

  if (url.protocol !== "https:" || !url.hostname.endsWith(suffix)) {
    throw new Error(`${name} must use HTTPS and target ${suffix}.`);
  }

  return url.origin;
}

if (!existsSync(backendEnvPath)) {
  throw new Error(
    "Convex has not created packages/backend/.env.local yet. Run `pnpm --filter @repo/backend setup` first.",
  );
}

if (existsSync(appEnvPath)) {
  const currentAppEnv = readFileSync(appEnvPath, "utf8");
  if (
    readValue(currentAppEnv, "VITE_CONVEX_URL") &&
    readValue(currentAppEnv, "VITE_CONVEX_SITE_URL")
  ) {
    console.log("Frontend Convex URLs are already configured; .env.local was left unchanged.");
    process.exit(0);
  }

  throw new Error(
    "apps/user-application/.env.local already exists but does not contain both Convex URLs. It was left unchanged; add VITE_CONVEX_URL and VITE_CONVEX_SITE_URL manually.",
  );
}

const backendEnv = readFileSync(backendEnvPath, "utf8");
const deployment = readValue(backendEnv, "CONVEX_DEPLOYMENT");
const deploymentName = deployment?.match(/^(?:dev|prod):([a-z0-9-]+)$/)?.[1];

if (!deploymentName) {
  throw new Error(
    "packages/backend/.env.local must select a Convex Cloud deployment with CONVEX_DEPLOYMENT.",
  );
}

const convexUrl = requireCloudUrl(
  readValue(backendEnv, "CONVEX_URL") ??
    `https://${deploymentName}.convex.cloud`,
  ".convex.cloud",
  "CONVEX_URL",
);
const convexSiteUrl = requireCloudUrl(
  readValue(backendEnv, "CONVEX_SITE_URL") ??
    `https://${deploymentName}.convex.site`,
  ".convex.site",
  "CONVEX_SITE_URL",
);

writeFileSync(
  appEnvPath,
  [
    "# Generated once from the selected Convex Cloud deployment; safe to customize locally.",
    `VITE_CONVEX_URL=${JSON.stringify(convexUrl)}`,
    `VITE_CONVEX_SITE_URL=${JSON.stringify(convexSiteUrl)}`,
    'VITE_SITE_URL="http://localhost:3000"',
    "",
  ].join("\n"),
  { flag: "wx" },
);

console.log("Created apps/user-application/.env.local with Convex Cloud URLs.");
