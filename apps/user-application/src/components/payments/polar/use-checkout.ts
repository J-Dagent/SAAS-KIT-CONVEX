import { useMutation } from "@tanstack/react-query";
import { useConvexAction } from "@convex-dev/react-query";
import { api } from "@repo/backend/convex/_generated/api";

export function useCheckout() {
  const generateCheckoutLink = useConvexAction(
    api.billing.generateCheckoutLink,
  );
  const checkoutMutation = useMutation({
    mutationFn: async (productId: string) => {
      return await generateCheckoutLink({
        productId,
        locale: "fr",
      });
    },
  });

  const redirectToCheckout = (productId: string) => {
    checkoutMutation.mutate(productId, {
      onSuccess(data) {
        window.location.href = data.url;
      },
    });
  };

  return {
    redirectToCheckout,
    isCheckoutPending: checkoutMutation.isPending,
  };
}
