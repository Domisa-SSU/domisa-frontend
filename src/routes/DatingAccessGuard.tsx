import { type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import DatingAccessModal from "../components/DatingAccessModal";
import DatingPage from "../pages/DatingPage/DatingPage";
import { useAuthMeQuery } from "../queries/auth";

const datingReturnParams = new URLSearchParams({
  returnTo: "/dating",
}).toString();

function DatingAccessGuard({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: authMe, isPending } = useAuthMeQuery();
  const flowOrigin = {
    from: `${location.pathname}${location.search}${location.hash}`,
  };

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
    return (
      <>
        <DatingPage preview />
        <DatingAccessModal
          type="signup"
          onProceed={() =>
            navigate(`/auth?${datingReturnParams}`, {
              replace: true,
              state: flowOrigin,
            })
          }
        />
      </>
    );
  }

  const { status } = authMe;

  if (status.isRegistered !== true) {
    return (
      <>
        <DatingPage preview />
        <DatingAccessModal
          type="signup"
          onProceed={() =>
            navigate(`/auth/signup?${datingReturnParams}`, {
              replace: true,
              state: flowOrigin,
            })
          }
        />
      </>
    );
  }

  if (status.hasIntroduction !== true) {
    return (
      <>
        <DatingPage preview />
        <DatingAccessModal
          type="introduction"
          onProceed={() => navigate("/dating/require-introduce", { replace: true })}
        />
      </>
    );
  }

  return children;
}

export default DatingAccessGuard;
