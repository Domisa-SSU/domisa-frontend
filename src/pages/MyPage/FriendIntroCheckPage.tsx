import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMyIntroduction } from "../../api/introduction";
import { INTRODUCTION_QUESTIONS } from "../../constants/introductionQuestions";
import ErrorPage from "../ErrorPage/ErrorPage";
import NotLoginHeader from "../../components/NotLoginHeader";
import inviteCreatedIcon from "../IntroduceFriendPage/assets/inviteCreatedIcon.svg";
import { isServerError } from "../../utils/apiError";

const myIntroductionQueryKey = ["introduction", "my"] as const;

function IntroductionCard({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  return (
    <section className="rounded-[0.625rem] bg-grey-100 px-4 py-[1.125rem]">
      <div className="flex flex-col gap-2.5">
        <h2 className="typo-button-text text-grey-900">{title}</h2>
        <p className="whitespace-pre-line typo-input-text text-primary-500">
          {content}
        </p>
      </div>
    </section>
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

  const cardItems = useMemo(
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
      <div className="min-h-screen bg-grey-100">
        <NotLoginHeader title="친구 소개서" />
        <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center">
          <div
            role="status"
            aria-label="친구 소개서 확인 중"
            className="h-10 w-10 animate-spin rounded-full border-[0.1875rem] border-primary-200 border-t-primary-500"
          />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-grey-100">
        <NotLoginHeader title="친구 소개서" />
        <div className="flex min-h-[calc(100vh-7rem)] flex-col items-center justify-center gap-3 px-5">
          <p className="typo-button-text text-grey-700">오류가 발생했어요</p>
          <p className="typo-input-text-m text-grey-600 text-center">
            잠시 후 다시 시도해주세요
          </p>
        </div>
      </div>
    );
  }

  if (introduction === null) {
    return (
      <div className="min-h-screen bg-grey-100">
        <NotLoginHeader title="친구 소개서" />
        <div className="flex min-h-[calc(100vh-7rem)] flex-col items-center justify-center gap-3 px-5">
          <p className="typo-button-text text-grey-700">
            등록된 친구 소개서가 없어요
          </p>
          <p className="typo-input-text-m text-grey-600 text-center">
            친구에게 소개서 작성을 부탁해보세요
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-grey-100">
      <NotLoginHeader title="친구 소개서" />

      <main className="flex-1 bg-primary-100 px-5 pt-6 pb-10">
        <div className="mx-auto flex w-full max-w-[22.6875rem] flex-col gap-[2.25rem]">
          <section className="flex flex-col gap-2.5">
            <div className="flex items-center gap-1">
              <h1 className="typo-button-text text-grey-900">
                친구 소개서가 도착했어요
              </h1>
              <img
                src={inviteCreatedIcon}
                alt=""
                aria-hidden="true"
                className="h-4 w-4"
              />
            </div>
            <p className="typo-input-text-m text-grey-700">
              친구가 작성한 소개서를 확인해보세요
            </p>
          </section>

          <div className="flex flex-col gap-5">
            {cardItems.map((item) => (
              <IntroductionCard
                key={item.title}
                title={item.title}
                content={item.content}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default FriendIntroCheckPage;
