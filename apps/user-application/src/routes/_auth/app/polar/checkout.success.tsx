import { collectSubscription, validPayment } from "@/core/functions/payments";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";

const searchSchema = z.object({
  checkout_id: z.string(),
});

export const Route = createFileRoute("/_auth/app/polar/checkout/success")({
  component: RouteComponent,
  validateSearch: (search) => searchSchema.parse(search),
  beforeLoad: async ({ search }) => {
    return search;
  },
  loader: async (input) => {
    const isValid = await validPayment({
      data: input.context.checkout_id,
    });
    return {
      isValid,
      checkoutId: input.context.checkout_id,
    };
  },
  errorComponent: ({ error }) => {
    return (
      <div className="h-ful flex flex-col items-center justify-center bg-background px-6 py-12">
        <div className="max-w-lg w-full text-center space-y-8">
          <div className="flex justify-center">
            <AlertCircle className="w-16 h-16 text-destructive" />
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Erreur de paiement</h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
              Une erreur est survenue pendant le traitement de votre paiement.
            </p>
          </div>

          <div className="pt-8">
            <p className="text-sm text-muted-foreground font-mono">
              {error.message}
            </p>
          </div>
        </div>
      </div>
    );
  },
});

function RouteComponent() {
  const loaderData = Route.useLoaderData();
  const nav = Route.useNavigate();

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: [loaderData.checkoutId],
    queryFn: collectSubscription,
    refetchInterval: (query) => {
      if (!query.state.data) {
        return 2000;
      }
      return false;
    },
  });

  const getStatus = () => {
    if (error) return "error";
    if (data) return "success";
    if (isFetching || isLoading) return "processing";
    return "processing";
  };

  const status = getStatus();

  const getStatusIcon = () => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="w-16 h-16 text-primary" />;
      case "error":
        return <AlertCircle className="w-16 h-16 text-destructive" />;
      default:
        return <Loader2 className="w-12 h-12 text-primary animate-spin" />;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case "success":
        return {
          title: "Paiement confirmé !",
          description: "Votre abonnement a bien été activé.",
        };
      case "error":
        return {
          title: "Erreur de traitement du paiement",
          description:
            "Le paiement n’a pas pu être traité. Veuillez contacter l’assistance.",
        };
      default:
        return {
          title: "Traitement de votre paiement",
          description:
            "Nous vérifions les détails du paiement. Cela peut prendre quelques instants…",
        };
    }
  };

  const { title, description } = getStatusMessage();

  return (
    <div className="h-full flex flex-col items-center justify-center bg-background px-6 py-12">
      <div className="max-w-lg w-full text-center space-y-8">
        <div className="flex justify-center">{getStatusIcon()}</div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
            {description}
          </p>
        </div>

        <div className="space-y-6">
          {status === "success" && (
            <Button
              onClick={() => nav({ to: "/app" })}
              size="lg"
              className="px-8 py-3"
            >
              Continuer vers le tableau de bord
            </Button>
          )}

          {status === "error" && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="lg"
                className="px-6"
              >
                Réessayer
              </Button>
              <Button
                onClick={() => nav({ to: "/app/polar/subscriptions" })}
                size="lg"
                className="px-6"
              >
                Retour aux offres
              </Button>
            </div>
          )}
        </div>

        <div className="pt-8">
          <p className="text-sm text-muted-foreground">
            Identifiant de transaction :{" "}
            <span className="font-mono text-foreground">
              {loaderData.checkoutId.slice(-8)}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
