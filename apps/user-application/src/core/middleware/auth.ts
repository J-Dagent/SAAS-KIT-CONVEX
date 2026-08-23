import { getAuth } from "@repo/data-ops/auth/server";
import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createPostHogClient } from "@/lib/posthog";

async function getAuthContext() {
  const auth = getAuth();
  const req = getRequest();

  const session = await auth.api.getSession(req);
  if (!session) {
    throw new Error("Unauthorized");
  }

  const posthog = createPostHogClient();
  posthog.identify({
    distinctId: session.user.id,
    properties: {
      email: session.user.email,
      name: session.user.name,
      $set_once: { first_seen: new Date().toISOString() },
    },
  });

  return {
    auth: auth,
    userId: session.user.id,
    email: session.user.email,
  };
}

export const protectedFunctionMiddleware = createMiddleware({
  type: "function",
}).server(async ({ next }) => {
  const context = await getAuthContext();
  return next({ context });
});

export const protectedRequestMiddleware = createMiddleware({
  type: "request",
}).server(async ({ next }) => {
  const context = await getAuthContext();
  return next({ context });
});
