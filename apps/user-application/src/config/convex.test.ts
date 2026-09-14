import { describe, expect, it } from "vitest";
import {
  isLocalConvexUrl,
  validateConvexDeploymentConfig,
  validatePublicConvexConfig,
} from "./convex";

describe("Convex deployment configuration", () => {
  it("accepts local URLs only for development", () => {
    const config = {
      convexUrl: "http://127.0.0.1:3210",
      convexSiteUrl: "http://127.0.0.1:3211",
    };

    expect(
      validateConvexDeploymentConfig(config, { allowLocal: true }),
    ).toEqual(config);
    expect(() =>
      validateConvexDeploymentConfig(config, { allowLocal: false }),
    ).toThrow("cannot target a local host");
  });

  it("accepts Convex Cloud URLs for production", () => {
    expect(
      validateConvexDeploymentConfig(
        {
          convexUrl: "https://example-project.convex.cloud",
          convexSiteUrl: "https://example-project.convex.site",
        },
        { allowLocal: false },
      ),
    ).toEqual({
      convexUrl: "https://example-project.convex.cloud",
      convexSiteUrl: "https://example-project.convex.site",
    });
  });

  it("recognizes local hosts without treating malformed URLs as local", () => {
    expect(isLocalConvexUrl("http://localhost:3210")).toBe(true);
    expect(isLocalConvexUrl("not-a-url")).toBe(false);
  });

  it("allows a public feature to require only the public Convex URL", () => {
    expect(
      validatePublicConvexConfig(
        { convexUrl: "https://example-project.convex.cloud" },
        { allowLocal: false },
      ),
    ).toEqual({ convexUrl: "https://example-project.convex.cloud" });
  });
});
