import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

import {
  datingCardDetailQueryKey,
  fetchDatingCardDetail,
  type DatingCardDetailContact,
  type DatingCardDetailResponse,
} from "../../api/datingCardDetail";
import type { AnimalProfile } from "../../api/users";
import HeaderTop from "../../components/HeaderTop";
import Toast from "../../components/Toast";
import flowerIcon from "../../assets/flowerIcon.svg";
import headerArrow from "../../assets/headerArrow.svg";
import heartIcon from "../../assets/heartIcon.svg";
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
import lockIcon from "./assets/lockIcon.png";

type DatingCardDetailSectionItem = {
  title: string;
  content: string;
  isLocked?: boolean;
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
  isPrivateInfoUnlocked: boolean,
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
    content: cardDetail.q3 ?? createLockedPlaceholder(cardDetail.q3Length),
    isLocked: cardDetail.isBlurred && !isPrivateInfoUnlocked,
  },
];

const getSelfIntroductionItems = (
  cardDetail: DatingCardDetailResponse,
  isPrivateInfoUnlocked: boolean,
): DatingCardDetailSectionItem[] => [
  {
    title: "원하는 연애 스타일을 적어주세요",
    content: cardDetail.datingStyle,
  },
  {
    title: "이상형을 한 줄로 적어주세요",
    content: cardDetail.idealType,
    isLocked: cardDetail.isBlurred && !isPrivateInfoUnlocked,
  },
];

const contactTypeLabels: Record<DatingCardDetailContact["type"], string> = {
  PHONE: "전화번호",
  KAKAO: "카카오톡 ID",
  INSTAGRAM: "인스타 ID",
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
            {age}세 · {mbti} · {gender ? "남" : "여"}
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

function DetailFooter({
  isMatched,
  isReceivedLikePaid,
  hasSentLike,
  hasReceivedLike,
  onSendLike,
  onConfirmMatch,
}: {
  isMatched: boolean;
  isReceivedLikePaid: boolean;
  hasSentLike: boolean;
  hasReceivedLike: boolean;
  onSendLike: () => void;
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
            className="flex h-[3.125rem] w-full items-center justify-center rounded-[0.875rem] bg-[linear-gradient(178deg,#ff8b6e_22.19%,#ffc14e_90.53%)] px-2.5 py-2.5 text-grey-100"
          >
            <span className="flex items-center gap-1 typo-button-text-b">
              호감 보내고 매칭되기 (무료)
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
            className="flex h-[3.125rem] w-full items-center justify-center rounded-[0.875rem] bg-gradient-to-b from-[#ff98b5] to-[#ff5a99] px-2.5 py-2.5 text-grey-100"
          >
            <span className="typo-button-text-b">
              소개팅 카드 확인하기 (쿠키 2개)
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
          className="flex h-[3.125rem] w-full items-center justify-center rounded-[0.875rem] bg-primary-500 px-2.5 py-2.5 text-grey-100"
        >
          <span className="typo-button-text-b">호감 보내기</span>
        </button>
      </div>
    </div>
  );
}

function DatingCardDetailPage() {
  const navigate = useNavigate();
  const { cardId = "" } = useParams<{ cardId: string }>();
  const [toastMessage, setToastMessage] = useState("");
  const [hasSentLikeOverride, setHasSentLikeOverride] = useState(false);
  const [isMatchedOverride, setIsMatchedOverride] = useState(false);

  const {
    data: cardDetail,
    isPending,
    isError,
  } = useQuery({
    queryKey: datingCardDetailQueryKey(cardId),
    queryFn: () => fetchDatingCardDetail(cardId),
    enabled: cardId.trim().length > 0,
  });

  useEffect(() => {
    setHasSentLikeOverride(false);
    setIsMatchedOverride(false);
    setToastMessage("");
  }, [cardId]);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timerId = window.setTimeout(() => setToastMessage(""), 2500);
    return () => window.clearTimeout(timerId);
  }, [toastMessage]);

  useEffect(() => {
    if (import.meta.env.DEV && cardId === "mock-matched" && cardDetail?.isMatched) {
      setToastMessage("매칭 완료! 서로에게 연락처가 공개되었어요");
    }
  }, [cardDetail?.isMatched, cardId]);

  const handleSendLike = () => {
    setHasSentLikeOverride(true);
    setToastMessage("호감을 보냈어요");
  };

  const handleConfirmMatch = () => {
    setHasSentLikeOverride(true);
    setIsMatchedOverride(true);
    setToastMessage("매칭 완료! 서로에게 연락처가 공개되었어요");
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

  const isMatched = cardDetail.isMatched || isMatchedOverride;
  const hasSentLike = cardDetail.hasSentLike || hasSentLikeOverride || isMatched;
  const isReceivedLikePaid =
    cardDetail.hasReceivedLike && cardDetail.hasPaidForReceivedLike === true;
  const isPrivateInfoUnlocked = isMatched || isReceivedLikePaid;
  const friendIntroductionItems = getFriendIntroductionItems(
    cardDetail,
    isPrivateInfoUnlocked,
  );
  const selfIntroductionItems = getSelfIntroductionItems(
    cardDetail,
    isPrivateInfoUnlocked,
  );

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
            className="absolute left-5 top-[0.6875rem] z-10 flex h-[2.15rem] w-[1.7rem] items-center drop-shadow-[0_0_5px_rgba(0,0,0,0.6)]"
          >
            <img src={headerArrow} alt="" className="h-[0.9rem] w-[0.45rem]" />
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
        isReceivedLikePaid={isReceivedLikePaid}
        hasSentLike={hasSentLike}
        hasReceivedLike={cardDetail.hasReceivedLike}
        onSendLike={handleSendLike}
        onConfirmMatch={handleConfirmMatch}
      />

      {toastMessage && <Toast message={toastMessage} />}
    </div>
  );
}

export default DatingCardDetailPage;
