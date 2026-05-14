import { useEffect } from "react";
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
    return <ErrorPage />;
  }

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

  if (isBlacklistedUser) {
    return (
      <SignupFlowProvider>
        {location.pathname === "/" ? <Outlet /> : <HomePage />}
        <BlacklistedUserModal />
      </SignupFlowProvider>
    );
  }

  if (isError) {
    return <ErrorPage />;
  }

  return (
    <SignupFlowProvider>
      <Outlet />
    </SignupFlowProvider>
  );
}

export default App;
