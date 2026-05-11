import { useLocation, useNavigate } from "react-router-dom";

import Button from "../../components/Button/Button";
import NotLoginHeader from "../../components/NotLoginHeader";

type TermsPageType = "service" | "privacy";

type TermsPageProps = {
  type: TermsPageType;
};

type TermsLocationState = {
  fromAuthPath?: unknown;
  pendingSignupPath?: unknown;
  showKakaoLoginToast?: unknown;
} | null;

const termsPageContent: Record<TermsPageType, {
  title: string;
  heading: string;
  description: string;
}> = {
  service: {
    title: "이용약관",
    heading: "도미사럽 이용약관",
    description:
      "임시 이용약관 페이지입니다. 실제 약관 문구가 준비되면 이 영역에 서비스 이용 조건을 반영할 예정입니다.",
  },
  privacy: {
    title: "개인정보 동의",
    heading: "개인정보 수집 및 이용동의",
    description:
      "임시 개인정보 동의 페이지입니다. 실제 약관 문구가 준비되면 이 영역에 수집 항목, 이용 목적, 보관 기간을 반영할 예정입니다.",
  },
};

const getSafeInternalPath = (value: unknown) =>
  typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
    ? value
    : null;

function TermsPage({ type }: TermsPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as TermsLocationState;
  const content = termsPageContent[type];
  const fromAuthPath = getSafeInternalPath(state?.fromAuthPath);
  const pendingSignupPath = getSafeInternalPath(state?.pendingSignupPath);

  const handleBack = () => {
    if (fromAuthPath) {
      navigate(fromAuthPath, {
        replace: true,
        state: pendingSignupPath
          ? {
              pendingSignupPath,
              showKakaoLoginToast: state?.showKakaoLoginToast === true,
            }
          : undefined,
      });
      return;
    }

    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-grey-100">
      <NotLoginHeader title={content.title} onBack={handleBack} />
      <main className="px-5 pt-8 pb-[7.5rem]">
        <section className="mx-auto flex w-full max-w-[22.6875rem] flex-col gap-5">
          <div className="flex flex-col gap-2.5">
            <h1 className="typo-title-header-1-b text-grey-900">
              {content.heading}
            </h1>
            <p className="typo-input-text-m text-grey-700">
              {content.description}
            </p>
          </div>
          <div className="rounded-[0.875rem] bg-primary-100 px-4 py-5">
            <p className="typo-input-text-m text-primary-600">
              현재 페이지는 약관 연결 동작 확인을 위한 임시 화면입니다.
            </p>
          </div>
        </section>
      </main>
      <section className="fixed inset-x-0 bottom-0 bg-grey-100 px-5 pt-2.5 pb-[2.75rem]">
        <div className="mx-auto w-full max-w-[22.625rem]">
          <Button label="돌아가기" onClick={handleBack} />
        </div>
      </section>
    </div>
  );
}

export default TermsPage;
