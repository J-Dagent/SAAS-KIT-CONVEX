export interface ConvexDeploymentConfig {
  convexUrl: string;
  convexSiteUrl: string;
}

export interface PublicConvexConfig {
  convexUrl: string;
}

const LOCAL_HOSTS = new Set(["127.0.0.1", "localhost", "::1"]);

export function isLocalConvexUrl(value: string) {
  try {
    return LOCAL_HOSTS.has(new URL(value).hostname);
  } catch {
    return false;
  }
}

export function validateConvexDeploymentConfig(
  config: ConvexDeploymentConfig,
  options: { allowLocal: boolean },
) {
  const convexUrl = config.convexUrl.trim();
  const convexSiteUrl = config.convexSiteUrl.trim();

  if (!convexUrl || !convexSiteUrl) {
    throw new Error(
      "Convex is not configured for this environment. Set VITE_CONVEX_URL and VITE_CONVEX_SITE_URL.",
    );
  }

  for (const [name, value] of [
    ["VITE_CONVEX_URL", convexUrl],
    ["VITE_CONVEX_SITE_URL", convexSiteUrl],
  ] as const) {
    let url: URL;
    try {
      url = new URL(value);
    } catch {
      throw new Error(`${name} must be a valid URL.`);
    }

    if (!options.allowLocal && LOCAL_HOSTS.has(url.hostname)) {
      throw new Error(`${name} cannot target a local host in production.`);
    }

    if (!options.allowLocal && url.protocol !== "https:") {
      throw new Error(`${name} must use HTTPS in production.`);
    }
  }

  return { convexUrl, convexSiteUrl };
}

export function validatePublicConvexConfig(
  config: PublicConvexConfig,
  options: { allowLocal: boolean },
) {
  const convexUrl = config.convexUrl.trim();
  if (!convexUrl) {
    throw new Error("Public Convex is not configured for this environment.");
  }

  let url: URL;
  try {
    url = new URL(convexUrl);
  } catch {
    throw new Error("VITE_CONVEX_URL must be a valid URL.");
  }

  if (!options.allowLocal && LOCAL_HOSTS.has(url.hostname)) {
    throw new Error("VITE_CONVEX_URL cannot target a local host in production.");
  }
  if (!options.allowLocal && url.protocol !== "https:") {
    throw new Error("VITE_CONVEX_URL must use HTTPS in production.");
  }

  return { convexUrl };
}

export function getConvexDeploymentConfig() {
  return validateConvexDeploymentConfig(
    {
      convexUrl: __CONVEX_URL__,
      convexSiteUrl: __CONVEX_SITE_URL__,
    },
    { allowLocal: import.meta.env.DEV },
  );
}

export function getPublicConvexConfig() {
  return validatePublicConvexConfig(
    { convexUrl: __CONVEX_URL__ },
    { allowLocal: import.meta.env.DEV },
  );
}
