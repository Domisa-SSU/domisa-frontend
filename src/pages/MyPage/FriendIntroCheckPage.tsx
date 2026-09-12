import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMyIntroduction } from "../../api/introduction";
import { INTRODUCTION_QUESTIONS } from "../../constants/introductionQuestions";
import ErrorPage from "../ErrorPage/ErrorPage";
import NotLoginHeader from "../../components/NotLoginHeader";
import IntroductionLetter from "../../components/IntroductionLetter";
import inviteCreatedIcon from "../IntroduceFriendPage/assets/inviteCreatedIcon.svg";
import emptyIntroductionImg from "../../assets/emptyIntroductionImg.png";
import { isServerError } from "../../utils/apiError";

const myIntroductionQueryKey = ["introduction", "my"] as const;

function FriendIntroCheckLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-grey-100">
      <NotLoginHeader title="친구 소개서" />
      {children}
    </div>
  );
}

function FriendIntroCheckMessage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[calc(100vh-7rem)] flex-col items-center justify-center gap-3 px-5">
      <p className="typo-button-text text-grey-700">{title}</p>
      <p className="typo-input-text-m text-center text-grey-600">{description}</p>
    </div>
  );
}

function FriendIntroCheckPage() {
  const {
    data: introduction,
    error,
    isPending,
    isError,
  } = useQuery({
    queryKey: myIntroductionQueryKey,
    queryFn: getMyIntroduction,
    retry: false,
  });

  const letterItems = useMemo(
    () =>
      introduction
        ? [
            { title: INTRODUCTION_QUESTIONS.q1.title, content: introduction.q1 },
            { title: INTRODUCTION_QUESTIONS.q2.title, content: introduction.q2 },
            { title: INTRODUCTION_QUESTIONS.q3.title, content: introduction.q3 },
          ]
        : [],
    [introduction],
  );

  if (isServerError(error)) {
    return <ErrorPage />;
  }

  if (isPending) {
    return (
      <FriendIntroCheckLayout>
        <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center">
          <div
            role="status"
            aria-label="친구 소개서 확인 중"
            className="h-10 w-10 animate-spin rounded-full border-[0.1875rem] border-primary-200 border-t-primary-500"
          />
        </div>
      </FriendIntroCheckLayout>
    );
  }

  if (isError) {
    return (
      <FriendIntroCheckLayout>
        <FriendIntroCheckMessage
          title="오류가 발생했어요"
          description="잠시 후 다시 시도해주세요"
        />
      </FriendIntroCheckLayout>
    );
  }

  if (introduction === null) {
    return (
      <FriendIntroCheckLayout>
        <div className="flex min-h-[calc(100vh-7rem)] justify-center bg-grey-400">
          <div className="w-full max-w-[22.6875rem] px-5 pt-6 pb-10">
            <div className="flex flex-col items-center justify-center pt-24">
              <span className="typo-header-3 leading-7 text-center text-grey-700">
                아직 받은 친구 소개서가 없어요
              </span>
              <img
                src={emptyIntroductionImg}
                alt=""
                className="h-[15.36rem] w-[15.36rem] object-cover"
              />
            </div>
          </div>
        </div>
      </FriendIntroCheckLayout>
    );
  }

  return (
    <FriendIntroCheckLayout>
      <main className="mx-auto w-full max-w-[25.1875rem] px-5 pt-6 pb-10">
        <div className="mx-auto flex w-full max-w-[22.6875rem] flex-col gap-[1.125rem]">
          <section className="flex flex-col gap-2.5">
            <div className="flex items-center gap-1">
              <h1 className="typo-button-text text-grey-900">나의 소개서</h1>
              <img
                src={inviteCreatedIcon}
                alt=""
                aria-hidden="true"
                className="h-4 w-4"
              />
            </div>
            <p className="typo-input-text-m text-grey-700">
              친구가 작성해준 내 소개서를 확인해보세요
            </p>
          </section>

          <IntroductionLetter items={letterItems} />
        </div>
      </main>
    </FriendIntroCheckLayout>
  );
}

export default FriendIntroCheckPage;
