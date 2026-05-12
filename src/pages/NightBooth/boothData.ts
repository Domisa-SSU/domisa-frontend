import industrialPosterImg from '../../assets/industrialPoster.png';
import mathPosterImg from '../../assets/mathPoster.png';
import japanBoothImg from '../../assets/japanBooth.png';
import japanBoothBlackImg from '../../assets/japanBoothBlack.png';
import mathBoothImg from '../../assets/mathBooth.png';
import mathBoothBlackImg from '../../assets/mathBoothBlack.png';
import japanPosterOne from '../../assets/japanPosterOne.png';
import japanPosterTwo from '../../assets/japanPosterTwo.png';
import industrialBoothImg from '../../assets/industrialBooth.png';
import industrialBoothBlackImg from '../../assets/industrialBoothBlack.png';
import administrationBoothImg from '../../assets/administrationBooth.png';
import administrationBoothBlackImg from '../../assets/administrationBoothBlack.png';
import type { Booth } from './types';

export const TOTAL_DAYS = 3;

/**
 * 전체 주점 데이터
 * 새 주점 추가 시 이 배열에 항목만 추가하면 됩니다.
 * days: 운영 일차 목록 (빈 배열이면 일차 미정)
 */
export const BOOTHS: Booth[] = [
  {
    id: 'industrial',
    name: '산업정보시스템공학과 학생회 주점',
    gridLabel: '산업정보시스템공학과\n학생회 주점',
    image: industrialBoothImg,
    blackImage: industrialBoothBlackImg,
    days: [2, 3],
    locations: ['2~3일차 - 중문 앞 (형남홀 들어가는 입구쪽)'],
    menuImages: [industrialPosterImg],
    menuItems: [
      { name: '마라탕의 정석', price: '13,000원' },
      { name: '불닭대패의 정석', price: '17,500원' },
      { name: '버갈ㅋㅋ_버터갈릭트래미', price: '24,500원' },
      { name: '마약 옥수수전의 정석', price: '6,000원' },
      { name: "Woo's 프렌치 토스트", price: '6,000원' },
    ],
  },
  {
    id: 'japan',
    name: '일어일문 학생회 주점',
    image: japanBoothImg,
    blackImage: japanBoothBlackImg,
    days: [1, 2],
    locations: ['1일차 - 신양관 앞', '2일차 - 조만식 나무 계단 앞 (웨스터민스터홀 앞)'],
    menuImages: [japanPosterOne, japanPosterTwo],
    menuItems: [
      {
        name: 'Set A 야쿠자 형님 세트',
        description: '나가사끼 짬뽕 + 오니기리',
        price: '13,000원',
      },
      {
        name: 'Set B 썸타는 갸루 세트',
        description: '가쓰오부시 우동 + 타코야끼',
        price: '17,500원',
      },
      {
        name: 'Set C 불량연애 과몰입 세트',
        description: '나가사끼 짬뽕 + 타코야끼',
        price: '24,500원',
      },
      {
        name: '달콤한 유혹, 푸딩',
        price: '6,000원',
      },
    ],
    note: "* 푸딩 주문 시 '매칭 카드' 제공!\n(인스타 ID, 특징, 이상형 등 기재 가능)",
  },
  {
    id: 'math',
    name: '수학과 학생회 주점',
    image: mathBoothImg,
    blackImage: mathBoothBlackImg,
    days: [3],
    locations: ['3일차 - 베어드홀 해방터'],
    menuImages: [mathPosterImg],
    menuItems: [
      { name: '지나가던 동네 강아지 쫑키도\n발걸음 멈추고 쳐다본 훈제 오리구이', price: '18,900원' },
      { name: '모내기 끝내고 사람들끼리 모여\n"옛날엔 말이여~', price: '18,900원' },
      { name: '새벽까지 술판 벌이다 시원하게\n속 뒤집으려고 먹는 머슴표 불닭 냉면', price: '9,900원' },
      { name: '새참계의 에르메스 버터갈릭 옥수수튀김', price: '11,900원' },
      { name: '새참 먹으러 왔다가 가루 털 새도 없이\n계속 집어먹게 되는 시골주막 뿌링 팝콘 만두', price: '11,900원' },
    ],
  },
  {
    id: 'administration',
    name: '행정학부 학생회 주점',
    image: administrationBoothImg,
    blackImage: administrationBoothBlackImg,
    days: [],
    locations: ['위치 미정'],
    menuItems: [],
  },
];