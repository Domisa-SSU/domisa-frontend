import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuthMeQuery } from "../queries/auth";

const createSafeReturnTo = (location: ReturnType<typeof useLocation>) => {
  const returnTo = `${location.pathname}${location.search}${location.hash}`;

  return returnTo.startsWith("/") && !returnTo.startsWith("//")
    ? returnTo
    : "/";
};

function RegisteredOnlyRoute({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { data: authMe, isPending } = useAuthMeQuery();
  const returnTo = createSafeReturnTo(location);
  const encodedReturnTo = encodeURIComponent(returnTo);

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
    return <Navigate to={`/auth?returnTo=${encodedReturnTo}`} replace />;
  }

  if (authMe.status.isRegistered !== true) {
    return <Navigate to={`/auth/signup?returnTo=${encodedReturnTo}`} replace />;
  }

  return children;
}

export default RegisteredOnlyRoute;
