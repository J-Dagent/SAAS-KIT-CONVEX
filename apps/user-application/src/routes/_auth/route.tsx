import { createFileRoute, Outlet } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import type { AuthClient } from "@convex-dev/better-auth/react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { GoogleLogin } from "@/components/auth/google-login";
import { authClient } from "@/lib/auth-client";
import { useConvexAuth } from "@convex-dev/react-query";
import { getConvexDeploymentConfig } from "@/config/convex";
import { useState } from "react";

const getAuthToken = createServerFn({ method: "GET" }).handler(async () => {
  const { getToken } = await import("@/lib/auth-server");
  return await getToken();
});

export const Route = createFileRoute("/_auth")({
  beforeLoad: async ({ context }) => {
    const { convexUrl } = getConvexDeploymentConfig();
    const convexQueryClient = context.getConvexQueryClient(convexUrl);
    const token = await getAuthToken();

    if (token) {
      convexQueryClient.serverHttpClient?.setAuth(token);
    }

    return {
      isAuthenticated: Boolean(token),
      token,
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { getConvexQueryClient, token } = Route.useRouteContext();
  const { convexUrl } = getConvexDeploymentConfig();
  const convexQueryClient = getConvexQueryClient(convexUrl);

  return (
    <ConvexBetterAuthProvider
      client={convexQueryClient.convexClient}
      authClient={authClient as unknown as AuthClient}
      initialToken={token}
    >
      <AuthenticatedApplication />
    </ConvexBetterAuthProvider>
  );
}

function AuthenticatedApplication() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const session = authClient.useSession();
  const convexAuth = useConvexAuth();

  return (
    <>
      {session.isPending || convexAuth.isLoading ? (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : session.data && convexAuth.isAuthenticated ? (
        <div className="flex h-screen bg-background overflow-hidden">
          <Sidebar className="flex-shrink-0" />
          
          <div className="flex flex-1 flex-col overflow-hidden">
            <Header 
              onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
            
            <main className="flex-1 overflow-y-auto bg-muted/20 p-6">
              <div className="mx-auto max-w-7xl">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      ) : (
        <GoogleLogin />
      )}
    </>
  );
}
