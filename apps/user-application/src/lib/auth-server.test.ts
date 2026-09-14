import { describe, expect, it } from "vitest";
import {
  fetchAuthAction,
  fetchAuthQuery,
  getToken,
  handler,
} from "./auth-server";

describe("lazy auth server integration", () => {
  it("can be imported without a configured Convex deployment", () => {
    expect(fetchAuthAction).toBeTypeOf("function");
    expect(fetchAuthQuery).toBeTypeOf("function");
    expect(getToken).toBeTypeOf("function");
    expect(handler).toBeTypeOf("function");
  });
});
