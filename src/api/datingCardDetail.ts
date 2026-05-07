import { apiClient } from "./client";
import type { AnimalProfile } from "./users";
import testImg from "../assets/testImg.png";

export type DatingCardDetailContactType = "PHONE" | "KAKAO" | "INSTAGRAM";

export type DatingCardDetailContact = {
  type: DatingCardDetailContactType;
  content: string;
};

export type DatingCardDetailResponse = {
  publicId: string;
  nickName: string;
  age: number;
  gender: boolean;
  animalProfile: AnimalProfile;
  profile: string | null;
  q1: string;
  q2: string;
  q3: string | null;
  q3Length: number;
  datingStyle: string;
  idealType: string;
  mbti: string;
  contact: DatingCardDetailContact | null;
  isBlurred: boolean;
  hasSentLike: boolean;
  hasReceivedLike: boolean;
  hasPaidForReceivedLike?: boolean;
  isMatched: boolean;
  freeLikeRemaining: number;
};

const animalProfiles: readonly AnimalProfile[] = [
  "DOG",
  "CAT",
  "BEAR",
  "SLOTH",
  "HAMSTER",
  "WOLF",
  "RABBIT",
  "DEER",
  "OTTER",
  "ALPACA",
  "FOX",
  "CAPYBARA",
];

const contactTypes: readonly DatingCardDetailContactType[] = [
  "PHONE",
  "KAKAO",
  "INSTAGRAM",
];

const MOCK_DEFAULT_USER_ID = "mock-default";
const MOCK_SENT_USER_ID = "mock-sent";
const MOCK_RECEIVED_USER_ID = "mock-received";
const MOCK_RECEIVED_PAID_USER_ID = "mock-received-paid";
const MOCK_MATCHED_USER_ID = "mock-matched";

const baseMockDatingCardDetail: DatingCardDetailResponse = {
  publicId: "mock-default",
  nickName: "숭실대칼이",
  age: 23,
  gender: false,
  animalProfile: "CAPYBARA",
  profile: testImg,
  q1: "제 친구는 정말로.. 귀여워요!!",
  q2: "가끔 이해할 수 없는 행동을 해요 길에서 갑자기 춤추기..",
  q3: "물고기가 먹고 싶어서 한강에서 낚시를 한 적이 있어요\n회 떠먹었습니다..",
  q3Length: 37,
  datingStyle: "다정하고 친구 같은 연애!",
  idealType: "곰같은 남자",
  mbti: "INFJ",
  contact: {
    type: "INSTAGRAM",
    content: "domisa_mock",
  },
  isBlurred: false,
  hasSentLike: false,
  hasReceivedLike: false,
  isMatched: false,
  freeLikeRemaining: 2,
};

const mockDatingCardDetails: Record<string, DatingCardDetailResponse> = {
  [MOCK_DEFAULT_USER_ID]: baseMockDatingCardDetail,
  [MOCK_SENT_USER_ID]: {
    ...baseMockDatingCardDetail,
    publicId: "mock-sent",
    nickName: "보낸호감",
    animalProfile: "CAT",
    hasSentLike: true,
    freeLikeRemaining: 1,
  },
  [MOCK_RECEIVED_USER_ID]: {
    ...baseMockDatingCardDetail,
    publicId: "mock-received",
    nickName: "받은호감",
    gender: true,
    animalProfile: "BEAR",
    q3: null,
    q3Length: 42,
    contact: null,
    isBlurred: true,
    hasReceivedLike: true,
  },
  [MOCK_RECEIVED_PAID_USER_ID]: {
    ...baseMockDatingCardDetail,
    publicId: "mock-received-paid",
    nickName: "쿠키확인",
    gender: true,
    animalProfile: "BEAR",
    contact: {
      type: "KAKAO",
      content: "cuty882",
    },
    isBlurred: false,
    hasReceivedLike: true,
    hasPaidForReceivedLike: true,
  },
  [MOCK_MATCHED_USER_ID]: {
    ...baseMockDatingCardDetail,
    publicId: "mock-matched",
    nickName: "매칭완료",
    gender: true,
    animalProfile: "BEAR",
    contact: {
      type: "KAKAO",
      content: "cuty882",
    },
    isBlurred: false,
    hasSentLike: true,
    hasReceivedLike: true,
    isMatched: true,
  },
};

const isAnimalProfile = (value: unknown): value is AnimalProfile =>
  typeof value === "string" && animalProfiles.includes(value as AnimalProfile);

const isContactType = (value: unknown): value is DatingCardDetailContactType =>
  typeof value === "string" &&
  contactTypes.includes(value as DatingCardDetailContactType);

const isDatingCardDetailContact = (
  value: unknown,
): value is DatingCardDetailContact => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const contact = value as Record<string, unknown>;

  return (
    isContactType(contact.type) &&
    typeof contact.content === "string"
  );
};

const isDatingCardDetailResponse = (
  value: unknown,
): value is DatingCardDetailResponse => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const response = value as Record<string, unknown>;

  return (
    typeof response.publicId === "string" &&
    typeof response.nickName === "string" &&
    typeof response.age === "number" &&
    typeof response.gender === "boolean" &&
    isAnimalProfile(response.animalProfile) &&
    (typeof response.profile === "string" || response.profile === null) &&
    typeof response.q1 === "string" &&
    typeof response.q2 === "string" &&
    (typeof response.q3 === "string" || response.q3 === null) &&
    typeof response.q3Length === "number" &&
    typeof response.datingStyle === "string" &&
    typeof response.idealType === "string" &&
    typeof response.mbti === "string" &&
    (isDatingCardDetailContact(response.contact) || response.contact === null) &&
    typeof response.isBlurred === "boolean" &&
    typeof response.hasSentLike === "boolean" &&
    typeof response.hasReceivedLike === "boolean" &&
    typeof response.isMatched === "boolean" &&
    typeof response.freeLikeRemaining === "number"
  );
};

export const datingCardDetailQueryKey = (publicId: string) =>
  ["dating", "cards", publicId] as const;

export const fetchDatingCardDetail = async (
  publicId: string,
): Promise<DatingCardDetailResponse> => {
  if (import.meta.env.DEV && publicId in mockDatingCardDetails) {
    return mockDatingCardDetails[publicId];
  }

  const { data } = await apiClient.get<unknown>(
    `/api/datings/profiles/${encodeURIComponent(publicId)}`,
  );

  if (!isDatingCardDetailResponse(data)) {
    throw new Error("Invalid dating card detail response");
  }

  return data;
};
