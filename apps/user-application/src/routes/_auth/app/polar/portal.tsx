import { createFileRoute } from "@tanstack/react-router";
import { protectedRequestMiddleware } from "@/core/middleware/auth";
import { Polar } from "@polar-sh/sdk";
import { env } from "cloudflare:workers";
import { createPostHogClient } from "@/lib/posthog";
import { getPolarServer } from "@/lib/polar";

export const Route = createFileRoute("/_auth/app/polar/portal")({
  server: {
    middleware: [protectedRequestMiddleware],
    handlers: {
      GET: async (ctx) => {
        const posthog = createPostHogClient();
        const polar = new Polar({
          accessToken: env.POLAR_SECRET,
          server: getPolarServer(env.POLAR_SERVER),
        });
        try {
          const customerSession = await polar.customerSessions.create({
            externalCustomerId: ctx.context.userId,
          });
          posthog.capture({
            distinctId: ctx.context.userId,
            event: "customer_portal_opened",
            properties: {
              portal_url: customerSession.customerPortalUrl,
            },
          });
          return new Response(null, {
            status: 302,
            headers: {
              Location: customerSession.customerPortalUrl,
            },
          });
        } catch (err) {
          posthog.captureException(err, ctx.context.userId);
          throw err;
        }
      },
    },
  },
});
