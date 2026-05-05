import testImg from "../assets/testImg.png";

export type DatingCardDetailSectionItem = {
  title: string;
  content: string;
};

export type DatingCardDetailResponse = {
  id: string;
  nickname: string;
  birthYearText: string;
  mbti: string;
  gender: string;
  coverImageUrl: string | null;
  avatarImageUrl: string | null;
  friendIntroduction: DatingCardDetailSectionItem[];
  selfIntroduction: DatingCardDetailSectionItem[];
  hasSentLike: boolean;
};

const mockDatingCardDetails: Record<string, DatingCardDetailResponse> = {
  "solo-1": {
    id: "solo-1",
    nickname: "숭실대칼이",
    birthYearText: "2003년생",
    mbti: "INFJ",
    gender: "여",
    coverImageUrl: testImg,
    avatarImageUrl: testImg,
    friendIntroduction: [
      {
        title: "친구에 대한 간단한 소개",
        content: "제 친구는 정말로.. 귀여워요!!",
      },
      {
        title: "친구의 매력 포인트",
        content: "가끔 이해할 수 없는 행동을 해요 길에서 갑자기 춤추기..",
      },
      {
        title: "친구와 있었던 가장 웃긴 에피소드",
        content: "물고기가 먹고 싶어서 한강에서 낚시를 한 적이 있어요\n회 떠먹었습니다..",
      },
    ],
    selfIntroduction: [
      {
        title: "원하는 연애 스타일을 적어주세요",
        content: "다정하고 친구 같은 연애!",
      },
      {
        title: "이상형을 한 줄로 적어주세요",
        content: "엄성현 같은 ..",
      },
    ],
    hasSentLike: false,
  },
};

const createFallbackDetail = (cardId: string): DatingCardDetailResponse => ({
  ...mockDatingCardDetails["solo-1"],
  id: cardId,
});

export const datingCardDetailQueryKey = (cardId: string) =>
  ["dating", "cards", cardId] as const;

export const fetchDatingCardDetail = async (
  cardId: string,
): Promise<DatingCardDetailResponse> =>
  mockDatingCardDetails[cardId] ?? createFallbackDetail(cardId);
