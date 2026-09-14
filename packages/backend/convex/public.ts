import { MINUTE, RateLimiter } from "@convex-dev/rate-limiter";
import { ConvexError, v } from "convex/values";
import { components } from "./_generated/api";
import { mutation } from "./_generated/server";

const rateLimiter = new RateLimiter(components.rateLimiter, {
  anonymousRequests: {
    kind: "token bucket",
    rate: 5,
    period: MINUTE,
    capacity: 3,
  },
  anonymousRequestsGlobal: {
    kind: "fixed window",
    rate: 120,
    period: MINUTE,
    shards: 10,
  },
});

const requestKind = v.union(v.literal("form"), v.literal("agent"));

export const submitAnonymousRequest = mutation({
  args: {
    anonymousId: v.string(),
    body: v.string(),
    kind: requestKind,
  },
  returns: v.object({ requestId: v.id("anonymousRequests") }),
  handler: async (ctx, args) => {
    const anonymousId = args.anonymousId.trim();
    const body = args.body.trim();

    if (!/^[A-Za-z0-9_-]{16,96}$/.test(anonymousId)) {
      throw new ConvexError("Invalid anonymous identifier.");
    }
    if (body.length < 2 || body.length > 4_000) {
      throw new ConvexError("Body must contain between 2 and 4,000 characters.");
    }

    await rateLimiter.limit(ctx, "anonymousRequestsGlobal", { throws: true });
    await rateLimiter.limit(ctx, "anonymousRequests", {
      key: anonymousId,
      throws: true,
    });

    const requestId = await ctx.db.insert("anonymousRequests", {
      body,
      kind: args.kind,
      createdAt: Date.now(),
    });
    return { requestId };
  },
});
