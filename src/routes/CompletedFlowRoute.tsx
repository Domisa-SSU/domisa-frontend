import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuthMeQuery } from "../queries/auth";

type CompletedFlow = "signup";

type CompletedFlowRouteProps = {
  children: ReactNode;
  flow: CompletedFlow;
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

const hasAcceptedSignupTerms = (location: ReturnType<typeof useLocation>) => {
  const state = location.state as { signupTermsAccepted?: unknown } | null;

  return state?.signupTermsAccepted === true;
};

const createAuthPathForSignupTerms = (
  location: ReturnType<typeof useLocation>,
) => {
  const currentPath = getCurrentPath(location);
  const searchParams = new URLSearchParams({ returnTo: currentPath });

  return `/auth?${searchParams.toString()}`;
};

function CompletedFlowRoute({ children, flow }: CompletedFlowRouteProps) {
  const location = useLocation();
  const { data: authMe, isPending } = useAuthMeQuery();

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-grey-100">
        <div
          role="status"
          aria-label="사용자 정보 확인 중"
          className="h-10 w-10 animate-spin rounded-full border-[0.1875rem] border-primary-200 border-t-primary-500"
        />
      </div>
    );
  }

  const isCompleted = flow === "signup" && authMe?.status.isRegistered === true;

  if (isCompleted) {
    return <Navigate to={getOriginPath(location)} replace />;
  }

  if (flow === "signup" && !hasAcceptedSignupTerms(location)) {
    return (
      <Navigate
        to={createAuthPathForSignupTerms(location)}
        replace
        state={{ from: getCurrentPath(location) }}
      />
    );
  }

  return children;
}

export default CompletedFlowRoute;
