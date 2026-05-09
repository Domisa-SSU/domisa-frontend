import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuthMeQuery } from "../queries/auth";

type CompletedFlow = "signup" | "datingRegister";

type CompletedFlowRouteProps = {
  children: ReactNode;
  flow: CompletedFlow;
};

const fallbackPath = "/";

const isSafeInternalPath = (value: unknown): value is string =>
  typeof value === "string" && value.startsWith("/") && !value.startsWith("//");

const getOriginPath = (location: ReturnType<typeof useLocation>) => {
  const from = (location.state as { from?: unknown } | null)?.from;

  if (!isSafeInternalPath(from)) {
    return fallbackPath;
  }

  const currentPath = `${location.pathname}${location.search}${location.hash}`;

  return from === currentPath ? fallbackPath : from;
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

  if (!authMe) {
    return children;
  }

  const isCompleted =
    flow === "signup"
      ? authMe.status.isRegistered === true
      : authMe.status.isProfileCompleted === true;

  if (isCompleted) {
    return <Navigate to={getOriginPath(location)} replace />;
  }

  return children;
}

export default CompletedFlowRoute;
