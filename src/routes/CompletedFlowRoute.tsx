import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuthMeQuery } from "../queries/auth";
import { getPostSignupPath } from "../utils/postSignupPath";

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

  if (isCompleted && authMe) {
    /**
     * 가입 직후에는 SignupPage 의 이동과 이 redirect 가 authMe 갱신을 두고 경쟁한다.
     * 두 곳이 같은 규칙을 쓰지 않으면 소개서가 없는 사용자가 안내 화면 대신
     * 출발지로 되돌아가버린다.
     */
    return (
      <Navigate to={getPostSignupPath(authMe.status, getOriginPath(location))} replace />
    );
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
