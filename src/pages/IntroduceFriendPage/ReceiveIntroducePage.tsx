import { useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

import {
  acceptReceivedIntroduction,
  getReceivedIntroduction,
} from "../../api/introduction";
import { INTRODUCTION_QUESTIONS } from "../../constants/introductionQuestions";
import type { AuthMeResponse } from "../../types/user";
import Button from "../../components/Button/Button";
import HeaderTop from "../../components/HeaderTop";
import { authMeQueryKey, useAuthMeQuery } from "../../queries/auth";
import { reportGlobalErrorIfNeeded } from "../../stores/globalErrorStore";
import inviteCreatedIcon from "./assets/inviteCreatedIcon.svg";
import letterCorner from "./assets/letterCorner.svg";

type MessageModalProps = {
  title: string;
  description?: string;
  actions: {
    label: string;
    onClick: () => void;
    variant: "secondary" | "primary";
    disabled?: boolean;
  }[];
};

type AcceptSuccessType = "created" | "changed";

const introductionQueryKey = (linkCode: string) =>
  ["introduction", "received", linkCode] as const;

const getApiErrorData = (error: unknown) => {
  if (!isAxiosError(error)) {
    return null;
  }

  const data = error.response?.data;

  if (!data || typeof data !== "object") {
    return null;
  }

  return data as Record<string, unknown>;
};

const getApiErrorCode = (error: unknown) => {
  const data = getApiErrorData(error);
  const code = data?.code;

  return typeof code === "string" ? code : null;
};

const getApiErrorMessage = (error: unknown) => {
  const data = getApiErrorData(error);
  const message = data?.message;

  return typeof message === "string" ? message : null;
};

const isUnauthorizedIntroductionAcceptError = (error: unknown) => {
  if (!isAxiosError(error)) {
    return false;
  }

  if (error.response?.status === 401) {
    return true;
  }

  return getApiErrorCode(error) === "USER_NOT_FOUND";
};

const getIntroductionAcceptErrorDescription = (error: unknown) => {
  const code = getApiErrorCode(error);

  if (code === "INTRODUCTION_ALREADY_ACCEPTED") {
    return "이미 수락된 소개서입니다.";
  }

  if (code === "INTRODUCTION_NOT_FOUND") {
    return "소개서를 찾을 수 없습니다.";
  }

  if (
    isAxiosError(error) &&
    error.response?.status &&
    error.response.status >= 400 &&
    error.response.status < 500
  ) {
    return getApiErrorMessage(error) ?? "소개서를 수락할 수 없습니다.";
  }

  return null;
};

function ReceiveIntroduceHeader() {
  return (
    <header className="border-b-[0.8px] border-grey-500 bg-grey-100">
      <HeaderTop />
      <div className="relative mx-auto flex h-[3.4rem] w-full max-w-[25.1875rem] items-center justify-center px-5">
        <h1 className="typo-subtitle-header-2 text-grey-700">친구 소개서</h1>
      </div>
    </header>
  );
}

function MessageModal({
  title,
  description,
  actions,
}: MessageModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
      <div className="absolute inset-0 bg-grey-900/70" />
      <div className="relative z-10 flex w-full max-w-[21.25rem] flex-col items-center gap-[1.875rem] rounded-[0.875rem] bg-grey-100 px-5 pt-[1.875rem] pb-5 text-center">
        <div className={`flex flex-col items-center ${description ? "gap-[0.9375rem]" : ""}`}>
          <h2 className="typo-subtitle-header-2 text-grey-900">{title}</h2>
          {description ? (
            <p className="typo-input-text-m text-grey-700">{description}</p>
          ) : null}
        </div>
        <div className="flex w-full max-w-[18.75rem] gap-2.5">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              disabled={action.disabled}
              className={`flex h-[3.125rem] flex-1 items-center justify-center rounded-[0.875rem] p-2.5 typo-button-text-b disabled:cursor-wait disabled:opacity-80 ${
                action.variant === "primary"
                  ? "bg-gradient-to-b from-[#ff98b5] to-[#ff5a99] text-grey-100"
                  : "bg-grey-400 text-grey-800"
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function LetterCorner({ className }: { className: string }) {
  return (
    <img
      src={letterCorner}
      alt=""
      aria-hidden="true"
      className={`pointer-events-none absolute size-4 ${className}`}
    />
  );
}

function IntroductionLetter({
  items,
}: {
  items: { title: string; content: string }[];
}) {
  return (
    <section className="relative overflow-hidden rounded-[0.125rem] bg-[#f2f0ea] px-10 pt-[2.1875rem] pb-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[0.59375rem] inset-y-[0.53125rem] border-[1.2px] border-[#d0c2b5]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[1.09375rem] inset-y-4 rounded-[2.0625rem] border-[1.2px] border-[#d0c2b5]"
      />
      <LetterCorner className="left-3 top-3" />
      <LetterCorner className="right-3 top-3 rotate-90" />
      <LetterCorner className="right-3 bottom-3 rotate-180" />
      <LetterCorner className="left-3 bottom-3 -rotate-90" />

      <h2 className="relative text-center typo-letter-title text-[#b04b3e]">
        친구 소개서
      </h2>

      <div className="relative mt-[1.375rem] flex flex-col gap-5">
        {items.map((item) => (
          <div key={item.title} className="flex flex-col gap-2.5">
            <p className="typo-letter-question text-grey-900/45">{item.title}</p>
            <p className="whitespace-pre-line typo-letter-answer text-grey-900/80">
              {item.content}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ReceiveIntroducePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { linkCode = "" } = useParams<{ linkCode: string }>();
  const { data: authMe } = useAuthMeQuery();
  const [isReplaceConfirmOpen, setIsReplaceConfirmOpen] = useState(false);
  const [acceptSuccessType, setAcceptSuccessType] = useState<AcceptSuccessType | null>(null);
  const [invalidIntroductionDescription, setInvalidIntroductionDescription] =
    useState("");

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
              title: INTRODUCTION_QUESTIONS.q1.title,
              content: introduction.q1,
            },
            {
              title: INTRODUCTION_QUESTIONS.q2.title,
              content: introduction.q2,
            },
            {
              title: INTRODUCTION_QUESTIONS.q3.title,
              content: introduction.q3,
            },
          ]
        : [],
    [introduction],
  );

  const submitAccept = async (successType: AcceptSuccessType) => {
    if (!introduction || isAccepting) {
      return;
    }

    try {
      await acceptIntroduction(introduction.introductionId);
      await queryClient.invalidateQueries({ queryKey: authMeQueryKey });

      setIsReplaceConfirmOpen(false);
      setAcceptSuccessType(successType);
    } catch (error) {
      if (reportGlobalErrorIfNeeded(error)) {
        return;
      }

      if (isUnauthorizedIntroductionAcceptError(error)) {
        const returnTo = `/introduce/${encodeURIComponent(linkCode)}`;

        setIsReplaceConfirmOpen(false);
        queryClient.setQueryData(authMeQueryKey, null);
        navigate(`/auth?returnTo=${encodeURIComponent(returnTo)}`, {
          replace: true,
        });
        return;
      }

      const introductionAcceptErrorDescription =
        getIntroductionAcceptErrorDescription(error);

      if (introductionAcceptErrorDescription) {
        setIsReplaceConfirmOpen(false);
        setInvalidIntroductionDescription(introductionAcceptErrorDescription);
        return;
      }

      console.error(error);
    }
  };

  const handleAccept = async () => {
    if (!introduction || isAccepting) {
      return;
    }

    if (!authMe) {
      const returnTo = `/introduce/${encodeURIComponent(linkCode)}`;
      navigate(`/auth?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }

    if (authMe.status.isRegistered !== true) {
      const returnTo = `/introduce/${encodeURIComponent(linkCode)}`;
      navigate(`/auth/signup?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }

    if (authMe.status.hasIntroduction) {
      setIsReplaceConfirmOpen(true);
      return;
    }

    await submitAccept("created");
  };

  const handleGoDating = () => {
    const latestAuthMe =
      queryClient.getQueryData<AuthMeResponse | null>(authMeQueryKey) ?? authMe;
    const isProfileCompleted =
      latestAuthMe?.status.isProfileCompleted === true;

    navigate(isProfileCompleted ? "/dating" : "/dating/register", {
      replace: true,
    });
  };

  const handleCancelReplace = () => {
    setIsReplaceConfirmOpen(false);
  };

  const successModalTitle =
    acceptSuccessType === "changed"
      ? "소개서가 변경됐어요"
      : "소개서가 만들어졌어요";

  if (!linkCode || isIntroductionError || invalidIntroductionDescription) {
    return (
      <div className="min-h-screen bg-grey-100">
        <MessageModal
          title="유효하지 않은 소개서예요"
          description={invalidIntroductionDescription || "다시 링크를 확인해주세요"}
          actions={[
            {
              label: "홈으로",
              onClick: () => navigate("/", { replace: true }),
              variant: "primary",
            },
          ]}
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
    <div className="min-h-screen bg-grey-100">
      <ReceiveIntroduceHeader />

      <main className="mx-auto w-full max-w-[25.1875rem] px-5 pt-6 pb-[9.75rem]">
        <div className="mx-auto flex w-full max-w-[22.6875rem] flex-col gap-[1.125rem]">
          <section className="flex flex-col gap-2.5">
            <div className="flex items-center gap-1">
              <h1 className="typo-button-text text-grey-900">
                친구가 써준{" "}
                <span className="text-primary-600">내 소개서</span>가 도착했어요
              </h1>
              <img
                src={inviteCreatedIcon}
                alt=""
                aria-hidden="true"
                className="h-4 w-4"
              />
            </div>
            <p className="typo-input-text-m text-grey-700">
              친구가 나를 커플로 만들기 위해 소개서를 작성했어요!
            </p>
          </section>

          <div className="flex flex-col gap-2.5">
            <IntroductionLetter items={cardItems} />
            <p className="typo-input-text-m text-grey-600">
              *도미사럽은 숭실대 가을 축제에 운영되는 소개팅 서비스예요
            </p>
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

      {isReplaceConfirmOpen && (
        <MessageModal
          title="소개서를 바꾸시겠어요?"
          description="소개서를 바꾸면 그 전 소개서는 사라져요"
          actions={[
            {
              label: "아니요",
              onClick: handleCancelReplace,
              variant: "secondary",
              disabled: isAccepting,
            },
            {
              label: isAccepting ? "변경 중..." : "바꾸기",
              onClick: () => void submitAccept("changed"),
              variant: "primary",
              disabled: isAccepting,
            },
          ]}
        />
      )}

      {acceptSuccessType && (
        <MessageModal
          title={successModalTitle}
          actions={[
            {
              label: "홈으로",
              onClick: () => navigate("/", { replace: true }),
              variant: "secondary",
            },
            {
              label: "소개팅 하러 가기",
              onClick: handleGoDating,
              variant: "primary",
            },
          ]}
        />
      )}

    </div>
  );
}

export default ReceiveIntroducePage;
