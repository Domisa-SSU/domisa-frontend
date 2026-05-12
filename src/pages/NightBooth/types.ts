export type MenuItem = {
  name: string;
  description?: string;
  price: string;
};

export type Booth = {
  id: string;
  name: string;
  /** 그리드에서 줄바꿈이 필요할 때 사용. 미설정 시 name을 그대로 사용 */
  gridLabel?: string;
  /** 주점 목록 페이지에 표시되는 대표 이미지 */
  image: string;
  /** 비활성(해당 일차 아님) 상태에서 표시할 흑백 이미지 */
  blackImage: string;
  /** 운영 일차 목록. 빈 배열이면 일차 미정 */
  days: number[];
  /** 일차별 위치 정보 (예: "1일차 - 신양관 앞") */
  locations: string[];
  /** 모달에 표시할 메뉴/포스터 이미지 (최대 2장 권장) */
  menuImages?: string[];
  menuItems: MenuItem[];
  /** 메뉴 아래 특이사항 안내 문구 */
  note?: string;
};