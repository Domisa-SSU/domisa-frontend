import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuthMeQuery } from "../queries/auth";

type DatingRegisterRouteProps = {
  children: ReactNode;
};

const fallbackPath = "/";

const isSafeInternalPath = (value: unknown): value is string =>
  typeof value === "string" && value.startsWith("/") && !value.startsWith("//");

const getSafeRedirectPath = (
  value: unknown,
  currentPath: string,
) => {
  if (!isSafeInternalPath(value) || value === currentPath) {
    return null;
  }

  return value;
};

const getCurrentPath = (location: ReturnType<typeof useLocation>) =>
  `${location.pathname}${location.search}${location.hash}`;

const getOriginPath = (location: ReturnType<typeof useLocation>) => {
  const currentPath = getCurrentPath(location);
  const returnTo = new URLSearchParams(location.search).get("returnTo");
  const returnToPath = getSafeRedirectPath(returnTo, currentPath);

  if (returnToPath) {
    return returnToPath;
  }

  const from = (location.state as { from?: unknown } | null)?.from;
  const fromPath = getSafeRedirectPath(from, currentPath);

  return fromPath ?? fallbackPath;
};

function DatingRegisterRoute({ children }: DatingRegisterRouteProps) {
  const location = useLocation();
  const { data: authMe, isPending } = useAuthMeQuery();
  const currentPath = getCurrentPath(location);
  const encodedReturnTo = encodeURIComponent(currentPath);
  const flowOrigin = { from: currentPath };

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-grey-100">
        <div
          role="status"
          aria-label="소개팅 프로필 등록 권한 확인 중"
          className="h-10 w-10 animate-spin rounded-full border-[0.1875rem] border-primary-200 border-t-primary-500"
        />
      </div>
    );
  }

  if (!authMe) {
    return (
      <Navigate
        to={`/auth?returnTo=${encodedReturnTo}`}
        replace
        state={flowOrigin}
      />
    );
  }

  if (authMe.status.isRegistered !== true) {
    return (
      <Navigate
        to={`/auth/signup?returnTo=${encodedReturnTo}`}
        replace
        state={flowOrigin}
      />
    );
  }

  if (authMe.status.isProfileCompleted === true) {
    return <Navigate to={getOriginPath(location)} replace />;
  }

  return children;
}

export default DatingRegisterRoute;
