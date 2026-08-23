import { Polar } from "@polar-sh/sdk";
import { createMiddleware } from "@tanstack/react-start";
import { env } from "cloudflare:workers";
import { getPolarServer } from "@/lib/polar";

export const polarMiddleware = createMiddleware({
  type: "function",
}).server(async ({ next }) => {
  const polar = new Polar({
    accessToken: env.POLAR_SECRET,
    server: getPolarServer(env.POLAR_SERVER),
  });
  return next({
    context: {
      polar,
    },
  });
});
