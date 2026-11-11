import { createFileRoute } from "@tanstack/react-router";

async function handleAuth(request: Request) {
  const { handler } = await import("@/lib/auth-server");
  return handler(request);
}

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => handleAuth(request),
      POST: ({ request }) => handleAuth(request),
    },
  },
});
