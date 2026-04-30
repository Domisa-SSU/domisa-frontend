import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import {
  fetchDatingHome,
  initialDatingHomeData,
  type DatingHomeCard,
  type DatingCardVariant,
} from "../../api/datingHome";
import HeaderTop from "../../components/HeaderTop";
import headerArrow from "../../assets/headerArrow.svg";
import reloadIcon from "./assets/reloadIcon.svg";
import datingHeartIcon from "./assets/datingHeartIcon.svg";
import datingHeartUnderIcon from "./assets/datingHeartUnderIcon.svg";
import datingArrowIcon from "./assets/datingArrowIcon.svg";

const datingHomeQueryKey = ["dating", "home"] as const;

const cardFrontStyles: Record<DatingCardVariant, string> = {
  night: "from-[#1a1b2e] via-[#755377] to-[#ff9bb9]",
  sunset: "from-[#f3c09d] via-[#b96e6b] to-[#4c2d3b]",
  sky: "from-[#dcefff] via-[#8ab2c8] to-[#344759]",
  forest: "from-[#f4c789] via-[#526b62] to-[#1d3540]",
  lavender: "from-[#f3d9ff] via-[#a88ec3] to-[#554a78]",
  peach: "from-[#ffe2d2] via-[#ff9cb8] to-[#985d79]",
};

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
    <div className="relative h-full w-full overflow-hidden rounded-[0.3125rem] border-[0.25rem] border-grey-100 bg-[#171720] shadow-[0_1px_5px_rgba(0,0,0,0.25)]">
      <div className="absolute -left-1 top-4 h-16 w-8 rotate-[35deg] bg-primary-300" />
      <div className="absolute left-8 top-0 h-20 w-7 rotate-[35deg] bg-primary-200" />
      <div className="absolute inset-x-2 top-[3.35rem] -rotate-[9deg] rounded-full bg-primary-500 px-1 py-0.5 text-center text-[0.42rem] font-bold leading-none text-grey-100">
        DOMISA LOVE
      </div>
      <div className="absolute bottom-2 right-2 h-8 w-8 rounded-full border border-primary-300 opacity-50" />
    </div>
  );
}

function OpenDatingCard({ variant }: { variant: DatingCardVariant }) {
  return (
    <div className="h-full w-full rounded-[0.3125rem] border-[0.25rem] border-grey-100 bg-grey-100 p-[0.1875rem] shadow-[0_1px_5px_rgba(0,0,0,0.2)]">
      <div
        className={`relative h-full w-full overflow-hidden rounded-[0.25rem] bg-gradient-to-br ${cardFrontStyles[variant]}`}
      >
        <div className="absolute inset-0 backdrop-blur-[2px]" />
        <div className="absolute left-1/2 top-5 h-12 w-12 -translate-x-1/2 rounded-full bg-grey-100/35 blur-[0.1875rem]" />
        <div className="absolute bottom-0 left-1/2 h-16 w-14 -translate-x-1/2 rounded-t-full bg-grey-100/30 blur-[0.125rem]" />
      </div>
    </div>
  );
}

function DatingCardButton({
  card,
  isOpen,
  onOpen,
}: {
  card: DatingHomeCard;
  isOpen: boolean;
  onOpen: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(card.id)}
      disabled={isOpen}
      className="h-[7.6875rem] w-[5.3125rem] shrink-0 rounded-[0.3125rem] text-left disabled:cursor-default"
      aria-label={isOpen ? "열린 소개팅 카드" : "소개팅 카드 열기"}
    >
      {isOpen ? <OpenDatingCard variant={card.variant} /> : <ClosedDatingCard />}
    </button>
  );
}

function MainCardSection({
  cards,
  openedCardIds,
  onOpenCard,
}: {
  cards: DatingHomeCard[];
  openedCardIds: Set<string>;
  onOpenCard: (id: string) => void;
}) {
  return (
    <section className="flex flex-col items-center gap-[0.9375rem]">
      <div className="flex flex-col items-center gap-2.5 text-center">
        <p className="typo-input-text-m text-grey-700">
          소개팅카드를 눌러서 열어보세요
        </p>
        <p className="typo-button-text-b text-primary-600">
          8명 중 3명에게 호감을 보낼 수 있어요
        </p>
      </div>

      <div className="flex items-center justify-center gap-2">
        {[0, 1, 2].map((heartIndex) => (
          <img
            key={heartIndex}
            src={datingHeartIcon}
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
          />
        ))}
      </div>
    </section>
  );
}

function LikePreviewCard({ card }: { card: DatingHomeCard }) {
  return (
    <div className="h-[7.6875rem] w-[5.3125rem] shrink-0 rounded-[0.3125rem] border-[0.25rem] border-grey-100 bg-grey-100 p-[0.1875rem] shadow-[0_1px_5px_rgba(0,0,0,0.18)]">
      <div
        className={`h-full w-full rounded-[0.25rem] bg-gradient-to-br ${cardFrontStyles[card.variant]} blur-[0.125rem]`}
      />
    </div>
  );
}

function SectionIconPair({ direction }: { direction: "received" | "sent" }) {
  const heartIcon = (
    <img src={datingHeartUnderIcon} alt="" className="h-[0.8125rem] w-[0.9375rem]" />
  );
  const arrowIcon = (
    <img src={datingArrowIcon} alt="" className="h-[0.4375rem] w-5" />
  );

  return (
    <span className="flex h-5 w-[2.4375rem] items-center gap-[0.1875rem]">
      {direction === "received" ? (
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

function LikePreviewSection({
  title,
  cards,
  direction,
}: {
  title: string;
  cards: DatingHomeCard[];
  direction: "received" | "sent";
}) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [scrollFadeStatus, setScrollFadeStatus] = useState(() => ({
    left: false,
    right: cards.length > 4,
  }));

  useEffect(() => {
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
        <h2 className="typo-subtitle-header-2 text-grey-900">{title}</h2>
        <SectionIconPair direction={direction} />
      </div>

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
              <LikePreviewCard key={card.id} card={card} />
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
    </section>
  );
}

function DatingPage() {
  const navigate = useNavigate();
  const [initialDataUpdatedAt] = useState(() => Date.now());
  const { data, refetch, dataUpdatedAt, isFetching } = useQuery({
    queryKey: datingHomeQueryKey,
    queryFn: fetchDatingHome,
    initialData: initialDatingHomeData,
    initialDataUpdatedAt,
  });
  const [now, setNow] = useState(() => Date.now());
  const [openedCardState, setOpenedCardState] = useState<{
    dataUpdatedAt: number;
    ids: Set<string>;
  }>(() => ({
    dataUpdatedAt: dataUpdatedAt,
    ids: new Set(),
  }));

  const elapsedSeconds = Math.max(
    Math.floor((now - dataUpdatedAt) / 1000),
    0,
  );
  const remainingSeconds = Math.max(data.remainingSeconds - elapsedSeconds, 0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (remainingSeconds <= 0 && !isFetching) {
      void refetch();
    }
  }, [isFetching, refetch, remainingSeconds]);

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

  const visibleCards = useMemo(() => data.cards.slice(0, 8), [data.cards]);
  const openedCardIds = useMemo(
    () =>
      openedCardState.dataUpdatedAt === dataUpdatedAt
        ? openedCardState.ids
        : new Set<string>(),
    [dataUpdatedAt, openedCardState],
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#f9f9f9_0%,#ff88b0_61.8%,#ff73a2_100%)]">
      <header className="bg-grey-100">
        <HeaderTop rightLabel="내정보" onRightClick={() => navigate("/my")} />
        <DatingSubHeader />
      </header>

      <main className="mx-auto flex w-full max-w-[25.1875rem] flex-col gap-[1.875rem] px-[0.8125rem] pb-12 pt-[1.1875rem]">
        <TimerPanel remainingSeconds={remainingSeconds} />
        <MainCardSection
          cards={visibleCards}
          openedCardIds={openedCardIds}
          onOpenCard={handleOpenCard}
        />
        <div className="flex flex-col gap-[1.875rem] px-[0.4375rem]">
          <LikePreviewSection
            title="받은 호감"
            cards={data.receivedLikes}
            direction="received"
          />
          <LikePreviewSection
            title="보낸 호감"
            cards={data.sentLikes}
            direction="sent"
          />
        </div>
      </main>
    </div>
  );
}

export default DatingPage;
