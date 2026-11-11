import { describe, expect, it, vi } from "vitest";

describe("auth server integration", () => {
  it("exports the Better Auth server helpers", async () => {
    vi.stubEnv("VITE_CONVEX_URL", "https://example.convex.cloud");
    vi.stubEnv("VITE_CONVEX_SITE_URL", "https://example.convex.site");
    const { fetchAuthAction, fetchAuthQuery, getToken, handler } = await import(
      "./auth-server"
    );
    expect(fetchAuthAction).toBeTypeOf("function");
    expect(fetchAuthQuery).toBeTypeOf("function");
    expect(getToken).toBeTypeOf("function");
    expect(handler).toBeTypeOf("function");
    vi.unstubAllEnvs();
  });
});
