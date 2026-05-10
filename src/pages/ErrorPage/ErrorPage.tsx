import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import domisaLogo from "../../assets/domisaLogo.png";
import errorImg from "../../assets/errorImg.png";
import RightArrow from "../../assets/right_arrow.svg?react";
import { clearGlobalError } from "../../stores/globalErrorStore";

function ErrorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialLocationKeyRef = useRef(location.key);

  const handleGoHome = () => {
    clearGlobalError();
    navigate("/", { replace: true });
  };

  useEffect(() => {
    return () => {
      clearGlobalError();
    };
  }, []);

  useEffect(() => {
    if (location.key !== initialLocationKeyRef.current) {
      clearGlobalError();
    }
  }, [location.key]);

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-[linear-gradient(111.45deg,#ffcde3_2.77%,#ffe8f2_95.22%)]">
      <header className="h-16 border-b-[0.8px] border-grey-500 bg-grey-100">
        <div className="flex h-full items-center justify-center">
          <button
            type="button"
            onClick={handleGoHome}
            aria-label="홈으로 이동"
            className="flex h-11 w-16 items-center justify-center"
          >
            <img
              src={domisaLogo}
              alt="DOMISA"
              className="h-[1.97rem] w-[3.36rem] object-contain"
            />
          </button>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 items-center justify-center px-5">
        <div className="flex w-full max-w-[25.1875rem] flex-col items-center">
          <section className="flex w-full max-w-[15.36rem] flex-col items-center text-center leading-7">
            <h1 className="typo-title-header-1-b text-warning-ac">
              에러가 발생했어요
            </h1>
            <p className="typo-header-3 text-grey-700">
              개발자가 해결 중..
            </p>
          </section>

          <div className="relative mt-[2.375rem] h-[15.25rem] w-[15.25rem]">
            <img
              src={errorImg}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      </main>

      <section className="px-5 pb-[3.125rem]">
        <button
          type="button"
          onClick={handleGoHome}
          className="mx-auto flex h-[3.125rem] w-full max-w-[22.625rem] items-center justify-center gap-2.5 rounded-[0.875rem] bg-primary-500 px-2.5 py-2.5 typo-button-text-b text-grey-100"
        >
          <span>홈으로 돌아가기</span>
          <RightArrow className="h-3 w-[0.8125rem] text-grey-100" />
        </button>
      </section>
    </div>
  );
}

export default ErrorPage;
