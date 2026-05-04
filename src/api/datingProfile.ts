import { apiClient } from "./client";

type DatingProfileContactType = "KAKAO" | "INSTAGRAM" | "PHONE";

type CreateDatingProfileRequest = {
  mbti: string;
  datingStyle: string;
  idealType: string;
  imageKey: string;
  contactType: DatingProfileContactType;
  contact: string;
  notificationPhone: string | null;
};

export type CreateDatingProfileResponse = {
  userId: number;
  status: {
    isRegistered: boolean;
    hasIntroduction: boolean;
    isCardCompleted: boolean;
  };
  totalUserCount: number;
};

const isCreateDatingProfileResponse = (
  value: unknown,
): value is CreateDatingProfileResponse => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const response = value as Record<string, unknown>;
  const status = response.status as Record<string, unknown> | undefined;

  return (
    typeof response.userId === "number" &&
    !!status &&
    typeof status.isRegistered === "boolean" &&
    typeof status.hasIntroduction === "boolean" &&
    typeof status.isCardCompleted === "boolean" &&
    typeof response.totalUserCount === "number"
  );
};

/**
 * API 제목: 소개팅 카드 생성
 * POST /api/users/profiles
 * 소개팅 카드 정보를 생성한다. 현재 응답 status는 isCardCompleted 필드를 사용한다.
 */
export const createDatingProfile = async (
  payload: CreateDatingProfileRequest,
) => {
  const { data } = await apiClient.post<unknown>(
    "/api/users/profiles",
    payload,
  );

  if (!isCreateDatingProfileResponse(data)) {
    throw new Error("Invalid create dating profile response");
  }

  return data;
};
