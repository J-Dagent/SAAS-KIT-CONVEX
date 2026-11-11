import { createFileRoute } from "@tanstack/react-router";
import { api } from "@repo/backend/convex/_generated/api";
import { createPostHogClient } from "@/lib/posthog";

export const Route = createFileRoute("/_auth/app/polar/portal")({
  server: {
    handlers: {
      GET: async () => {
        const { fetchAuthAction, fetchAuthQuery } = await import(
          "@/lib/auth-server"
        );
        const posthog = createPostHogClient();
        try {
          const [user, customerSession] = await Promise.all([
            fetchAuthQuery(api.auth.getAuthUser, {}),
            fetchAuthAction(api.billing.generateCustomerPortalUrl, {}),
          ]);
          posthog?.capture({
            distinctId: user._id,
            event: "customer_portal_opened",
            properties: {
              portal_url: customerSession.url,
            },
          });
          return new Response(null, {
            status: 302,
            headers: {
              Location: customerSession.url,
            },
          });
        } catch (err) {
          posthog?.captureException(err);
          throw err;
        } finally {
          await posthog?.shutdown();
        }
      },
    },
  },
});
