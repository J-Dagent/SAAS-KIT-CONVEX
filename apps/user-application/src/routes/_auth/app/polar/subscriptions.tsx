import { api } from "@repo/backend/convex/_generated/api";
import { convexQuery } from "@convex-dev/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PricingGrid, useCheckout } from "@/components/payments/polar";
import { requireAuthenticatedRoute } from "@/lib/route-auth";

export const Route = createFileRoute("/_auth/app/polar/subscriptions")({
  component: RouteComponent,
  loader: async ({ context }) => {
    requireAuthenticatedRoute(context);
    await Promise.all([
      context.queryClient.prefetchQuery(
        convexQuery(api.billing.listAllProducts, {}),
      ),
      context.queryClient.prefetchQuery(
        convexQuery(api.billing.getCurrentSubscription, {}),
      ),
    ]);
  },
});

function RouteComponent() {
  const { data: products } = useSuspenseQuery(
    convexQuery(api.billing.listAllProducts, {}),
  );

  const { data: subscription } = useSuspenseQuery(
    convexQuery(api.billing.getCurrentSubscription, {}),
  );

  const { redirectToCheckout, isCheckoutPending } = useCheckout();

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Choisissez votre offre</h1>
        <p className="text-muted-foreground">
          Sélectionnez l’offre adaptée à vos besoins
        </p>
      </div>

      <PricingGrid
        products={products}
        subscription={subscription}
        onCheckout={redirectToCheckout}
        isCheckoutPending={isCheckoutPending}
      />
    </div>
  );
}
