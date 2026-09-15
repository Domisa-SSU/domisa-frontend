import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";

import {
  fetchDatingHome,
  getUserCookies,
  shuffleDatingCards,
  type DatingHomeCard,
  type DatingHomeResponse,
} from "../../api/datingHome";
import type { DatingCardDetailViewType } from "../../api/datingCardDetail";
import HeaderTop from "../../components/HeaderTop";
import Toast from "../../components/Toast";
import { insufficientCookiesLocationState } from "../../constants/cookieNavigation";
import { DATING_OPENED_CARDS_STORAGE_KEY } from "../../constants/storageKeys";
import { isInsufficientCookiesError } from "../../utils/apiError";
import headerArrow from "../../assets/headerArrow.svg";
import XIcon from "../../assets/X.svg";
import cookieIcon from "../../assets/cookie.svg";
import arrowIcon from "../../assets/arrowIcon.svg";
import reloadIcon from "./assets/reloadIcon.svg";
import datingHeartIcon from "./assets/datingHeartIcon.svg";
import datingDeletedHeartIcon from "./assets/datingDeletedHeartIcon.png";
import datingHeartUnderIcon from "./assets/datingHeartUnderIcon.svg";
import datingArrowIcon from "./assets/datingArrowIcon.svg";
import mutualMatchIcon from "./assets/mutualMatchIcon.svg";
import cardBackImage from "./assets/cardBackImage.png";
import sumnailIcon from "./assets/sumnailIcon.png";
import timerPanelBackground from "./assets/timerPanelBackground.png";
import timerPanelCharacterLeft from "./assets/timerPanelCharacterLeft.png";
import timerPanelCharacterRight from "./assets/timerPanelCharacterRight.png";
import timerPanelLeafLeft from "./assets/timerPanelLeafLeft.svg";
import timerPanelLeafRight from "./assets/timerPanelLeafRight.svg";
import { track } from "../../utils/mixpanel";

const datingHomeQueryKey = ["dating", "home"] as const;
const refreshReloadStorageKey = "dating:last-refresh-reload-at";
const maxFreeLikeCount = 3;
const timerPanelWidth = 352;
const timerPanelHeight = 165;

const datingAccessPreviewData: DatingHomeResponse = {
  refreshAvailableAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  profileNum: 8,
  freeLikeRemaining: 3,
  cards: Array.from({ length: 8 }, (_, index) => ({
    id: `access-preview-card-${index + 1}`,
    publicId: `access-preview-card-${index + 1}`,
    profile: null,
  })),
  receivedLikes: [],
  sentLikes: [],
  matches: [],
};

type DatingPreviewSectionVariant = "received" | "sent" | "matched";

const datingPreviewDetailViewTypeByVariant: Record<
  DatingPreviewSectionVariant,
  DatingCardDetailViewType
> = {
  received: "FAN",
  sent: "NORMAL",
  matched: "NORMAL",
};

const getDatingCardDetailPath = (
  id: string,
  viewType: DatingCardDetailViewType = "NORMAL",
) => {
  const searchParams = new URLSearchParams({ viewType });

  return `/dating/cards/${encodeURIComponent(id)}?${searchParams.toString()}`;
};

const getTimerUnits = (totalSeconds: number) => {
  const safeSeconds = Math.max(totalSeconds, 0);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  return [hours, minutes, seconds].map((unit) =>
    String(unit).padStart(2, "0"),
  );
};

const getAdjacentTimerUnit = (value: string, limit: number) => {
  const numberValue = Number(value);

  return {
    previous: String((numberValue - 1 + limit) % limit).padStart(2, "0"),
    next: String((numberValue + 1) % limit).padStart(2, "0"),
  };
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
  remainingSeconds: number,
) => remainingSeconds <= 0;

const reloadForRefreshOnce = (refreshAvailableAt: string) => {
  if (sessionStorage.getItem(refreshReloadStorageKey) === refreshAvailableAt) {
    return;
  }

  sessionStorage.setItem(refreshReloadStorageKey, refreshAvailableAt);
  window.location.reload();
};

type StoredOpenedDatingCards = {
  refreshAvailableAt: string;
  openedCardIds: string[];
  savedAt: number;
};

const isStoredOpenedDatingCards = (
  value: unknown,
): value is StoredOpenedDatingCards => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.refreshAvailableAt === "string" &&
    Array.isArray(record.openedCardIds) &&
    record.openedCardIds.every((id) => typeof id === "string") &&
    typeof record.savedAt === "number"
  );
};

const readStoredOpenedDatingCards = (): StoredOpenedDatingCards | null => {
  try {
    const rawValue = localStorage.getItem(DATING_OPENED_CARDS_STORAGE_KEY);

    if (!rawValue) {
      return null;
    }

    const parsedValue: unknown = JSON.parse(rawValue);

    return isStoredOpenedDatingCards(parsedValue) ? parsedValue : null;
  } catch {
    return null;
  }
};

const getStoredOpenedCardIds = (refreshAvailableAt: string) => {
  const storedOpenedCards = readStoredOpenedDatingCards();

  return storedOpenedCards?.refreshAvailableAt === refreshAvailableAt
    ? new Set(storedOpenedCards.openedCardIds)
    : new Set<string>();
};

const writeStoredOpenedDatingCards = (
  refreshAvailableAt: string,
  openedCardIds: Set<string>,
) => {
  try {
    localStorage.setItem(
      DATING_OPENED_CARDS_STORAGE_KEY,
      JSON.stringify({
        refreshAvailableAt,
        openedCardIds: Array.from(openedCardIds),
        savedAt: Date.now(),
      }),
    );
  } catch {
    // localStorage can fail in restricted browser modes. The UI still works in memory.
  }
};

const resetStoredOpenedDatingCards = () => {
  try {
    localStorage.removeItem(DATING_OPENED_CARDS_STORAGE_KEY);
  } catch {
    // Ignore storage failures and fall back to the in-memory state.
  }
};

const resetStaleStoredOpenedDatingCards = (refreshAvailableAt: string) => {
  try {
    const rawValue = localStorage.getItem(DATING_OPENED_CARDS_STORAGE_KEY);

    if (!rawValue) {
      return;
    }

    const parsedValue: unknown = JSON.parse(rawValue);

    if (
      !isStoredOpenedDatingCards(parsedValue) ||
      parsedValue.refreshAvailableAt !== refreshAvailableAt
    ) {
      localStorage.removeItem(DATING_OPENED_CARDS_STORAGE_KEY);
    }
  } catch {
    resetStoredOpenedDatingCards();
  }
};

function DatingSubHeader() {
  const navigate = useNavigate();

  return (
    <div className="border-b-[0.8px] border-grey-500 bg-grey-100">
      <div className="relative mx-auto flex w-full max-w-[25.1875rem] items-center px-5 py-2.5">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-[2.375rem] w-[1.75rem] items-center justify-start"
          aria-label="이전 페이지로 이동"
        >
          <img src={headerArrow} alt="" className="h-[0.9rem] w-[0.45rem]" />
        </button>
        <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 typo-subtitle-header-2 text-grey-900">
          소개팅
        </h1>
      </div>
    </div>
  );
}

function RollingTimerUnit({
  value,
  limit,
  left,
}: {
  value: string;
  limit: number;
  left: string;
}) {
  const [displayedValue, setDisplayedValue] = useState(value);
  const isRolling = value !== displayedValue;

  useEffect(() => {
    if (!isRolling) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setDisplayedValue(value);
    }, 380);

    return () => window.clearTimeout(timeoutId);
  }, [isRolling, value]);

  const { previous, next } = getAdjacentTimerUnit(value, limit);

  return (
    <div
      style={{ left }}
      className="absolute inset-y-0 w-[72px] -translate-x-1/2 overflow-hidden [clip-path:inset(20px_0_20px)]"
    >
      {isRolling ? (
        <>
          <span className="timer-slot-roll-previous absolute left-1/2 top-[-9.3px] text-[35px] font-semibold leading-[40px] text-grey-900">
            {previous}
          </span>
          <span className="timer-slot-roll-in absolute left-1/2 top-[36px] text-[40px] font-semibold leading-[44px] text-grey-900">
            {value}
          </span>
          <span className="timer-slot-roll-out absolute left-1/2 top-[73.7px] text-[40px] font-semibold leading-[44px] text-grey-900">
            {displayedValue}
          </span>
        </>
      ) : (
        <>
          <span className="absolute left-1/2 top-[36px] -translate-x-1/2 text-[35px] font-semibold leading-[40px] text-grey-900/10">
            {previous}
          </span>
          <span className="absolute left-1/2 top-[73.7px] -translate-x-1/2 text-[40px] font-semibold leading-[44px] text-grey-900">
            {value}
          </span>
          <span className="absolute left-1/2 top-[119px] -translate-x-1/2 text-[35px] font-semibold leading-[40px] text-grey-900/10">
            {next}
          </span>
        </>
      )}
    </div>
  );
}

function useTimerPanelScale() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const updateScale = () => {
      const availableWidth = container.getBoundingClientRect().width;

      if (availableWidth <= 0) {
        return;
      }

      const nextScale = Math.min(1, availableWidth / timerPanelWidth);
      setScale((currentScale) =>
        Math.abs(currentScale - nextScale) < 0.001 ? currentScale : nextScale,
      );
    };

    updateScale();

    if (typeof ResizeObserver !== "undefined") {
      const resizeObserver = new ResizeObserver(updateScale);
      resizeObserver.observe(container);

      return () => resizeObserver.disconnect();
    }

    window.addEventListener("resize", updateScale);
    window.visualViewport?.addEventListener("resize", updateScale);

    return () => {
      window.removeEventListener("resize", updateScale);
      window.visualViewport?.removeEventListener("resize", updateScale);
    };
  }, []);

  return { containerRef, scale };
}

function TimerPanel({
  remainingSeconds,
  isShuffleLoading,
  onShuffleClick,
}: {
  remainingSeconds: number;
  isShuffleLoading: boolean;
  onShuffleClick: () => void;
}) {
  const [hours, minutes, seconds] = getTimerUnits(remainingSeconds);
  const { containerRef, scale } = useTimerPanelScale();
  const timerUnits = [
    { value: hours, limit: 100, left: "87px" },
    { value: minutes, limit: 60, left: "174px" },
    { value: seconds, limit: 60, left: "259.5px" },
  ];
  const accessibleTimerLabel = `다음 카드까지 ${Number(hours)}시간 ${Number(minutes)}분 ${Number(seconds)}초`;

  return (
    <section className="mx-auto flex w-full max-w-[22.625rem] flex-col gap-[0.9375rem]">
      <div
        ref={containerRef}
        className="relative w-full max-w-[352px]"
        style={{ height: `${timerPanelHeight * scale}px` }}
      >
        <span className="sr-only">{accessibleTimerLabel}</span>
        <div
          aria-hidden="true"
          className="timer-panel-canvas absolute left-1/2 top-0 h-[165px] w-[352px] origin-top"
          style={{ transform: `translateX(-50%) scale(${scale})` }}
        >
          <div className="absolute inset-0 overflow-hidden rounded-[10px] shadow-[0_4px_12px_rgba(206,206,206,0.45)]">
            <img
              src={timerPanelBackground}
              alt=""
              className="absolute -left-[2.19%] -top-[11.93%] h-[117.45%] w-[105.36%] max-w-none"
            />
          </div>

          <img
            src={timerPanelCharacterLeft}
            alt=""
            className="absolute -left-[24px] top-0 h-[75px] w-[75px] object-contain"
          />

          <div className="absolute left-1/2 top-[7.7px] flex -translate-x-1/2 items-center gap-[4px] whitespace-nowrap">
            <img
              src={timerPanelLeafLeft}
              alt=""
              className="h-[12.1px] w-[14.3px]"
            />
            <span className="text-[15.4px] font-bold leading-[18.7px] text-primary-400">
              다음 카드까지
            </span>
            <img
              src={timerPanelLeafRight}
              alt=""
              className="h-[12.1px] w-[14.3px]"
            />
          </div>

          <div className="absolute inset-0 overflow-hidden rounded-[10px] text-center">
            {timerUnits.map(({ value, limit, left }) => (
              <RollingTimerUnit
                key={left}
                value={value}
                limit={limit}
                left={left}
              />
            ))}
            <span className="absolute left-[130.8px] top-[70.4px] -translate-x-1/2 text-[44px] font-bold leading-[44px] text-primary-900">
              :
            </span>
            <span className="absolute left-[217.7px] top-[70.4px] -translate-x-1/2 text-[44px] font-bold leading-[44px] text-primary-900">
              :
            </span>
          </div>

          <img
            src={timerPanelCharacterRight}
            alt=""
            className="absolute left-[307px] top-[101px] h-[61px] w-[70px] object-contain"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onShuffleClick}
        disabled={isShuffleLoading}
        className="flex h-[3.6875rem] flex-col items-center justify-center rounded-[0.625rem] bg-[linear-gradient(180deg,#fe77b0_13.161%,#ec1479_100.03%)] disabled:cursor-wait disabled:opacity-80"
      >
        <span className="flex items-center gap-1.5 typo-button-text-b text-grey-100">
          카드 섞기
          <img src={reloadIcon} alt="" className="h-[0.875rem] w-[1.125rem]" />
        </span>
        <span className="typo-comment-2 text-primary-200">
          더 많은 솔로가 보고싶다면
        </span>
      </button>
    </section>
  );
}

function ShuffleConfirmModal({
  cookieCount,
  isShuffling,
  onClose,
  onConfirm,
}: {
  cookieCount: number;
  isShuffling: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-grey-900/70 px-[1.9375rem]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="shuffle-confirm-title"
        className="relative flex w-full max-w-[21.25rem] flex-col items-center justify-center gap-[0.9375rem] rounded-[0.875rem] bg-white pb-5 pt-10"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 flex p-2.5"
          aria-label="닫기"
        >
          <img src={XIcon} alt="" className="h-[1.0625rem] w-4" />
        </button>

        <div className="flex flex-col items-center gap-[0.9375rem]">
          <div
            id="shuffle-confirm-title"
            className="typo-subtitle-header-2 text-center text-grey-900"
          >
            <p>카드를 섞어</p>
            <p>새로운 사람들을 볼까요?</p>
          </div>
          <p className="typo-input-text-m text-center text-grey-700">
            내 쿠키 : {cookieCount}개
          </p>
          <p className="typo-input-text-m text-center text-warning">
            이미 열람한 카드가 다시 나올 수 있어요
          </p>
        </div>

        <button
          type="button"
          onClick={onConfirm}
          disabled={isShuffling}
          className="flex h-[3.125rem] w-[18.75rem] items-center justify-center gap-1 rounded-[0.875rem] bg-primary-500 typo-button-text-b text-grey-100 disabled:cursor-wait disabled:opacity-80"
        >
          <span>쿠키 2개로 카드 섞기</span>
          <img src={cookieIcon} alt="" className="h-4 w-4" />
          <img src={arrowIcon} alt="" className="h-3 w-[0.8125rem]" />
        </button>
      </div>
    </div>
  );
}

function ClosedDatingCard() {
  return (
    <div className="h-full w-full rounded-[0.3125rem] bg-grey-100 p-[0.3rem] shadow-[0_1px_5px_rgba(0,0,0,0.25)]">
      <img
        src={cardBackImage}
        alt=""
        className="h-full w-full rounded-[0.25rem] object-cover"
      />
    </div>
  );
}

function OpenDatingCard({ profile }: { profile: string | null }) {
  return (
    <div className="h-full w-full rounded-[0.3125rem] bg-grey-100 p-[0.3rem] shadow-[0_1px_5px_rgba(0,0,0,0.2)]">
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
  const heartCount = maxFreeLikeCount;
  const deletedHeartCount = Math.max(
    Math.min(heartCount - freeLikeRemaining, heartCount),
    0,
  );
  const likeGuideText =
    freeLikeRemaining <= 0
      ? "쿠키 1개로 추가 호감을 보낼 수 있어요"
      : `${profileNum}명 중 ${freeLikeRemaining}명에게 호감을 보낼 수 있어요`;

  return (
    <section className="flex flex-col items-center gap-[0.9375rem]">
      <div className="flex flex-col items-center gap-2.5 text-center">
        <p className="typo-input-text-m text-[#5b3649]">
          소개팅카드를 눌러서 열어보세요
        </p>
        <p className="typo-button-text-b text-primary-600">
          {likeGuideText}
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
  onViewDetail,
}: {
  card: DatingPreviewItem;
  onViewDetail: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onViewDetail(card.id)}
      className="h-[7.6875rem] w-[5.3125rem] shrink-0 rounded-[0.3125rem] text-left"
      aria-label="소개팅 카드 상세 보기"
    >
      <OpenDatingCard profile={card.profile} />
    </button>
  );
}

function SectionIcon({
  variant,
}: {
  variant: "received" | "sent" | "matched";
}) {
  if (variant === "matched") {
    return (
      <img
        src={mutualMatchIcon}
        alt=""
        className="h-[0.8125rem] w-[2.4568rem]"
      />
    );
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
  onMore,
  onViewDetail,
}: {
  title: string;
  cards: DatingPreviewItem[];
  variant: DatingPreviewSectionVariant;
  emptyMessage: string;
  onMore: () => void;
  onViewDetail: (id: string, viewType: DatingCardDetailViewType) => void;
}) {
  const detailViewType = datingPreviewDetailViewTypeByVariant[variant];
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [scrollFadeStatus, setScrollFadeStatus] = useState(() => ({
    left: false,
    right: cards.length > 4,
  }));

  useEffect(() => {
    if (cards.length === 0) {
      const frameId = window.requestAnimationFrame(() => {
        setScrollFadeStatus({ left: false, right: false });
      });

      return () => {
        window.cancelAnimationFrame(frameId);
      };
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
    <section
      className={`relative flex flex-col ${
        variant === "received" ? "gap-[0.9375rem]" : "gap-2.5"
      }`}
    >
      <div className="flex items-center justify-between">
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
        <button
          type="button"
          onClick={onMore}
          className="typo-comment-1 text-grey-800/50 underline underline-offset-0"
        >
          더보기 &gt;
        </button>
      </div>

      {cards.length === 0 ? (
        <p className="typo-comment-1 text-[#837175]">{emptyMessage}</p>
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
                  onViewDetail={(id) => onViewDetail(id, detailViewType)}
                />
              ))}
            </div>
          </div>
          {scrollFadeStatus.left && (
            <div className="pointer-events-none absolute inset-y-0 left-0 w-10 dating-scroll-fade-left" />
          )}
          {scrollFadeStatus.right && (
            <div className="pointer-events-none absolute inset-y-0 right-0 w-[4.5rem] dating-scroll-fade-right" />
          )}
        </div>
      )}
    </section>
  );
}

function DatingPage({ preview = false }: { preview?: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { data, isError, isPending } = useQuery({
    queryKey: datingHomeQueryKey,
    queryFn: fetchDatingHome,
    enabled: !preview,
    retry: false,
    refetchOnWindowFocus: false,
  });
  const [now, setNow] = useState(() => Date.now());
  const [shuffleCookieCount, setShuffleCookieCount] = useState<number | null>(
    null,
  );
  const [toastMessage, setToastMessage] = useState("");
  const [openedCardState, setOpenedCardState] = useState<{
    refreshAvailableAt: string;
    ids: Set<string>;
  }>(() => ({
    refreshAvailableAt: "",
    ids: new Set(),
  }));
  const datingData = preview ? datingAccessPreviewData : data;

  const showToast = (message: string) => {
    setToastMessage("");
    window.setTimeout(() => setToastMessage(message), 0);
  };

  const navigateToInsufficientCookiesPage = () => {
    navigate("/my/cookie", {
      state: { ...insufficientCookiesLocationState, returnTo: location.pathname },
    });
  };

  const userCookiesMutation = useMutation({
    mutationFn: getUserCookies,
    onSuccess: (result) => {
      setShuffleCookieCount(result.cookieCount);
    },
    onError: () => {
      showToast("쿠키 정보를 불러오지 못했어요");
    },
  });

  const shuffleCardsMutation = useMutation({
    mutationFn: shuffleDatingCards,
    onSuccess: async () => {
      // 쿠키를 어디에 쓰는지 보려고 소비처를 하나의 이벤트로 모은다.
      track("cookie_spent", { feature: "shuffle" });
      setShuffleCookieCount(null);
      resetStoredOpenedDatingCards();
      setOpenedCardState({
        refreshAvailableAt: data?.refreshAvailableAt ?? "",
        ids: new Set(),
      });
      showToast("카드가 섞였어요!");
      await queryClient.invalidateQueries({ queryKey: datingHomeQueryKey });
    },
    onError: (error) => {
      if (isInsufficientCookiesError(error)) {
        setShuffleCookieCount(null);
        navigateToInsufficientCookiesPage();
        return;
      }

      showToast("카드 섞기에 실패했어요");
    },
  });

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => setToastMessage(""), 2500);

    return () => window.clearTimeout(timeoutId);
  }, [toastMessage]);

  const remainingSeconds = datingData
    ? getRefreshRemainingSeconds(datingData.refreshAvailableAt, now)
    : 0;

  useEffect(() => {
    if (
      !preview &&
      data &&
      shouldReloadForRefresh(remainingSeconds)
    ) {
      reloadForRefreshOnce(data.refreshAvailableAt);
    }
  }, [data, preview, remainingSeconds]);

  useEffect(() => {
    if (preview || !data) {
      return;
    }

    resetStaleStoredOpenedDatingCards(data.refreshAvailableAt);
  }, [data, preview]);

  const handleOpenCard = (id: string) => {
    if (preview || !datingData) {
      return;
    }

    setOpenedCardState((prevOpenedCardState) => {
      const nextOpenedCardIds =
        prevOpenedCardState.refreshAvailableAt === datingData.refreshAvailableAt
          ? new Set(prevOpenedCardState.ids)
          : getStoredOpenedCardIds(datingData.refreshAvailableAt);
      nextOpenedCardIds.add(id);
      writeStoredOpenedDatingCards(datingData.refreshAvailableAt, nextOpenedCardIds);

      return {
        refreshAvailableAt: datingData.refreshAvailableAt,
        ids: nextOpenedCardIds,
      };
    });
  };

  const handleViewCardDetail = (
    id: string,
    viewType: DatingCardDetailViewType = "NORMAL",
  ) => {
    if (preview) {
      return;
    }

    navigate(getDatingCardDetailPath(id, viewType));
  };

  const handleShuffleButtonClick = () => {
    if (preview || userCookiesMutation.isPending) {
      return;
    }

    userCookiesMutation.mutate();
  };

  const handleShuffleConfirm = () => {
    if (
      shuffleCookieCount === null ||
      shuffleCardsMutation.isPending
    ) {
      return;
    }

    shuffleCardsMutation.mutate();
  };

  const visibleCards = useMemo(
    () => datingData?.cards.slice(0, 8) ?? [],
    [datingData?.cards],
  );
  const openedCardIds = useMemo(
    () => {
      if (!datingData) {
        return new Set<string>();
      }

      if (preview) {
        return new Set(datingAccessPreviewData.cards.map((card) => card.id));
      }

      return openedCardState.refreshAvailableAt === datingData.refreshAvailableAt
        ? openedCardState.ids
        : getStoredOpenedCardIds(datingData.refreshAvailableAt);
    },
    [datingData, openedCardState, preview],
  );

  if (!preview && isPending) {
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

  if (!preview && (isError || !data)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-grey-100 px-5 text-center">
        <p className="typo-button-text text-grey-700">
          소개팅 정보를 불러올 수 없어요
        </p>
      </div>
    );
  }

  const renderedDatingData = datingData ?? datingAccessPreviewData;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[linear-gradient(180.1deg,#ff98ba_0%,#ffceaf_63.759%,#ff88b0_110.49%)]">
      <header className="fixed top-0 left-1/2 w-full frame-max-w -translate-x-1/2 z-40 bg-grey-100">
        <HeaderTop
          showNotificationIcon
          rightLabel="내정보"
          onRightClick={() => navigate("/my")}
        />
        <DatingSubHeader />
      </header>

      <main className="mx-auto flex w-full max-w-[25.1875rem] flex-col gap-[1.875rem] px-[0.8125rem] pb-12 pt-[7.5875rem]">
        <TimerPanel
          remainingSeconds={remainingSeconds}
          isShuffleLoading={userCookiesMutation.isPending}
          onShuffleClick={handleShuffleButtonClick}
        />
        <MainCardSection
          cards={visibleCards}
          openedCardIds={openedCardIds}
          profileNum={renderedDatingData.profileNum}
          freeLikeRemaining={renderedDatingData.freeLikeRemaining}
          onOpenCard={handleOpenCard}
          onViewCardDetail={handleViewCardDetail}
        />
        <div className="flex flex-col gap-[1.875rem] px-[0.4375rem]">
          <DatingPreviewSection
            title="받은 호감"
            cards={renderedDatingData.receivedLikes}
            variant="received"
            emptyMessage="아직 받은 호감이 없어요"
            onMore={() => navigate("/my/likes-received")}
            onViewDetail={handleViewCardDetail}
          />
          <DatingPreviewSection
            title="보낸 호감"
            cards={renderedDatingData.sentLikes}
            variant="sent"
            emptyMessage="아직 보낸 호감이 없어요"
            onMore={() => navigate("/my/likes-sent")}
            onViewDetail={handleViewCardDetail}
          />
          <DatingPreviewSection
            title="쌍방 매칭"
            cards={renderedDatingData.matches}
            variant="matched"
            emptyMessage="아직 매칭된 프로필이 없어요"
            onMore={() => navigate("/my/mutual-match")}
            onViewDetail={handleViewCardDetail}
          />
        </div>
      </main>
      {shuffleCookieCount !== null && (
        <ShuffleConfirmModal
          cookieCount={shuffleCookieCount}
          isShuffling={shuffleCardsMutation.isPending}
          onClose={() => setShuffleCookieCount(null)}
          onConfirm={handleShuffleConfirm}
        />
      )}
      {toastMessage && <Toast message={toastMessage} />}
    </div>
  );
}

export default DatingPage;
