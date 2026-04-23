export type AuthenticatedAppState = {
  hasMembership: boolean;
  hasSite: boolean;
};

export function resolveAuthenticatedAppPath({
  hasMembership,
  hasSite,
}: AuthenticatedAppState) {
  if (!hasMembership) {
    return "/onboarding";
  }

  return hasSite ? "/app/dashboard" : "/app";
}
