import { describe, expect, it } from "vitest";
import { resolveAuthenticatedAppPath } from "@/lib/auth-routing";

describe("resolveAuthenticatedAppPath", () => {
  it("sends a user without membership to onboarding", () => {
    expect(
      resolveAuthenticatedAppPath({
        hasMembership: false,
        hasSite: false,
      }),
    ).toBe("/onboarding");
  });

  it("sends a user with membership but without site to the app entry", () => {
    expect(
      resolveAuthenticatedAppPath({
        hasMembership: true,
        hasSite: false,
      }),
    ).toBe("/app");
  });

  it("sends a user with membership and site to dashboard", () => {
    expect(
      resolveAuthenticatedAppPath({
        hasMembership: true,
        hasSite: true,
      }),
    ).toBe("/app/dashboard");
  });
});
