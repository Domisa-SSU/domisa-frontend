import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import {
  fetchDatingHome,
  type DatingHomeCard,
} from "../../api/datingHome";
import HeaderTop from "../../components/HeaderTop";
import headerArrow from "../../assets/headerArrow.svg";
import reloadIcon from "./assets/reloadIcon.svg";
import datingHeartIcon from "./assets/datingHeartIcon.svg";
import datingDeletedHeartIcon from "./assets/datingDeletedHeartIcon.png";
import datingHeartUnderIcon from "./assets/datingHeartUnderIcon.svg";
import datingArrowIcon from "./assets/datingArrowIcon.svg";
import bothIcon from "./assets/bothIcon.png";
import cardBackImage from "./assets/cardBackImage.png";
import sumnailIcon from "./assets/sumnailIcon.png";

const datingHomeQueryKey = ["dating", "home"] as const;
const refreshReloadStorageKey = "dating:last-refresh-reload-at";
const maxFreeLikeCount = 3;
const temporaryFreeLikeRemaining = 2;

const formatRemainingTime = (totalSeconds: number) => {
  const safeSeconds = Math.max(totalSeconds, 0);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  return [hours, minutes, seconds]
    .map((unit) => String(unit).padStart(2, "0"))
    .join(" : ");
};

const getScrollFadeStatus = (element: HTMLDivElement) => {
  const maxScrollLeft = element.scrollWidth - element.clientWidth;
  const currentScrollLeft = Math.ceil(element.scrollLeft);

  return {
    left: currentScrollLeft > 0,
    right: currentScrollLeft < maxScrollLeft - 1,
  };
};

const getRefreshRemainingSeconds = (
  refreshAvailableAt: string,
  now: number,
) => {
  const refreshTime = new Date(refreshAvailableAt).getTime();

  if (Number.isNaN(refreshTime)) {
    return 0;
  }

  return Math.max(Math.ceil((refreshTime - now) / 1000), 0);
};

const shouldReloadForRefresh = (
  canRefresh: boolean,
  remainingSeconds: number,
) => canRefresh || remainingSeconds <= 0;

const reloadForRefreshOnce = (refreshAvailableAt: string) => {
  if (sessionStorage.getItem(refreshReloadStorageKey) === refreshAvailableAt) {
    return;
  }

  sessionStorage.setItem(refreshReloadStorageKey, refreshAvailableAt);
  window.location.reload();
};

function DatingSubHeader() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-3.5 border-b-[0.8px] border-grey-500 bg-grey-100 px-5 py-2.5">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex h-[2.375rem] w-[1.75rem] items-center justify-start"
        aria-label="이전 페이지로 이동"
      >
        <img src={headerArrow} alt="" className="h-[0.9rem] w-[0.45rem]" />
      </button>
      <h1 className="typo-subtitle-header-2 text-grey-900">소개팅</h1>
    </div>
  );
}

function TimerPanel({ remainingSeconds }: { remainingSeconds: number }) {
  return (
    <section className="mx-auto flex w-full max-w-[22.625rem] flex-col gap-[0.9375rem]">
      <div className="flex flex-col items-center gap-2.5 rounded-[0.625rem] bg-grey-100 py-2.5 text-center">
        <p className="typo-input-text-m text-grey-700">
          시간이 지나면 자동으로 카드가 사라져요
        </p>
        <p className="typo-title-header-1-b text-grey-900">
          {formatRemainingTime(remainingSeconds)}
        </p>
      </div>

      <button
        type="button"
        disabled
        className="flex h-[3.125rem] flex-col items-center justify-center rounded-[0.3125rem] bg-[linear-gradient(180deg,#ff98b5_0%,#ff5a99_100%)] disabled:cursor-default disabled:opacity-100"
      >
        <span className="flex items-center gap-1.5 typo-comment-1-b text-grey-100">
          카드 섞기
          <img src={reloadIcon} alt="" className="h-[0.786rem] w-[1.0125rem]" />
        </span>
        <span className="typo-comment-2 text-primary-200">
          더 많은 솔로가 보고싶다면
        </span>
      </button>
    </section>
  );
}

function ClosedDatingCard() {
  return (
    <div className="h-full w-full rounded-[0.3125rem] bg-[#FFFFFF] p-[0.3125rem] shadow-[0_1px_5px_rgba(0,0,0,0.25)]">
      <img
        src={cardBackImage}
        alt=""
        className="h-full w-full rounded-[0.1875rem] object-cover"
      />
    </div>
  );
}

function OpenDatingCard({ profile }: { profile: string | null }) {
  return (
    <div className="h-full w-full rounded-[0.3125rem] border-[0.25rem] border-grey-100 bg-grey-100 p-[0.1875rem] shadow-[0_1px_5px_rgba(0,0,0,0.2)]">
      <img
        src={profile ?? sumnailIcon}
        alt=""
        className="h-full w-full rounded-[0.25rem] object-cover"
      />
    </div>
  );
}

function DatingCardButton({
  card,
  isOpen,
  onOpen,
  onViewDetail,
}: {
  card: DatingHomeCard;
  isOpen: boolean;
  onOpen: (id: string) => void;
  onViewDetail: (id: string) => void;
}) {
  const handleClick = () => {
    if (isOpen) {
      onViewDetail(card.id);
      return;
    }

    onOpen(card.id);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="h-[7.6875rem] w-[5.3125rem] shrink-0 rounded-[0.3125rem] text-left"
      aria-label={isOpen ? "소개팅 카드 상세 보기" : "소개팅 카드 열기"}
    >
      {isOpen ? (
        <OpenDatingCard profile={card.profile} />
      ) : (
        <ClosedDatingCard />
      )}
    </button>
  );
}

function MainCardSection({
  cards,
  openedCardIds,
  profileNum,
  freeLikeRemaining,
  onOpenCard,
  onViewCardDetail,
}: {
  cards: DatingHomeCard[];
  openedCardIds: Set<string>;
  profileNum: number;
  freeLikeRemaining: number;
  onOpenCard: (id: string) => void;
  onViewCardDetail: (id: string) => void;
}) {
  const heartCount = Math.max(Math.min(maxFreeLikeCount, profileNum), 0);
  const deletedHeartCount = Math.max(
    Math.min(heartCount - freeLikeRemaining, heartCount),
    0,
  );

  return (
    <section className="flex flex-col items-center gap-[0.9375rem]">
      <div className="flex flex-col items-center gap-2.5 text-center">
        <p className="typo-input-text-m text-grey-700">
          소개팅카드를 눌러서 열어보세요
        </p>
        <p className="typo-button-text-b text-primary-600">
          {profileNum}명 중 {freeLikeRemaining}명에게 호감을 보낼 수 있어요
        </p>
      </div>

      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: heartCount }, (_, heartIndex) => (
          <img
            key={heartIndex}
            src={
              heartIndex < deletedHeartCount
                ? datingDeletedHeartIcon
                : datingHeartIcon
            }
            alt=""
            className="h-[1.3125rem] w-[1.5rem]"
          />
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2.5">
        {cards.map((card) => (
          <DatingCardButton
            key={card.id}
            card={card}
            isOpen={openedCardIds.has(card.id)}
            onOpen={onOpenCard}
            onViewDetail={onViewCardDetail}
          />
        ))}
      </div>
    </section>
  );
}

type DatingPreviewItem = Pick<DatingHomeCard, "id" | "profile">;

function DatingPreviewCard({
  card,
  isBlurred,
}: {
  card: DatingPreviewItem;
  isBlurred: boolean;
}) {
  return (
    <div className="h-[7.6875rem] w-[5.3125rem] shrink-0 rounded-[0.3125rem] border-[0.25rem] border-grey-100 bg-grey-100 p-[0.1875rem] shadow-[0_1px_5px_rgba(0,0,0,0.18)]">
      <img
        src={card.profile ?? sumnailIcon}
        alt=""
        className={`h-full w-full rounded-[0.25rem] object-cover ${
          isBlurred ? "blur-[0.125rem]" : ""
        }`}
      />
    </div>
  );
}

function SectionIcon({
  variant,
}: {
  variant: "received" | "sent" | "matched";
}) {
  if (variant === "matched") {
    return <img src={bothIcon} alt="" className="h-[1.125rem] w-[1.125rem]" />;
  }

  const heartIcon = (
    <img src={datingHeartUnderIcon} alt="" className="h-[0.8125rem] w-[0.9375rem]" />
  );
  const arrowIcon = (
    <img src={datingArrowIcon} alt="" className="h-[0.4375rem] w-5" />
  );

  return (
    <span className="flex h-5 w-[2.4375rem] items-center gap-[0.1875rem]">
      {variant === "received" ? (
        <>
          {heartIcon}
          {arrowIcon}
        </>
      ) : (
        <>
          {arrowIcon}
          {heartIcon}
        </>
      )}
    </span>
  );
}

function DatingPreviewSection({
  title,
  cards,
  variant,
  emptyMessage,
  isCardBlurred,
}: {
  title: string;
  cards: DatingPreviewItem[];
  variant: "received" | "sent" | "matched";
  emptyMessage: string;
  isCardBlurred: boolean;
}) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [scrollFadeStatus, setScrollFadeStatus] = useState(() => ({
    left: false,
    right: cards.length > 4,
  }));

  useEffect(() => {
    if (cards.length === 0) {
      setScrollFadeStatus({ left: false, right: false });
      return;
    }

    const scrollContainer = scrollContainerRef.current;

    if (!scrollContainer) {
      return;
    }

    const updateFadeStatus = () => {
      setScrollFadeStatus(getScrollFadeStatus(scrollContainer));
    };

    const frameId = window.requestAnimationFrame(updateFadeStatus);
    const resizeObserver = new ResizeObserver(updateFadeStatus);
    resizeObserver.observe(scrollContainer);

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
    };
  }, [cards.length]);

  return (
    <section className="relative flex flex-col gap-2.5">
      <div className="flex items-center gap-1">
        <h2
          className={`typo-subtitle-header-2 ${
            variant === "matched" ? "text-[#fff5c4]" : "text-grey-900"
          }`}
        >
          {title}
        </h2>
        <SectionIcon variant={variant} />
      </div>

      {cards.length === 0 ? (
        <p className="typo-comment-1 text-grey-800">{emptyMessage}</p>
      ) : (
        <div className="relative -mx-1">
          <div
            ref={scrollContainerRef}
            onScroll={(event) => {
              setScrollFadeStatus(getScrollFadeStatus(event.currentTarget));
            }}
            className="overflow-x-auto scrollbar-hide"
          >
            <div className="flex w-max gap-[0.699rem] px-1">
              {cards.map((card) => (
                <DatingPreviewCard
                  key={card.id}
                  card={card}
                  isBlurred={isCardBlurred}
                />
              ))}
            </div>
          </div>
          {scrollFadeStatus.left && (
            <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#ff88b0] to-[rgba(255,136,176,0)]" />
          )}
          {scrollFadeStatus.right && (
            <div className="pointer-events-none absolute inset-y-0 right-0 w-[4.5rem] bg-gradient-to-l from-[#ff88b0] to-[rgba(255,136,176,0)]" />
          )}
        </div>
      )}
    </section>
  );
}

function DatingPage() {
  const navigate = useNavigate();
  const { data, dataUpdatedAt, isError, isPending } = useQuery({
    queryKey: datingHomeQueryKey,
    queryFn: fetchDatingHome,
    retry: false,
    refetchOnWindowFocus: false,
  });
  const [now, setNow] = useState(() => Date.now());
  const [openedCardState, setOpenedCardState] = useState<{
    dataUpdatedAt: number;
    ids: Set<string>;
  }>(() => ({
    dataUpdatedAt: 0,
    ids: new Set(),
  }));

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  const remainingSeconds = data
    ? getRefreshRemainingSeconds(data.refreshAvailableAt, now)
    : 0;

  useEffect(() => {
    if (
      data &&
      shouldReloadForRefresh(data.canRefresh, remainingSeconds)
    ) {
      reloadForRefreshOnce(data.refreshAvailableAt);
    }
  }, [data, remainingSeconds]);

  const handleOpenCard = (id: string) => {
    setOpenedCardState((prevOpenedCardState) => {
      const nextOpenedCardIds =
        prevOpenedCardState.dataUpdatedAt === dataUpdatedAt
          ? new Set(prevOpenedCardState.ids)
          : new Set<string>();
      nextOpenedCardIds.add(id);
      return {
        dataUpdatedAt,
        ids: nextOpenedCardIds,
      };
    });
  };

  const handleViewCardDetail = (id: string) => {
    navigate(`/dating/cards/${encodeURIComponent(id)}`);
  };

  const visibleCards = useMemo(
    () => data?.cards.slice(0, 8) ?? [],
    [data?.cards],
  );
  const openedCardIds = useMemo(
    () =>
      openedCardState.dataUpdatedAt === dataUpdatedAt
        ? openedCardState.ids
        : new Set<string>(),
    [dataUpdatedAt, openedCardState],
  );

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-grey-100">
        <div
          role="status"
          aria-label="소개팅 정보 확인 중"
          className="h-10 w-10 animate-spin rounded-full border-[0.1875rem] border-primary-200 border-t-primary-500"
        />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-grey-100 px-5 text-center">
        <p className="typo-button-text text-grey-700">
          소개팅 정보를 불러올 수 없어요
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#f9f9f9_0%,#ff88b0_61.8%,#ff73a2_100%)]">
      <header className="fixed inset-x-0 top-0 z-40 bg-grey-100">
        <HeaderTop
          showNotificationIcon
          rightLabel="내정보"
          onRightClick={() => navigate("/my")}
        />
        <DatingSubHeader />
      </header>

      <main className="mx-auto flex w-full max-w-[25.1875rem] flex-col gap-[1.875rem] px-[0.8125rem] pb-12 pt-[7.5875rem]">
        <TimerPanel remainingSeconds={remainingSeconds} />
        <MainCardSection
          cards={visibleCards}
          openedCardIds={openedCardIds}
          profileNum={data.profileNum}
          freeLikeRemaining={temporaryFreeLikeRemaining}
          onOpenCard={handleOpenCard}
          onViewCardDetail={handleViewCardDetail}
        />
        <div className="flex flex-col gap-[1.875rem] px-[0.4375rem]">
          <DatingPreviewSection
            title="받은 호감"
            cards={data.receivedLikes}
            variant="received"
            emptyMessage="아직 받은 호감이 없어요"
            isCardBlurred
          />
          <DatingPreviewSection
            title="보낸 호감"
            cards={data.sentLikes}
            variant="sent"
            emptyMessage="아직 보낸 호감이 없어요"
            isCardBlurred
          />
          <DatingPreviewSection
            title="쌍방 매칭"
            cards={data.matches}
            variant="matched"
            emptyMessage="아직 매칭된 프로필이 없어요"
            isCardBlurred={false}
          />
        </div>
      </main>
    </div>
  );
}

export default DatingPage;
