import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useAuthMeQuery } from "../queries/auth";

const datingRegisterReturnParams = new URLSearchParams({
  returnTo: "/dating/register",
}).toString();

function DatingAccessGuard({ children }: { children: ReactNode }) {
  const { data: authMe, isPending } = useAuthMeQuery();

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-grey-100">
        <div
          role="status"
          aria-label="소개팅 접근 권한 확인 중"
          className="h-10 w-10 animate-spin rounded-full border-[0.1875rem] border-primary-200 border-t-primary-500"
        />
      </div>
    );
  }

  if (!authMe) {
    return <Navigate to={`/auth?${datingRegisterReturnParams}`} replace />;
  }

  const { status } = authMe;

  if (status.isRegistered !== true) {
    return <Navigate to={`/auth/signup?${datingRegisterReturnParams}`} replace />;
  }

  if (status.isProfileCompleted !== true) {
    return <Navigate to="/dating/register" replace />;
  }

  if (status.hasIntroduction !== true) {
    return <Navigate to="/dating/require-introduce" replace />;
  }

  return children;
}

export default DatingAccessGuard;
