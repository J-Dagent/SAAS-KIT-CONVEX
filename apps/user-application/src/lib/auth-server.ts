import { convexBetterAuthReactStart } from "@convex-dev/better-auth/react-start";

export const {
  fetchAuthAction,
  fetchAuthMutation,
  fetchAuthQuery,
  getToken,
  handler,
} = convexBetterAuthReactStart({
  convexUrl: import.meta.env.VITE_CONVEX_URL,
  convexSiteUrl: import.meta.env.VITE_CONVEX_SITE_URL,
});
