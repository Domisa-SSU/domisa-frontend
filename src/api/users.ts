import { apiClient } from "./client";
import type { UserStatus } from "../types/user";

export type ContactType = "PHONE" | "KAKAO" | "INSTAGRAM";

export type AnimalProfile =
  | "DOG"
  | "CAT"
  | "BEAR"
  | "SLOTH"
  | "HAMSTER"
  | "WOLF"
  | "RABBIT"
  | "DEER"
  | "OTTER"
  | "ALPACA"
  | "FOX"
  | "CAPYBARA";

type RegisterUserRequest = {
  nickname: string;
  gender: boolean;
  birthYear: number;
  inviteCode: string | null;
  contact: {
    type: ContactType;
    content: string;
  };
  animalProfile: AnimalProfile;
};

export type RegisterUserResponse = {
  userId: number;
  status: UserStatus;
};

export type CheckNicknameAvailabilityResponse = {
  isAvailable: boolean;
};

const isUserStatus = (value: unknown): value is UserStatus => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const status = value as Record<string, unknown>;

  return (
    typeof status.isRegistered === "boolean" &&
    typeof status.hasIntroduction === "boolean" &&
    typeof status.isProfileCompleted === "boolean"
  );
};

const isRegisterUserResponse = (
  value: unknown,
): value is RegisterUserResponse => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const response = value as Record<string, unknown>;

  return (
    typeof response.userId === "number" &&
    isUserStatus(response.status)
  );
};

const isCheckNicknameAvailabilityResponse = (
  value: unknown,
): value is CheckNicknameAvailabilityResponse => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const response = value as Record<string, unknown>;

  return typeof response.isAvailable === "boolean";
};

/**
 * API 제목: 회원가입
 * POST /api/users/register
 * 회원가입 입력 정보를 등록하고, 등록 후 유저 ID와 서비스 진행 상태를 받는다.
 */
export const registerUser = async (payload: RegisterUserRequest) => {
  const { data } = await apiClient.post<unknown>("/api/users/register", payload);

  if (!isRegisterUserResponse(data)) {
    throw new Error("Invalid register user response");
  }

  return data;
};

/**
 * API 제목: 닉네임 중복 조회
 * GET /api/users/check-nickname
 * 회원가입과 프로필 수정에서 닉네임 중복 여부를 확인한다.
 */
export const checkNicknameAvailability = async (nickname: string) => {
  const { data } = await apiClient.get<unknown>("/api/users/check-nickname", {
    params: { nickname },
  });

  if (!isCheckNicknameAvailabilityResponse(data)) {
    throw new Error("Invalid check nickname response");
  }

  return data;
};
