import { Outlet } from "react-router-dom";
import ErrorPage from "./pages/ErrorPage/ErrorPage";
import { SignupFlowProvider } from "./pages/SignupPage/SignupFlowContext";
import { useAuthMeQuery } from "./queries/auth";
import { useHasGlobalError } from "./stores/globalErrorStore";
import "./App.css";

function App() {
  const hasGlobalError = useHasGlobalError();
  const { isError, isPending } = useAuthMeQuery();

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
