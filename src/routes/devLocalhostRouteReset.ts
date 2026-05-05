const localDevHostnames = new Set(["localhost", "127.0.0.1", "::1"]);

const isKakaoOAuthCallback = (pathname: string, searchParams: URLSearchParams) =>
  pathname === "/auth" &&
  (searchParams.has("code") ||
    searchParams.has("error") ||
    searchParams.has("error_description"));

const isRestoredReactRouterEntry = () => {
  const historyState = window.history.state as { idx?: unknown } | null;

  return typeof historyState?.idx === "number" && historyState.idx > 0;
};

export const resetRestoredLocalhostRoute = () => {
  if (!import.meta.env.DEV || !localDevHostnames.has(window.location.hostname)) {
    return;
  }

  const { pathname, search } = window.location;

  if (pathname === "/" || isKakaoOAuthCallback(pathname, new URLSearchParams(search))) {
    return;
  }

  if (!isRestoredReactRouterEntry()) {
    return;
  }

  window.history.replaceState(null, "", "/");
};
