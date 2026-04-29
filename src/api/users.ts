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

export const registerUser = async (payload: RegisterUserRequest) => {
  const { data } = await apiClient.post<unknown>("/api/users/register", payload);

  if (!isRegisterUserResponse(data)) {
    throw new Error("Invalid register user response");
  }

  return data;
};

export const checkNicknameAvailability = async (nickname: string) => {
  const { data } = await apiClient.get<unknown>("/api/users/check-nickname", {
    params: { nickname },
  });

  if (!isCheckNicknameAvailabilityResponse(data)) {
    throw new Error("Invalid check nickname response");
  }

  return data;
};
