import { useEffect, useState } from "react";
import NotLoginHeader from "../../components/NotLoginHeader";
import HeaderArrow from "../../assets/headerArrow.svg?react";
import dayBgImg from "../../assets/homePageDayBackGround.jpg";
import nightBgImg from "../../assets/homePageNightBackGround.jpg";
import domisaBoothImg from "../../assets/domisaBooth.png";
import { BOOTHS } from "./boothData";
import BoothDetailModal from "./BoothDetailModal";
import DomisaDayBoothModal from "./DomisaDayBoothModal";
import type { Booth } from "./types";

type Theme = "day" | "night";

// ─── 낮/밤 테마 ───────────────────────────────────────────────
const getThemeByTime = (): Theme => {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18 ? "day" : "night";
};

// ─── 축제 일차 계산 (KST 기준, 매일 오전 7시 전환) ─────────────
// 1일차 시작: 2026-05-13 07:00 KST
const FESTIVAL_DAY1_START = new Date("2026-05-13T07:00:00+09:00");
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function getCurrentFestivalDay(): number {
  const diff = Date.now() - FESTIVAL_DAY1_START.getTime();
  if (diff < 0) return 0; // 축제 시작 전
  return Math.floor(diff / MS_PER_DAY) + 1;
}

function getMsUntilNextDayChange(): number {
  const diff = Date.now() - FESTIVAL_DAY1_START.getTime();
  if (diff < 0) return -diff; // 축제 시작 전: 1일차 시작까지 대기
  return MS_PER_DAY - (diff % MS_PER_DAY);
}

// ─── 테마별 스타일 ────────────────────────────────────────────
const themeClasses = {
  day: {
    bg: dayBgImg,
    subtitleColor: "text-grey-900",
    descriptionColor: "text-grey-700",
    boothNameColor: "text-grey-900",
    arrowColor: "text-primary-300",
    domisaBorder: "border-primary-300",
    domisaBg: "bg-grey-100",
    domisaTitleColor: "text-primary-700",
    domisaSubtitleColor: "text-primary-500",
  },
  night: {
    bg: nightBgImg,
    subtitleColor: "text-[#46e2f3]",
    descriptionColor: "text-grey-600",
    boothNameColor: "text-grey-100",
    arrowColor: "text-grey-100",
    domisaBorder: "border-grey-100",
    domisaBg: "bg-grey-600",
    domisaTitleColor: "text-grey-800",
    domisaSubtitleColor: "text-grey-700",
  },
} as const;

function isBoothActive(booth: Booth, currentDay: number): boolean {
  if (currentDay === 0 || booth.days.length === 0) return false;
  return booth.days.includes(currentDay);
}

function NightBoothPage() {
  const [theme] = useState<Theme>(getThemeByTime);
  const [currentDay, setCurrentDay] = useState<number>(getCurrentFestivalDay);
  const [selectedBooth, setSelectedBooth] = useState<Booth | null>(null);
  const [showDomisaModal, setShowDomisaModal] = useState(false);

  // 다음 오전 7시(KST)에 일차 자동 전환
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    const timeout = setTimeout(() => {
      setCurrentDay(getCurrentFestivalDay());
      interval = setInterval(() => {
        setCurrentDay(getCurrentFestivalDay());
      }, MS_PER_DAY);
    }, getMsUntilNextDayChange());

    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, []);

  const tc = themeClasses[theme];

  return (
    <div className="min-h-screen bg-grey-100 flex flex-col">
      <NotLoginHeader title="주점정보" />

      <div
        className="flex-1 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${tc.bg})` }}
      >
        <div className="mx-auto w-full max-w-[25.125rem] px-4 pb-10">

          {/* 소개 문구 */}
          <div className="flex flex-col items-center gap-[5px] pt-6 mb-4">
            <p className={`typo-subtitle-header-2 ${tc.subtitleColor} text-center`}>
              도미사가 추천하는 주점들!
            </p>
            <p className={`typo-comment-2 ${tc.descriptionColor} text-center`}>
              도미사에서 만난 인연들과 함께 방문해보세요
            </p>
          </div>

          {/* 주점 2열 그리드 */}
          <div className="grid grid-cols-2 gap-y-6">
            {BOOTHS.map((booth) => {
              const active = isBoothActive(booth, currentDay);
              return (
                <button
                  key={booth.id}
                  type="button"
                  onClick={() => setSelectedBooth(booth)}
                  className="flex flex-col items-center gap-2"
                >
                  <img
                    src={active ? booth.image : booth.blackImage}
                    alt={booth.name}
                    className="size-[9.375rem] aspect-square object-cover"
                  />
                  <span className={`typo-button-text-b text-center whitespace-pre-line ${tc.boothNameColor}`}>
                    {booth.gridLabel ?? booth.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 도미사 낮 부스 */}
          <button
            type="button"
            onClick={() => setShowDomisaModal(true)}
            className={`mt-8 flex w-full items-center justify-between rounded-[1.875rem] border-[1.8px] ${tc.domisaBorder} ${tc.domisaBg} px-5 py-2.5`}
          >
            <div className="flex items-center gap-2.5">
              <img
                src={domisaBoothImg}
                alt="도미사 낮 부스"
                className="size-[4.375rem] object-cover"
              />
              <div className="flex flex-col gap-[5px] text-left">
                <p className={`typo-subtitle-header-2 font-bold ${tc.domisaTitleColor}`}>
                  도미사 낮 부스
                </p>
                <p className={`typo-input-text-m ${tc.domisaSubtitleColor}`}>
                  방문 시 귀여운 키링과 쿠키 2개
                </p>
              </div>
            </div>
            <HeaderArrow className={`h-[1.375rem] w-[0.75rem] shrink-0 rotate-180 ${tc.arrowColor}`} />
          </button>

        </div>
      </div>

      {/* 주점 상세 모달 */}
      {selectedBooth && (
        <BoothDetailModal
          booth={selectedBooth}
          onClose={() => setSelectedBooth(null)}
        />
      )}

      {/* 도미사 낮 부스 모달 */}
      {showDomisaModal && (
        <DomisaDayBoothModal onClose={() => setShowDomisaModal(false)} />
      )}
    </div>
  );
}

export default NightBoothPage;