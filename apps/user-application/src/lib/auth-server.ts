import { convexBetterAuthReactStart } from "@convex-dev/better-auth/react-start";
import { getConvexDeploymentConfig } from "@/config/convex";

function createAuthIntegration() {
  const { convexUrl, convexSiteUrl } = getConvexDeploymentConfig();
  return convexBetterAuthReactStart({ convexUrl, convexSiteUrl });
}

type AuthIntegration = ReturnType<typeof createAuthIntegration>;

let integration: AuthIntegration | undefined;

function getAuthIntegration() {
  integration ??= createAuthIntegration();
  return integration;
}

function lazyAuthFunction<Key extends keyof AuthIntegration>(
  key: Key,
): AuthIntegration[Key] {
  return ((...args: unknown[]) => {
    const implementation = getAuthIntegration()[key] as (
      ...callArgs: unknown[]
    ) => unknown;
    return implementation(...args);
  }) as AuthIntegration[Key];
}

export const fetchAuthAction = lazyAuthFunction("fetchAuthAction");
export const fetchAuthMutation = lazyAuthFunction("fetchAuthMutation");
export const fetchAuthQuery = lazyAuthFunction("fetchAuthQuery");
export const getToken = lazyAuthFunction("getToken");
export const handler = lazyAuthFunction("handler");
