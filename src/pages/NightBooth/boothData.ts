import japanBoothImg from "../../assets/japanBooth.png";
import mathBoothImg from "../../assets/mathBooth.png";
import japanPosterOne from "../../assets/japanPosterOne.png";
import japanPosterTwo from "../../assets/japanPosterTwo.png";
import type { Booth } from "./types";

/**
 * 일차별 주점 데이터
 * 새 주점 추가 시 해당 일차 배열에 항목만 추가하면 됩니다.
 */
export const BOOTHS_BY_DAY: Record<number, Booth[]> = {
  1: [
    {
      id: "math",
      name: "수학과 학생회 주점",
      image: mathBoothImg,
      locations: ["1일차 - 위치 미정"],
      menuItems: [],
    },
    {
      id: "japan",
      name: "일어일문 학생회 주점",
      image: japanBoothImg,
      locations: [
        "1일차 - 신양관 앞",
        "2일차 - 조만식 나무 계단 앞 (웨스터민스터홀 앞)",
      ],
      menuImages: [japanPosterOne, japanPosterTwo],
      menuItems: [
        {
          name: "Set A 야쿠자 형님 세트",
          description: "나가사끼 짬뽕 + 오니기리",
          price: "13,000원",
        },
        {
          name: "Set B 썸타는 갸루 세트",
          description: "가쓰오부시 우동 + 타코야끼",
          price: "17,500원",
        },
        {
          name: "Set C 불량연애 과몰입 세트",
          description: "나가사끼 짬뽕 + 타코야끼",
          price: "24,500원",
        },
        {
          name: "달콤한 유혹, 푸딩",
          price: "6,000원",
        },
      ],
      note: "* 푸딩 주문 시 '매칭 카드' 제공!\n(인스타 ID, 특징, 이상형 등 기재 가능)",
    },
  ],
  2: [],
  3: [],
};

export const TOTAL_DAYS = Object.keys(BOOTHS_BY_DAY).length;