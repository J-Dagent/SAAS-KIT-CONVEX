import { Polar } from "@convex-dev/polar";
import type { GenericCtx } from "@convex-dev/better-auth";
import { query } from "./_generated/server";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { authComponent } from "./auth";

export const polar = new Polar<DataModel>(components.polar, {
  getUserInfo: async (ctx) => {
    const user = await authComponent.getAuthUser(
      ctx as GenericCtx<DataModel>,
    );
    return { userId: user._id, email: user.email };
  },
});

export const {
  cancelCurrentSubscription,
  changeCurrentSubscription,
  generateCheckoutLink,
  generateCustomerPortalUrl,
  getConfiguredProducts,
  listAllProducts,
  listAllSubscriptions,
} = polar.api();

export const getCurrentSubscription = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    return await polar.getCurrentSubscription(ctx, { userId: user._id });
  },
});
