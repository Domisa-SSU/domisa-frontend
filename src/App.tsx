import { useEffect, type ReactNode } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { BLACKLISTED_USER_MESSAGE } from "./api/auth";
import ErrorPage from "./pages/ErrorPage/ErrorPage";
import HomePage from "./pages/HomePage";
import { SignupFlowProvider } from "./pages/SignupPage/SignupFlowContext";
import { useAuthMeQuery } from "./queries/auth";
import { useIsBlacklistedUser } from "./stores/blacklistedUserStore";
import { useHasGlobalError } from "./stores/globalErrorStore";
import "./App.css";

function BlacklistedUserModal() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-grey-900/70 px-5">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="blacklisted-user-modal-title"
        className="flex w-full max-w-[21.25rem] flex-col items-center gap-6 rounded-[0.875rem] bg-grey-100 px-5 py-8 text-center"
      >
        <p
          id="blacklisted-user-modal-title"
          className="typo-subtitle-header-2 whitespace-pre-line text-grey-900"
        >
          {`${BLACKLISTED_USER_MESSAGE}\n인스타그램으로 문의주세요\nINSTA : domisa_love`}
        </p>
      </div>
    </div>
  );
}

type MobileFrameProps = {
  children: ReactNode;
};

/**
 * 서비스가 모바일 전용이라 데스크탑에서는 폰 폭으로 묶어 가운데 정렬한다.
 * 실기기에서는 뷰포트가 프레임보다 좁아 지금과 동일하게 보인다.
 */
function MobileFrame({ children }: MobileFrameProps) {
  return (
    <div className="mx-auto min-h-screen w-full frame-max-w bg-grey-100 shadow-[0_0_1.5rem_0_rgba(0,0,0,0.08)]">
      {children}
    </div>
  );
}

function App() {
  const hasGlobalError = useHasGlobalError();
  const { isError, isPending } = useAuthMeQuery();
  const location = useLocation();
  const navigate = useNavigate();
  const isBlacklistedUser = useIsBlacklistedUser();

  useEffect(() => {
    if (isBlacklistedUser && location.pathname !== "/") {
      navigate("/", { replace: true });
    }
  }, [isBlacklistedUser, location.pathname, navigate]);

  useEffect(() => {
    window.gtag?.("event", "page_view", {
      page_path: location.pathname + location.search,
    });
  }, [location.pathname, location.search]);

  if (hasGlobalError) {
    return (
      <MobileFrame>
        <ErrorPage />
      </MobileFrame>
    );
  }

  if (isPending) {
    return (
      <MobileFrame>
        <div className="flex min-h-screen items-center justify-center bg-grey-100">
        <div
          role="status"
          aria-label="사용자 정보 확인 중"
            className="h-10 w-10 animate-spin rounded-full border-[0.1875rem] border-primary-200 border-t-primary-500"
          />
        </div>
      </MobileFrame>
    );
  }

  if (isBlacklistedUser) {
    return (
      <SignupFlowProvider>
        <MobileFrame>
          {location.pathname === "/" ? <Outlet /> : <HomePage />}
        </MobileFrame>
        <BlacklistedUserModal />
      </SignupFlowProvider>
    );
  }

  if (isError) {
    return (
      <MobileFrame>
        <ErrorPage />
      </MobileFrame>
    );
  }

  return (
    <SignupFlowProvider>
      <MobileFrame>
        <Outlet />
      </MobileFrame>
    </SignupFlowProvider>
  );
}

export default App;
