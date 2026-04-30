import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

import {
  acceptReceivedIntroduction,
  getReceivedIntroduction,
} from "../../api/introduction";
import type { AuthMeResponse } from "../../types/user";
import Button from "../../components/Button/Button";
import HeaderTop from "../../components/HeaderTop";
import { authMeQueryKey, useAuthMeQuery } from "../../queries/auth";
import inviteCreatedIcon from "./assets/inviteCreatedIcon.svg";

type MessageModalProps = {
  title: string;
  description: string;
  buttonLabel: string;
  onConfirm: () => void;
};

const introductionQueryKey = (linkCode: string) =>
  ["introduction", "received", linkCode] as const;

function ReceiveIntroduceHeader() {
  return (
    <header className="border-b-[0.8px] border-grey-500 bg-grey-100">
      <HeaderTop />
      <div className="relative flex h-[3.4rem] items-center justify-center px-5">
        <h1 className="typo-subtitle-header-2 text-grey-700">친구 소개서</h1>
      </div>
    </header>
  );
}

function MessageModal({
  title,
  description,
  buttonLabel,
  onConfirm,
}: MessageModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
      <div className="absolute inset-0 bg-grey-900/70" />
      <div className="relative z-10 flex w-full max-w-[21.25rem] flex-col items-center gap-[1.875rem] rounded-[0.875rem] bg-grey-100 px-5 pt-[1.875rem] pb-5 text-center">
        <div className="flex flex-col items-center gap-[0.9375rem]">
          <h2 className="typo-subtitle-header-2 text-grey-900">{title}</h2>
          <p className="typo-input-text-m text-grey-700">{description}</p>
        </div>
        <button
          type="button"
          onClick={onConfirm}
          className="flex h-[3.125rem] w-full max-w-[18.75rem] items-center justify-center rounded-[0.875rem] bg-primary-500 px-2.5 py-2.5"
        >
          <span className="typo-button-text-b text-grey-100">
            {buttonLabel}
          </span>
        </button>
      </div>
    </div>
  );
}

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

function ReceiveIntroducePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { linkCode = "" } = useParams<{ linkCode: string }>();
  const { data: authMe } = useAuthMeQuery();
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const {
    data: introduction,
    isPending: isIntroductionPending,
    isError: isIntroductionError,
  } = useQuery({
    queryKey: introductionQueryKey(linkCode),
    queryFn: () => getReceivedIntroduction(linkCode),
    enabled: linkCode.trim().length > 0,
    retry: false,
  });

  const {
    mutateAsync: acceptIntroduction,
    isPending: isAccepting,
  } = useMutation({
    mutationFn: acceptReceivedIntroduction,
  });

  const cardItems = useMemo(
    () =>
      introduction
        ? [
            {
              title: "친구에 대한 간단한 소개",
              content: introduction.q1,
            },
            {
              title: "친구의 매력 포인트",
              content: introduction.q2,
            },
            {
              title: "잘 맞을 것 같은 사람의 특징",
              content: introduction.q3,
            },
          ]
        : [],
    [introduction],
  );

  const handleAccept = async () => {
    if (!introduction || isAccepting) {
      return;
    }

    if (!authMe) {
      const returnTo = `/introduce/${encodeURIComponent(linkCode)}`;
      navigate(`/auth?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }

    try {
      await acceptIntroduction(introduction.introductionId);
      await queryClient.invalidateQueries({ queryKey: authMeQueryKey });
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSuccessConfirm = () => {
    const latestAuthMe =
      queryClient.getQueryData<AuthMeResponse | null>(authMeQueryKey) ?? authMe;
    const isProfileCompleted =
      latestAuthMe?.status.isProfileCompleted === true;

    navigate(isProfileCompleted ? "/dating" : "/dating/register", {
      replace: true,
    });
  };

  if (!linkCode || isIntroductionError) {
    return (
      <div className="min-h-screen bg-grey-100">
        <MessageModal
          title="유효하지 않은 소개서예요"
          description="다시 링크를 확인해주세요"
          buttonLabel="홈으로"
          onConfirm={() => navigate("/", { replace: true })}
        />
      </div>
    );
  }

  if (isIntroductionPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-grey-100">
        <div
          role="status"
          aria-label="친구 소개서 확인 중"
          className="h-10 w-10 animate-spin rounded-full border-[0.1875rem] border-primary-200 border-t-primary-500"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-100">
      <ReceiveIntroduceHeader />

      <main className="px-5 pt-6 pb-[9.75rem]">
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

      <div className="fixed inset-x-0 bottom-0 bg-grey-100 px-5 pt-2.5 pb-[2.94rem]">
        <div className="mx-auto flex w-full max-w-[22.625rem] flex-col items-center gap-2.5">
          <p className="typo-input-text-m text-grey-700">
            이미 친구소개서가 있는 경우 친구소개서가 변경돼요!
          </p>
          <Button
            label={isAccepting ? "수락 중..." : "수락"}
            disabled={isAccepting}
            onClick={handleAccept}
          />
        </div>
      </div>

      {isSuccessModalOpen && (
        <MessageModal
          title="친구 소개서 수락 완료!"
          description="이제 소개팅을 시작해볼까요?"
          buttonLabel="확인"
          onConfirm={handleSuccessConfirm}
        />
      )}
    </div>
  );
}

export default ReceiveIntroducePage;
