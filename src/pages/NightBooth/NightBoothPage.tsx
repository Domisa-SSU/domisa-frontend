import { useState } from "react";
import NotLoginHeader from "../../components/NotLoginHeader";
import headerArrow from "../../assets/headerArrow.svg";
import japanBoothImg from "../../assets/japanBooth.png";
import mathBoothImg from "../../assets/mathBooth.png";
import bgImg from "../../assets/homePageDayBackGround.jpg";

type Booth = {
  id: string;
  name: string;
  image: string;
};

// 일차별 주점 추가 시 해당 일차 배열에 항목을 추가하면 됩니다
const BOOTHS_BY_DAY: Record<number, Booth[]> = {
  1: [
    { id: "math", name: "수학과 학생회 주점", image: mathBoothImg },
    { id: "japan", name: "일어일문 학생회 주점", image: japanBoothImg },
  ],
  2: [],
  3: [],
};

// 부스 수평 배치 패턴 (인덱스 순 순환): 가운데 → 왼쪽 → 오른쪽
const POSITION_CLASSES = ["mx-auto", "mr-auto pl-4", "ml-auto pr-4"] as const;

const TOTAL_DAYS = 3;

function NightBoothPage() {
  const [day, setDay] = useState(1);

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${bgImg})` }}>
      <div className="bg-grey-100">
        <NotLoginHeader title="주점지도" />
      </div>

      {/* 날짜 네비게이션 */}
      <div className="flex items-center justify-center gap-12 py-4">
        <button
          type="button"
          onClick={() => setDay((d) => Math.max(1, d - 1))}
          disabled={day === 1}
          aria-label="이전 날"
          className="flex size-10 items-center justify-center disabled:opacity-30"
        >
          <img src={headerArrow} alt="" className="h-[1.0625rem] w-[0.875rem]" />
        </button>
        <span className="typo-title-header-1-b text-grey-900">{day}일차</span>
        <button
          type="button"
          onClick={() => setDay((d) => Math.min(TOTAL_DAYS, d + 1))}
          disabled={day === TOTAL_DAYS}
          aria-label="다음 날"
          className="flex size-10 items-center justify-center disabled:opacity-30"
        >
          <img src={headerArrow} alt="" className="h-[1.0625rem] w-[0.875rem] rotate-180" />
        </button>
      </div>

      {/* 주점 목록 */}
      <div className="flex flex-col gap-6 py-4 pb-10">
        {(BOOTHS_BY_DAY[day] ?? []).map((booth, index) => {
          const positionClass = POSITION_CLASSES[index % POSITION_CLASSES.length];
          return (
            <button
              key={booth.id}
              type="button"
              onClick={() => {
                // TODO: 주점 상세 모달 오픈 (추후 구현)
              }}
              className={`flex flex-col items-center gap-2 ${positionClass}`}
            >
              <img
                src={booth.image}
                alt={booth.name}
                className="size-[170px] object-cover"
              />
              <span className="typo-button-text-b text-grey-900 text-center">
                {booth.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default NightBoothPage;