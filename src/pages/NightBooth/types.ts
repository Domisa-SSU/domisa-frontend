export type MenuItem = {
  name: string;
  description?: string;
  price: string;
};

export type Booth = {
  id: string;
  name: string;
  /** 주점 목록 페이지에 표시되는 대표 이미지 */
  image: string;
  /** 일차별 위치 정보 (예: "1일차 - 신양관 앞") */
  locations: string[];
  /** 모달에 표시할 메뉴/포스터 이미지 (최대 2장 권장) */
  menuImages?: string[];
  menuItems: MenuItem[];
  /** 메뉴 아래 특이사항 안내 문구 */
  note?: string;
};