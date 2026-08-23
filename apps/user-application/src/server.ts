// DO NOT DELETE THIS FILE!!!
// This file is a good smoke test to make sure the custom server entry is working
import { setAuth } from "@repo/data-ops/auth/server";
import { initDatabase } from "@repo/data-ops/database/setup";
import handler from "@tanstack/react-start/server-entry";

console.log("[server-entry]: using custom server entry in 'src/server.ts'");

export default {
  fetch(request: Request, env: any) {
    const db = initDatabase({
      host: env.DATABASE_HOST,
      username: env.DATABASE_USERNAME,
      password: env.DATABASE_PASSWORD,
    });

    const url = new URL(request.url);
    const origin = `${url.protocol}//${url.host}`;

    console.log("[server-entry]: initializing auth with baseURL:", env.BETTER_AUTH_URL || origin);

    setAuth({
      secret: env.BETTER_AUTH_SECRET,
      baseURL: env.BETTER_AUTH_URL || origin,
      socialProviders: {
        google: {
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
        },
      },
      adapter: {
        drizzleDb: db,
        provider: "pg",
      },
    });
    return handler.fetch(request, {
      context: {
        fromFetch: true,
      },
    });
  },
};
