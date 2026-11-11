import { redirect } from "@tanstack/react-router";

export function requireAuthenticatedRoute(context: {
  isAuthenticated?: boolean;
}) {
  if (!context.isAuthenticated) {
    throw redirect({ to: "/app" });
  }
}
