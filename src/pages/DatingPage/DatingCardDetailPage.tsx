import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

import {
  datingCardDetailQueryKey,
  fetchDatingCardDetail,
  type DatingCardDetailSectionItem,
} from "../../api/datingCardDetail";
import HeaderTop from "../../components/HeaderTop";
import Toast from "../../components/Toast";
import catIcon from "../../assets/catIcon.svg";
import headerArrow from "../../assets/headerArrow.svg";
import flowerIcon from "../../assets/flowerIcon.svg";
import inviteCreatedIcon from "../IntroduceFriendPage/assets/inviteCreatedIcon.svg";

function CoverImage({ src }: { src: string | null }) {
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
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <div
          className="h-full w-full bg-[linear-gradient(135deg,#f6f6f6_0%,#ffcde3_45%,#e0e0e0_100%)]"
        />
      )}
    </div>
  );
}

function ProfileSummary({
  nickname,
  birthYearText,
  mbti,
  gender,
}: {
  nickname: string;
  birthYearText: string;
  mbti: string;
  gender: string;
}) {
  return (
    <section className="flex items-center gap-[0.945rem]">
      <div className="h-[4.568rem] w-[4.568rem] shrink-0 overflow-hidden rounded-full bg-primary-100 p-1">
        <img src={catIcon} alt="" className="h-full w-full object-contain" />
      </div>
      <div className="flex flex-col gap-[0.4725rem]">
        <h1 className="typo-title-header-1 text-grey-900">{nickname}</h1>
        <p className="typo-comment-1-m text-grey-700">
          {birthYearText} · {mbti} · {gender}
        </p>
      </div>
    </section>
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
        <h3 className="typo-input-text text-grey-900">{item.title}</h3>
        <p className="whitespace-pre-line typo-input-text text-primary-500">
          {item.content}
        </p>
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

function DatingCardDetailPage() {
  const navigate = useNavigate();
  const { cardId = "" } = useParams<{ cardId: string }>();
  const [showToast, setShowToast] = useState(false);
  const [hasSentLike, setHasSentLike] = useState(false);

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
    if (cardDetail) {
      setHasSentLike(cardDetail.hasSentLike);
    }
  }, [cardDetail]);

  useEffect(() => {
    if (!showToast) {
      return;
    }

    const timerId = window.setTimeout(() => setShowToast(false), 2500);
    return () => window.clearTimeout(timerId);
  }, [showToast]);

  const handleSendLike = () => {
    if (hasSentLike) {
      return;
    }

    setHasSentLike(true);
    setShowToast(true);
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

  return (
    <div className="min-h-screen bg-grey-100">
      <header className="fixed inset-x-0 top-0 z-40 border-b-[0.8px] border-grey-500 bg-grey-100">
        <HeaderTop
          showNotificationIcon
          rightLabel="내정보"
          onRightClick={() => navigate("/my")}
        />
      </header>

      <main className="w-full pb-[10.75rem] pt-[3.271rem]">
        <section className="relative h-[13.625rem] w-full">
          <CoverImage src={cardDetail.coverImageUrl} />
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
          <ProfileSummary
            nickname={cardDetail.nickname}
            birthYearText={cardDetail.birthYearText}
            mbti={cardDetail.mbti}
            gender={cardDetail.gender}
          />
          <DetailSection
            title="친구 소개서"
            icon={inviteCreatedIcon}
            items={cardDetail.friendIntroduction}
            variant="friend"
          />
          <DetailSection
            title="자기소개"
            icon={flowerIcon}
            items={cardDetail.selfIntroduction}
            variant="self"
          />
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 bg-grey-100 px-5 pb-[2.94rem] pt-2.5">
        <div className="mx-auto flex w-full max-w-[22.625rem] flex-col items-center gap-2.5">
          <p className="typo-button-text-b text-primary-500">
            상대방이 내 소개팅 카드를 확인할 수 있어요
          </p>
          <button
            type="button"
            onClick={handleSendLike}
            disabled={hasSentLike}
            className={`flex h-[3.125rem] w-full items-center justify-center rounded-[0.875rem] px-2.5 py-2.5 ${
              hasSentLike
                ? "cursor-default bg-grey-400 text-grey-100"
                : "bg-primary-500 text-grey-100"
            }`}
          >
            <span className="typo-button-text-b">
              {hasSentLike ? "호감 보냄" : "호감 보내기"}
            </span>
          </button>
        </div>
      </div>

      {showToast && <Toast message="호감을 보냈어요" />}
    </div>
  );
}

export default DatingCardDetailPage;
