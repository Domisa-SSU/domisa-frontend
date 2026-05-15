import domisaLogo from '../../assets/domisaLogo.png';
import errorImg from '../../assets/errorImg.png';
import RightArrow from '../../assets/right_arrow.svg?react';
import { CUSTOMER_SUPPORT_KAKAO_URL } from '../../constants/customerSupport';

function PausePage() {
  const handleGoCustomerSupport = () => {
    window.location.href = CUSTOMER_SUPPORT_KAKAO_URL;
  };

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-[linear-gradient(111.45deg,#ffcde3_2.77%,#ffe8f2_95.22%)]">
      <header className="h-16 border-b-[0.8px] border-grey-500 bg-grey-100">
        <div className="flex h-full items-center justify-center">
          <button
            type="button"
            onClick={handleGoCustomerSupport}
            aria-label="고객센터로 문의하기"
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
          <section className="flex w-full max-w-[17.5rem] flex-col items-center text-center leading-7">
            <h1 className="typo-title-header-1-b text-warning-ac">
              서비스가 종료됐어요
            </h1>
            <p className="typo-header-3 text-grey-700">
              문의사항은 고객센터로 문의주세요
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
          onClick={handleGoCustomerSupport}
          className="mx-auto flex h-[3.125rem] w-full max-w-[22.625rem] items-center justify-center gap-2.5 rounded-[0.875rem] bg-primary-500 px-2.5 py-2.5 typo-button-text-b text-grey-100"
        >
          <span>고객센터로 문의하기</span>
          <RightArrow className="h-3 w-[0.8125rem] text-grey-100" />
        </button>
      </section>
    </div>
  );
}

export default PausePage;
