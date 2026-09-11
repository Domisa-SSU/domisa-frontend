import { apiClient } from "./client";

export type DatingProfileContactType = "KAKAO" | "INSTAGRAM";

export type DatingProfileResponse = {
  cardId: number;
  mbti: string;
  datingStyle: string;
  idealType: string;
  imageUrl: string;
  contactType: DatingProfileContactType;
  contact: string;
  notificationPhone: string | null;
};

type UpdateDatingProfileRequest = {
  mbti: string;
  datingStyle: string;
  idealType: string;
  contactType: DatingProfileContactType;
  contact: string;
  notificationPhone: string | null;
};

const parseDatingProfileResponse = (value: unknown): DatingProfileResponse | null => {
  if (!value || typeof value !== 'object') return null;
  const r = value as Record<string, unknown>;
  if (
    typeof r.cardId !== 'number' ||
    typeof r.mbti !== 'string' ||
    typeof r.datingStyle !== 'string' ||
    typeof r.idealType !== 'string' ||
    typeof r.imageUrl !== 'string' ||
    typeof r.contactType !== 'string' ||
    typeof r.contact !== 'string' ||
    (r.notificationPhone !== null && typeof r.notificationPhone !== 'string')
  ) return null;
  return {
    cardId: r.cardId,
    mbti: r.mbti,
    datingStyle: r.datingStyle,
    idealType: r.idealType,
    imageUrl: r.imageUrl,
    contactType: r.contactType as DatingProfileContactType,
    contact: r.contact,
    notificationPhone: r.notificationPhone as string | null,
  };
};

/**
 * API 제목: 소개팅 카드 조회
 * GET /api/users/profiles
 * 현재 로그인한 사용자의 소개팅 카드 정보를 조회한다.
 */
export const getDatingProfile = async (): Promise<DatingProfileResponse> => {
  const { data } = await apiClient.get<unknown>('/api/users/profiles');
  const result = parseDatingProfileResponse(data);
  if (!result) throw new Error('Invalid dating profile response');
  return result;
};

/**
 * API 제목: 소개팅 카드 수정
 * PUT /api/users/profiles
 * 현재 로그인한 사용자의 소개팅 카드 정보를 수정한다.
 */
export const updateDatingProfile = async (payload: UpdateDatingProfileRequest): Promise<void> => {
  await apiClient.put('/api/users/profiles', payload);
};
