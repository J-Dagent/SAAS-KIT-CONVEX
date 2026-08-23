# Polar billing with Convex

## Architecture

The pricing, checkout, success, subscription, and customer portal screens keep the same React UI. `@convex-dev/polar` now owns the backend integration.

```text
Pricing UI
  -> Convex query for synchronized products and subscription state
  -> Convex action for checkout or customer portal URL
  -> Polar sandbox or production
  -> webhook to /polar/events on the Convex site
  -> reactive subscription update in the UI
```

The Convex component stores synchronized Polar products, customers, and subscriptions in its isolated tables. PostgreSQL subscription tables and direct TanStack Polar middleware are not used.

## Create Polar credentials

Use Polar sandbox for development. Create an organization token with the permissions required for products, subscriptions, customers, checkouts, checkout links, and customer portal sessions.

Set the values on the Convex development deployment:

```bash
pnpm --filter @repo/backend exec convex env set POLAR_ORGANIZATION_TOKEN your-token
pnpm --filter @repo/backend exec convex env set POLAR_WEBHOOK_SECRET your-webhook-secret
pnpm --filter @repo/backend exec convex env set POLAR_SERVER sandbox
```

Do not put live tokens in `.env` examples or documentation.

## Configure the webhook

Create a Polar webhook with this endpoint:

```text
https://your-deployment.convex.site/polar/events
```

Enable at least these events:

- `product.created`
- `product.updated`
- `subscription.created`
- `subscription.updated`

`packages/backend/convex/http.ts` registers the webhook route. The component verifies the webhook secret before updating its tables.

## Products

Create subscription products in the Polar dashboard. New product events synchronize them to Convex. If products existed before the integration, run the component's `syncProducts` action once from a safe development deployment.

The pricing route reads `api.billing.listAllProducts`. Product names, descriptions, prices, recurrence, benefits, and metadata feed the existing cards.

## Checkout

The checkout button calls `api.billing.generateCheckoutLink`. The action derives the authenticated Better Auth user on the backend and maps that user to a Polar customer. The browser then navigates to the returned checkout URL.

The success URL keeps the established route:

```text
/app/polar/checkout/success?checkout_id={CHECKOUT_ID}
```

The success page subscribes to `api.billing.getCurrentSubscription`. It changes from processing to confirmed when the Polar webhook updates Convex. No polling or manual TanStack Query invalidation is needed.

## Customer portal

`/app/polar/portal` remains the public application route. Its server handler calls the authenticated Convex action `api.billing.generateCustomerPortalUrl` and redirects to the returned Polar portal URL.

## Frontend data flow

The subscription route preloads products and the current subscription during SSR, then resumes both as live Convex queries in the browser:

```ts
await Promise.all([
  queryClient.prefetchQuery(convexQuery(api.billing.listAllProducts, {})),
  queryClient.prefetchQuery(
    convexQuery(api.billing.getCurrentSubscription, {}),
  ),
]);
```

`PricingGrid` and `PricingCard` remain presentation components. Their types derive from the generated Convex function return types, so the UI stays aligned with the component API without a duplicate hand-written billing schema.

## Product metadata and prices

The existing cards preserve metadata-driven feature lists. Add product metadata keys containing `feature`, for example:

```text
feature_1 = Unlimited projects
feature_2 = Priority support
```

Cards support recurring fixed prices and custom price ranges. Keep display decisions in the UI and billing authority in Polar. Do not infer subscription access from product metadata; use the synchronized subscription record and its status.

## Checkout action

The client uses a Convex action because checkout creation calls Polar:

```ts
const generateCheckoutLink = useConvexAction(
  api.billing.generateCheckoutLink,
);

const checkout = await generateCheckoutLink({
  productIds: [productId],
  origin: window.location.origin,
  successUrl: `${window.location.origin}/app/polar/checkout/success?checkout_id={CHECKOUT_ID}`,
  locale: "fr",
});

window.location.href = checkout.url;
```

The backend component supplies the authenticated customer identity. The browser supplies navigation URLs and the selected product only.

## Authentication and identity

Billing functions never accept a user ID from the browser. `packages/backend/convex/billing.ts` reads the Better Auth user from the authenticated Convex context and supplies that stable component user ID and email to Polar.

## Failure modes

- No products: create products in the active Polar environment or run the component sync action after configuring the token.
- Checkout action failure: confirm the organization token permissions, product ID, and `POLAR_SERVER` value.
- Success page stays processing: confirm the webhook URL, secret, and subscribed events, then inspect the Convex function logs.
- Portal failure: confirm the signed-in user has a synchronized Polar customer and subscription.
- Sandbox/production mismatch: product IDs and credentials are environment-specific and must not be mixed.

## Development and production

Keep `POLAR_SERVER=sandbox` during local and staging validation. Before production:

1. Create production products and an organization token.
2. Set production Convex environment variables.
3. Create the production webhook against the production Convex site URL.
4. Verify checkout, webhook synchronization, subscription display, and portal access.

Do not deploy or switch to Polar production as part of routine template validation.
