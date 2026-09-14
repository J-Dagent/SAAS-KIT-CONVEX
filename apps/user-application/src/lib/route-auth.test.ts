import { describe, expect, it } from "vitest";
import { requireAuthenticatedRoute } from "./route-auth";

describe("private route guard", () => {
  it("allows authenticated loaders", () => {
    expect(() =>
      requireAuthenticatedRoute({ isAuthenticated: true }),
    ).not.toThrow();
  });

  it("redirects unauthenticated loaders", () => {
    expect(() =>
      requireAuthenticatedRoute({ isAuthenticated: false }),
    ).toThrow();
  });
});
