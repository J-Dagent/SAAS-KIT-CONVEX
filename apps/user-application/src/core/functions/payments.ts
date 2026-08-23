import { createServerFn } from "@tanstack/react-start";
import { protectedFunctionMiddleware } from "@/core/middleware/auth";
import { polarMiddleware } from "@/core/middleware/polar";
import z from "zod";
import { getRequestIP } from "@tanstack/react-start/server";
import { createPostHogClient } from "@/lib/posthog";
import { env } from "cloudflare:workers";

export const baseFunction = createServerFn().middleware([
  protectedFunctionMiddleware,
  polarMiddleware,
]);

export const getProducts = baseFunction.handler(async (ctx) => {
  const products = await ctx.context.polar.products.list({
    isArchived: false,
  });

  return products.result.items;
});

const PaymentLink = z.object({
  productId: z.string(),
});

export const createPaymentLink = baseFunction
  .validator((data: z.infer<typeof PaymentLink>) => {
    return PaymentLink.parse(data);
  })
  .handler(async (ctx) => {
    const posthog = createPostHogClient();
    const ip = getRequestIP();
    try {
      const checkout = await ctx.context.polar.checkouts.create({
        products: [ctx.data.productId],
        externalCustomerId: ctx.context.userId,
        successUrl: `${env.BETTER_AUTH_URL || "http://localhost:3000"}/app/polar/checkout/success?checkout_id={CHECKOUT_ID}`,
        customerIpAddress: ip,
        customerEmail: ctx.context.email,
      });
      posthog.capture({
        distinctId: ctx.context.userId,
        event: "checkout_initiated",
        properties: {
          product_id: ctx.data.productId,
          checkout_id: checkout.id,
          checkout_url: checkout.url,
        },
      });
      return checkout;
    } catch (err) {
      posthog.captureException(err, ctx.context.userId, {
        product_id: ctx.data.productId,
      });
      throw err;
    }
  });

export const validPayment = baseFunction
  .validator((data: string) => {
    console.log("validatePayment", data);
    if (typeof data !== "string") {
      throw new Error("Invalid data type");
    }
    return data;
  })
  .handler(async (ctx) => {
    const posthog = createPostHogClient();
    try {
      const payment = await ctx.context.polar.checkouts.get({
        id: ctx.data,
      });
      console.log(payment);
      if (payment.status === "succeeded") {
        posthog.capture({
          distinctId: ctx.context.userId,
          event: "checkout_succeeded",
          properties: {
            checkout_id: ctx.data,
            product_id: payment.productId,
          },
        });
        return true;
      }
      return false;
    } catch (err) {
      posthog.captureException(err, ctx.context.userId, {
        checkout_id: ctx.data,
      });
      throw err;
    }
  });

export const collectSubscription = baseFunction.handler(async (ctx) => {
  const posthog = createPostHogClient();
  try {
    const subscriptions = await ctx.context.polar.subscriptions.list({
      externalCustomerId: ctx.context.userId,
    });
    if (subscriptions.result.items.length === 0) {
      return null;
    }
    const subscription = subscriptions.result.items[0]!;
    posthog.capture({
      distinctId: ctx.context.userId,
      event: "subscription_collected",
      properties: {
        subscription_id: subscription.id,
        subscription_status: subscription.status,
        product_id: subscription.productId,
      },
    });
    return subscription;
  } catch (err) {
    posthog.captureException(err, ctx.context.userId);
    throw err;
  }
});
