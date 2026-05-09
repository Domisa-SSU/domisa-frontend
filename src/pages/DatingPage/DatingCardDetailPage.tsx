import { type ReactNode, useEffect, useState } from "react";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import {
  datingCardDetailQueryKey,
  fetchDatingCardDetail,
  matchReceivedDatingLike,
  sendDatingLike,
  unblurReceivedDatingLike,
  type DatingCardDetailContact,
  type DatingCardDetailResponse,
  type DatingCardDetailViewType,
} from "../../api/datingCardDetail";
import { getCookies, type AnimalProfile } from "../../api/users";
import { userCookiesQueryKey } from "../../queries/users";
import HeaderTop from "../../components/HeaderTop";
import Toast from "../../components/Toast";
import arrowIcon from "../../assets/arrowIcon.svg";
import cookieIcon from "../../assets/cookie.svg";
import flowerIcon from "../../assets/flowerIcon.svg";
import headerArrow from "../../assets/headerArrow.svg";
import heartIcon from "../../assets/heartIcon.svg";
import XIcon from "../../assets/X.svg";
import alphacaImg from "../SignupPage/asset/alphacaImg.png";
import bearImg from "../SignupPage/asset/bearImg.png";
import capibaraImg from "../SignupPage/asset/capibaraImg.png";
import catImg from "../SignupPage/asset/catImg.png";
import deerImg from "../SignupPage/asset/deerImg.png";
import dogImg from "../SignupPage/asset/dogImg.png";
import foxImg from "../SignupPage/asset/foxImg.png";
import hamsterImg from "../SignupPage/asset/hamsterImg.png";
import namuneulboImg from "../SignupPage/asset/namuneulboImg.png";
import rabbitImg from "../SignupPage/asset/rabbitImg.png";
import sudalImg from "../SignupPage/asset/sudalImg.png";
import wolfImg from "../SignupPage/asset/wolfImg.png";
import inviteCreatedIcon from "../IntroduceFriendPage/assets/inviteCreatedIcon.svg";
import doubleArrowIcon from "./assets/doubleArrowIcon.svg";
import lockIcon from "./assets/lockIcon.png";

type DatingCardDetailSectionItem = {
  title: string;
  content: string;
  isLocked?: boolean;
};

type DatingDetailModal =
  | { type: "send-like-success" }
  | { type: "paid-like-confirm" }
  | { type: "received-unblur-success"; remainingCookieCount: number | null };

const cookiePurchaseFallbackState = {
  count: 5,
  price: "2,000",
};

const animalProfileImageMap: Record<AnimalProfile, string> = {
  DOG: dogImg,
  CAT: catImg,
  BEAR: bearImg,
  SLOTH: namuneulboImg,
  HAMSTER: hamsterImg,
  WOLF: wolfImg,
  RABBIT: rabbitImg,
  DEER: deerImg,
  OTTER: sudalImg,
  ALPACA: alphacaImg,
  FOX: foxImg,
  CAPYBARA: capibaraImg,
};

const createLockedPlaceholder = (length: number) => {
  const placeholderLength = Math.min(Math.max(Math.trunc(length), 8), 80);
  return "가".repeat(placeholderLength);
};

const getFriendIntroductionItems = (
  cardDetail: DatingCardDetailResponse,
): DatingCardDetailSectionItem[] => [
  {
    title: "친구에 대한 간단한 소개",
    content: cardDetail.q1,
  },
  {
    title: "친구의 매력 포인트",
    content: cardDetail.q2,
  },
  {
    title: "친구와 있었던 가장 웃긴 에피소드",
    content: cardDetail.q3 ?? createLockedPlaceholder(cardDetail.q3Length ?? 0),
    isLocked: cardDetail.q3 === null,
  },
];

const getSelfIntroductionItems = (
  cardDetail: DatingCardDetailResponse,
): DatingCardDetailSectionItem[] => [
  {
    title: "원하는 연애 스타일을 적어주세요",
    content: cardDetail.datingStyle,
  },
  {
    title: "이상형을 한 줄로 적어주세요",
    content:
      cardDetail.idealType ??
      createLockedPlaceholder(cardDetail.idealTypeLength ?? 0),
    isLocked: cardDetail.idealType === null,
  },
];

const contactTypeLabels: Record<DatingCardDetailContact["type"], string> = {
  PHONE: "전화번호",
  KAKAO: "카카오톡 ID",
  INSTAGRAM: "인스타 ID",
};

const datingQueryRootKey = ["dating"] as const;

const getDatingCardDetailViewType = (
  value: string | null,
): DatingCardDetailViewType =>
  value === "FAN" || value === "NORMAL" ? value : "NORMAL";

const getApiErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (!axios.isAxiosError(error)) {
    return fallbackMessage;
  }

  const responseData = error.response?.data;

  if (!responseData || typeof responseData !== "object") {
    return fallbackMessage;
  }

  const message = (responseData as Record<string, unknown>).message;

  return typeof message === "string" && message.trim().length > 0
    ? message
    : fallbackMessage;
};

const isInsufficientCookiesError = (error: unknown) => {
  if (!axios.isAxiosError(error) || error.response?.status !== 402) {
    return false;
  }

  const responseData = error.response.data;

  if (!responseData || typeof responseData !== "object") {
    return false;
  }

  return (
    (responseData as Record<string, unknown>).code === "INSUFFICIENT_COOKIES"
  );
};

function CoverImage({
  src,
}: {
  src: string | null;
}) {
  const fadeMask = {
    WebkitMaskImage:
      "linear-gradient(180deg, #000 0%, #000 72%, rgba(0, 0, 0, 0) 100%)",
    maskImage:
      "linear-gradient(180deg, #000 0%, #000 72%, rgba(0, 0, 0, 0) 100%)",
  };

  return (
    <div
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      style={fadeMask}
    >
      {src ? (
        <>
          <img
            src={src}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full scale-[1.08] object-cover brightness-[0.88] saturate-[1.08] blur-[10px]"
          />
          <div className="absolute inset-0 bg-black/10" />
          <img
            src={src}
            alt=""
            className="relative z-10 h-full w-auto max-w-full object-contain"
          />
        </>
      ) : (
        <div
          className="h-full w-full bg-[linear-gradient(135deg,#f6f6f6_0%,#ffcde3_45%,#e0e0e0_100%)]"
        />
      )}
    </div>
  );
}

function ProfileImageViewer({
  src,
  onClose,
}: {
  src: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-grey-900/80 px-3 py-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="프로필 사진 확대 보기"
        className="relative flex h-full w-full max-w-[calc(100vw-1.5rem)] items-center justify-center"
      >
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
          className="absolute right-0 top-0 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-grey-900/70"
          aria-label="사진 확대 닫기"
        >
          <img src={XIcon} alt="" className="h-4 w-4 brightness-0 invert" />
        </button>
        <img
          src={src}
          alt=""
          className="max-h-[92vh] max-w-full rounded-[0.875rem] object-contain"
          onClick={(event) => event.stopPropagation()}
        />
      </div>
    </div>
  );
}

function ProfileSummary({
  nickName,
  age,
  mbti,
  gender,
  animalProfile,
}: {
  nickName: string;
  age: number;
  mbti: string;
  gender: boolean;
  animalProfile: AnimalProfile;
}) {
  const summaryItems = [
    `${age}세`,
    mbti,
    gender ? "남" : "여",
  ].filter((item): item is string => Boolean(item));

  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-center gap-[0.945rem]">
        <div className="h-[4.568rem] w-[4.568rem] shrink-0 overflow-hidden rounded-[1.37rem] bg-grey-300">
          <img
            src={animalProfileImageMap[animalProfile]}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex min-w-0 flex-col gap-[0.4725rem]">
          <h1 className="typo-title-header-1 text-grey-900">{nickName}</h1>
          <p className="typo-comment-1-m text-grey-700">
            {summaryItems.join(" · ")}
          </p>
        </div>
      </div>
    </section>
  );
}

function ReceivedLikeBadge() {
  return (
    <div className="flex w-full items-center justify-center gap-1 rounded-[0.625rem] bg-primary-100 px-2.5 py-1.5">
      <p className="typo-comment-2 text-primary-600">나에게 호감을 보냈어요</p>
      <img src={heartIcon} alt="" className="h-3 w-3" />
    </div>
  );
}

function MatchedBadge() {
  return (
    <div className="flex w-full items-center justify-center gap-1 rounded-[0.625rem] bg-match-hl px-2.5 py-1.5">
      <p className="typo-comment-2 text-grey-900">서로 호감을 보내 매칭되었어요</p>
      <img src={heartIcon} alt="" className="h-3 w-3" />
      <img src={heartIcon} alt="" className="h-3 w-3" />
    </div>
  );
}

function MatchedContactCard({
  contact,
}: {
  contact: DatingCardDetailContact;
}) {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-2.5 rounded-[0.625rem] bg-match-bg py-2.5">
      <p className="typo-comment-2 text-grey-700">{contactTypeLabels[contact.type]}</p>
      <p className="typo-input-text text-match-text">{contact.content}</p>
    </div>
  );
}

function InfoCard({
  item,
  variant,
}: {
  item: DatingCardDetailSectionItem;
  variant: "friend" | "self";
}) {
  const className =
    variant === "friend"
      ? "bg-primary-100"
      : "bg-[linear-gradient(165deg,#ffcde3_2.77%,#ffe8f2_95.22%)]";

  return (
    <article className={`w-full rounded-[0.625rem] px-2 py-2.5 ${className}`}>
      <div className="flex flex-col gap-2.5 px-2.5 py-2">
        <h3
          className={`flex items-center gap-1 typo-input-text ${
            item.isLocked ? "text-grey-800" : "text-grey-900"
          }`}
        >
          <span className="min-w-0 break-words">{item.title}</span>
          {item.isLocked ? (
            <img src={lockIcon} alt="" aria-hidden="true" className="h-[1.125rem] w-[1.125rem] shrink-0" />
          ) : null}
        </h3>
        <p
          className={`whitespace-pre-line break-words typo-input-text text-primary-500 ${
            item.isLocked ? "select-none blur-[5px]" : ""
          }`}
          aria-hidden={item.isLocked}
        >
          {item.content}
        </p>
        {item.isLocked ? (
          <span className="sr-only">비공개 답변입니다</span>
        ) : null}
      </div>
    </article>
  );
}

function DetailSection({
  title,
  icon,
  items,
  variant,
}: {
  title: string;
  icon: string;
  items: DatingCardDetailSectionItem[];
  variant: "friend" | "self";
}) {
  return (
    <section className="flex flex-col gap-[1.125rem]">
      <div className="flex items-center gap-2">
        <img src={icon} alt="" className="h-[1.2rem] w-[1.2rem]" />
        <h2 className="typo-button-text text-grey-900">{title}</h2>
      </div>
      <div className="flex flex-col gap-[0.875rem]">
        {items.map((item) => (
          <InfoCard key={item.title} item={item} variant={variant} />
        ))}
      </div>
    </section>
  );
}

function ModalShell({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose?: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-grey-900/70 px-[1.9375rem]"
      onClick={() => onClose?.()}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="relative flex w-full max-w-[21.25rem] flex-col items-center justify-center rounded-[0.875rem] bg-grey-100"
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function DatingDetailActionModal({
  modal,
  cookieCount,
  isSendLikePending,
  onClose,
  onConfirmPaidLike,
  onGoDatingHome,
  onConfirmReceivedUnblur,
}: {
  modal: DatingDetailModal;
  cookieCount: number | null;
  isSendLikePending: boolean;
  onClose: () => void;
  onConfirmPaidLike: () => void;
  onGoDatingHome: () => void;
  onConfirmReceivedUnblur: () => void;
}) {
  if (modal.type === "send-like-success") {
    return (
      <ModalShell>
        <div className="flex flex-col items-center gap-5 pb-5 pt-[1.875rem]">
          <div className="flex flex-col items-center gap-[0.9375rem]">
            <p className="typo-subtitle-header-2 text-center text-grey-900">
              호감을 보냈어요!
            </p>
            <div className="flex items-center justify-center gap-1">
              <p className="typo-input-text-m text-center text-grey-700">
                매칭되면 문자로 알려드릴게요
              </p>
              <img src={flowerIcon} alt="" className="h-4 w-4" />
            </div>
          </div>
          <button
            type="button"
            onClick={onGoDatingHome}
            className="flex h-[3.125rem] w-[18.75rem] items-center justify-center gap-1 rounded-[0.875rem] bg-primary-500 px-2.5 py-2.5 text-grey-100"
          >
            <span className="typo-button-text-b">소개팅 홈으로</span>
            <span className="typo-button-text-b" aria-hidden="true">👀</span>
            <img src={arrowIcon} alt="" className="h-3 w-[0.8125rem]" />
          </button>
        </div>
      </ModalShell>
    );
  }

  if (modal.type === "paid-like-confirm") {
    return (
      <ModalShell onClose={onClose}>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-[1.0625rem] top-5 flex p-2.5"
          aria-label="닫기"
        >
          <img src={XIcon} alt="" className="h-[1.0625rem] w-4" />
        </button>
        <div className="flex flex-col items-center gap-[0.9375rem] pb-5 pt-10">
          <div className="flex flex-col items-center gap-[0.9375rem]">
            <div className="typo-subtitle-header-2 text-center text-grey-900">
              <p>앗! 무료로 제공된 호감을</p>
              <p>모두 사용하셨어요</p>
            </div>
            <p className="typo-input-text-m text-center text-grey-700">
              내 쿠키 : {cookieCount ?? "-"}개
            </p>
          </div>
          <button
            type="button"
            onClick={onConfirmPaidLike}
            disabled={isSendLikePending}
            className="flex h-[3.125rem] w-[18.75rem] items-center justify-center gap-1 rounded-[0.875rem] bg-primary-500 px-2.5 py-2.5 text-grey-100 disabled:cursor-wait disabled:opacity-80"
          >
            <span className="typo-button-text-b">
              {isSendLikePending ? "호감 보내는 중..." : "쿠키 1개로 호감 보내기"}
            </span>
            <img src={cookieIcon} alt="" className="h-4 w-4" />
            <img src={arrowIcon} alt="" className="h-3 w-[0.8125rem]" />
          </button>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell>
      <div className="flex flex-col items-center gap-5 pb-5 pt-[1.875rem]">
        <div className="flex flex-col items-center gap-[0.9375rem]">
          <div className="flex items-center justify-center gap-1">
            <p className="typo-subtitle-header-2 text-center text-grey-900">
              쿠키 2개로 소개팅 카드를 열었어요
            </p>
            <img src={heartIcon} alt="" className="h-4 w-4" />
          </div>
          <p className="typo-input-text-m text-center text-grey-700">
            남은 쿠키 : {modal.remainingCookieCount ?? "-"}개
          </p>
        </div>
        <button
          type="button"
          onClick={onConfirmReceivedUnblur}
          className="flex h-[3.125rem] w-[18.75rem] items-center justify-center rounded-[0.875rem] bg-primary-500 px-2.5 py-2.5 text-grey-100"
        >
          <span className="typo-button-text-b">확인</span>
        </button>
      </div>
    </ModalShell>
  );
}

function DetailFooter({
  isMatched,
  isReceivedLikePaid,
  hasSentLike,
  hasReceivedLike,
  isSendLikePending,
  isUnblurPending,
  isMatchPending,
  onSendLike,
  onUnblurReceivedLike,
  onConfirmMatch,
}: {
  isMatched: boolean;
  isReceivedLikePaid: boolean;
  hasSentLike: boolean;
  hasReceivedLike: boolean;
  isSendLikePending: boolean;
  isUnblurPending: boolean;
  isMatchPending: boolean;
  onSendLike: () => void;
  onUnblurReceivedLike: () => void;
  onConfirmMatch: () => void;
}) {
  if (isMatched) {
    return (
      <div className="fixed inset-x-0 bottom-0 z-30 bg-grey-100 px-5 pb-[2.94rem] pt-2.5">
        <div className="mx-auto flex w-full max-w-[22.625rem] flex-col items-center">
          <button
            type="button"
            disabled
            className="flex h-[3.125rem] w-full cursor-default items-center justify-center rounded-[1.25rem] border-[0.8px] border-match-text bg-grey-100 px-2.5 py-2.5 text-match-text shadow-[0_0_10px_rgba(255,208,132,1)]"
          >
            <span className="typo-button-text-b">매칭이 된 상대예요</span>
          </button>
        </div>
      </div>
    );
  }

  if (isReceivedLikePaid) {
    return (
      <div className="fixed inset-x-0 bottom-0 z-30 bg-grey-100 px-5 pb-[2.94rem] pt-2.5">
        <div className="mx-auto flex w-full max-w-[22.625rem] flex-col items-center">
          <button
            type="button"
            onClick={onConfirmMatch}
            disabled={isMatchPending}
            className="flex h-[3.125rem] w-full items-center justify-center rounded-[0.875rem] bg-[linear-gradient(178deg,#ff8b6e_22.19%,#ffc14e_90.53%)] px-2.5 py-2.5 text-grey-100 disabled:cursor-wait disabled:opacity-80"
          >
            <span className="flex items-center gap-1 typo-button-text-b">
              {isMatchPending ? "매칭 중..." : "호감 보내고 매칭되기 (무료)"}
              <img src={flowerIcon} alt="" className="h-4 w-4" />
            </span>
          </button>
        </div>
      </div>
    );
  }

  if (hasSentLike) {
    return (
      <div className="fixed inset-x-0 bottom-0 z-30 bg-grey-100 px-5 pb-[2.94rem] pt-2.5">
        <div className="mx-auto flex w-full max-w-[22.625rem] flex-col items-center">
          <button
            type="button"
            disabled
            className="flex h-[3.125rem] w-full cursor-default items-center justify-center rounded-[1.25rem] border-[0.8px] border-primary-600 bg-grey-100 px-2.5 py-2.5 text-primary-600 shadow-[0_0_10px_rgba(255,78,137,0.5)]"
          >
            <span className="typo-button-text-b">
              내가 호감을 보낸 상대예요
            </span>
          </button>
        </div>
      </div>
    );
  }

  if (hasReceivedLike) {
    return (
      <div className="fixed inset-x-0 bottom-0 z-30 bg-grey-100 px-5 pb-[2.94rem] pt-2.5">
        <div className="mx-auto flex w-full max-w-[22.625rem] flex-col items-center gap-2.5">
          <p className="typo-button-text text-primary-500">
            상대방의 사진도 확인 가능해요!
          </p>
          <button
            type="button"
            onClick={onUnblurReceivedLike}
            disabled={isUnblurPending}
            className="flex h-[3.125rem] w-full items-center justify-center rounded-[0.875rem] bg-gradient-to-b from-[#ff98b5] to-[#ff5a99] px-2.5 py-2.5 text-grey-100 disabled:cursor-wait disabled:opacity-80"
          >
            <span className="typo-button-text-b">
              {isUnblurPending ? "카드 확인 중..." : "소개팅 카드 확인하기 (쿠키 2개)"}
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 bg-grey-100 px-5 pb-[2.94rem] pt-2.5">
      <div className="mx-auto flex w-full max-w-[22.625rem] flex-col items-center gap-2.5">
        <p className="typo-button-text-b text-primary-500">
          상대방이 내 소개팅 카드를 확인할 수 있어요
        </p>
        <button
          type="button"
          onClick={onSendLike}
          disabled={isSendLikePending}
          className="flex h-[3.125rem] w-full items-center justify-center rounded-[0.875rem] bg-primary-500 px-2.5 py-2.5 text-grey-100 disabled:cursor-wait disabled:opacity-80"
        >
          <span className="typo-button-text-b">
            {isSendLikePending ? "호감 보내는 중..." : "호감 보내기"}
          </span>
        </button>
      </div>
    </div>
  );
}

function DatingCardDetailPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { cardId = "" } = useParams<{ cardId: string }>();
  const [searchParams] = useSearchParams();
  const detailViewType = getDatingCardDetailViewType(searchParams.get("viewType"));
  const [toastMessage, setToastMessage] = useState("");
  const [actionModal, setActionModal] = useState<DatingDetailModal | null>(null);
  const [isProfilePreviewOpen, setIsProfilePreviewOpen] = useState(false);

  const {
    data: cardDetail,
    isPending,
    isError,
  } = useQuery({
    queryKey: datingCardDetailQueryKey(cardId, detailViewType),
    queryFn: () => fetchDatingCardDetail(cardId, detailViewType),
    enabled: cardId.trim().length > 0,
  });

  const { data: userCookies } = useQuery({
    queryKey: userCookiesQueryKey,
    queryFn: getCookies,
    enabled: actionModal?.type === "paid-like-confirm",
  });

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timerId = window.setTimeout(() => setToastMessage(""), 2500);
    return () => window.clearTimeout(timerId);
  }, [toastMessage]);

  useEffect(() => {
    if (!isProfilePreviewOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProfilePreviewOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isProfilePreviewOpen]);

  const navigateToCookiePurchase = () => {
    navigate("/my/cookie/purchase", {
      state: cookiePurchaseFallbackState,
    });
  };

  const invalidateDatingQueries = async () => {
    await queryClient.invalidateQueries({ queryKey: datingQueryRootKey });
  };

  const fetchCurrentCookieCount = async () => {
    try {
      const result = await queryClient.fetchQuery({
        queryKey: userCookiesQueryKey,
        queryFn: getCookies,
      });

      return result.cookieCount;
    } catch {
      return null;
    }
  };

  const sendLikeMutation = useMutation({
    mutationFn: sendDatingLike,
    onSuccess: async () => {
      await invalidateDatingQueries();
      setActionModal({ type: "send-like-success" });
    },
    onError: (error) => {
      if (isInsufficientCookiesError(error)) {
        navigateToCookiePurchase();
        return;
      }

      setToastMessage(
        getApiErrorMessage(error, "호감 보내기에 실패했어요"),
      );
    },
  });

  const unblurMutation = useMutation({
    mutationFn: unblurReceivedDatingLike,
    onSuccess: async () => {
      const remainingCookieCount = await fetchCurrentCookieCount();
      setActionModal({
        type: "received-unblur-success",
        remainingCookieCount,
      });
    },
    onError: (error) => {
      if (isInsufficientCookiesError(error)) {
        navigateToCookiePurchase();
        return;
      }

      setToastMessage(
        getApiErrorMessage(error, "소개팅 카드 확인에 실패했어요"),
      );
    },
  });

  const matchMutation = useMutation({
    mutationFn: matchReceivedDatingLike,
    onSuccess: async () => {
      setToastMessage("매칭 완료! 서로에게 연락처가 공개되었어요");
      await invalidateDatingQueries();
    },
    onError: (error) => {
      setToastMessage(
        getApiErrorMessage(error, "매칭 요청에 실패했어요"),
      );
    },
  });

  const handleSendLike = () => {
    if (!cardId || !cardDetail || sendLikeMutation.isPending) {
      return;
    }

    if (cardDetail.freeLikeRemaining <= 0) {
      setActionModal({ type: "paid-like-confirm" });
      return;
    }

    sendLikeMutation.mutate(cardId);
  };

  const handleConfirmPaidLike = () => {
    if (!cardId || sendLikeMutation.isPending) {
      return;
    }

    sendLikeMutation.mutate(cardId);
  };

  const handleUnblurReceivedLike = () => {
    if (!cardId || unblurMutation.isPending) {
      return;
    }

    unblurMutation.mutate(cardId);
  };

  const handleConfirmMatch = () => {
    if (!cardId || matchMutation.isPending) {
      return;
    }

    matchMutation.mutate(cardId);
  };

  const handleConfirmReceivedUnblur = () => {
    setActionModal(null);
    void Promise.all([
      invalidateDatingQueries(),
      queryClient.invalidateQueries({ queryKey: userCookiesQueryKey }),
    ]);
  };

  if (!cardId || isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-grey-100 px-5 text-center">
        <p className="typo-button-text text-grey-700">
          소개팅 카드를 찾을 수 없어요
        </p>
      </div>
    );
  }

  if (isPending || !cardDetail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-grey-100">
        <div
          role="status"
          aria-label="소개팅 카드 확인 중"
          className="h-10 w-10 animate-spin rounded-full border-[0.1875rem] border-primary-200 border-t-primary-500"
        />
      </div>
    );
  }

  const isMatched = cardDetail.isMatched;
  const hasSentLike = cardDetail.hasSentLike || isMatched;
  const friendIntroductionItems = getFriendIntroductionItems(cardDetail);
  const selfIntroductionItems = getSelfIntroductionItems(cardDetail);

  return (
    <div className="min-h-screen bg-grey-100">
      <header className="fixed inset-x-0 top-0 z-40 border-b-[0.8px] border-grey-500 bg-grey-100">
        <HeaderTop
          showNotificationIcon
          rightLabel="내정보"
          onRightClick={() => navigate("/my")}
        />
      </header>

      <main className="w-full pb-[11rem] pt-[3.271rem]">
        <section className="relative h-[13.625rem] w-full">
          <CoverImage src={cardDetail.profile} />
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="이전 페이지로 이동"
            className="absolute left-5 top-[0.6875rem] z-10 flex h-[2.125rem] w-[2.125rem] items-center justify-center rounded-[0.625rem] bg-grey-900/70"
          >
            <img src={headerArrow} alt="" className="h-[0.9rem] w-[0.45rem] brightness-0 invert" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (cardDetail.profile) {
                setIsProfilePreviewOpen(true);
              }
            }}
            disabled={!cardDetail.profile}
            aria-label="프로필 사진 확대"
            className="absolute bottom-[0.8125rem] right-5 z-10 flex h-[2.375rem] w-[2.375rem] items-center justify-center rounded-[0.625rem] bg-grey-900/60 disabled:cursor-default disabled:opacity-50"
          >
            <img src={doubleArrowIcon} alt="" className="h-5 w-5" />
          </button>
        </section>

        <div className="mx-auto mt-[1.625rem] flex w-full max-w-[25.1875rem] flex-col gap-[1.875rem] px-5">
          <div className="flex flex-col gap-2.5">
            <ProfileSummary
              nickName={cardDetail.nickName}
              age={cardDetail.age}
              mbti={cardDetail.mbti}
              gender={cardDetail.gender}
              animalProfile={cardDetail.animalProfile}
            />
            {isMatched ? (
              <>
                <MatchedBadge />
                {cardDetail.contact ? (
                  <MatchedContactCard contact={cardDetail.contact} />
                ) : null}
              </>
            ) : cardDetail.hasReceivedLike ? (
              <ReceivedLikeBadge />
            ) : null}
          </div>
          <DetailSection
            title="친구 소개서"
            icon={inviteCreatedIcon}
            items={friendIntroductionItems}
            variant="friend"
          />
          <DetailSection
            title="자기소개"
            icon={flowerIcon}
            items={selfIntroductionItems}
            variant="self"
          />
        </div>
      </main>

      <DetailFooter
        isMatched={isMatched}
        isReceivedLikePaid={cardDetail.hasReceivedLike && cardDetail.isPaidUnblur}
        hasSentLike={hasSentLike}
        hasReceivedLike={cardDetail.hasReceivedLike}
        isSendLikePending={sendLikeMutation.isPending}
        isUnblurPending={unblurMutation.isPending}
        isMatchPending={matchMutation.isPending}
        onSendLike={handleSendLike}
        onUnblurReceivedLike={handleUnblurReceivedLike}
        onConfirmMatch={handleConfirmMatch}
      />

      {isProfilePreviewOpen && cardDetail.profile ? (
        <ProfileImageViewer
          src={cardDetail.profile}
          onClose={() => setIsProfilePreviewOpen(false)}
        />
      ) : null}

      {actionModal ? (
        <DatingDetailActionModal
          modal={actionModal}
          cookieCount={userCookies?.cookieCount ?? null}
          isSendLikePending={sendLikeMutation.isPending}
          onClose={() => setActionModal(null)}
          onConfirmPaidLike={handleConfirmPaidLike}
          onGoDatingHome={() => navigate("/dating")}
          onConfirmReceivedUnblur={handleConfirmReceivedUnblur}
        />
      ) : null}

      {toastMessage && <Toast message={toastMessage} />}
    </div>
  );
}

export default DatingCardDetailPage;
