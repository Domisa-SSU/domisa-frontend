import { apiClient } from "./client";

type CreateDatingProfileRequest = {
  mbti: string;
  datingStyle: string;
  idealType: string;
  imageKey: string;
};

export type CreateDatingProfileResponse = {
  userId: number;
  status: {
    isRegistered: boolean;
    hasIntroduction: boolean;
    isCardCompleted: boolean;
  };
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
    typeof status.isCardCompleted === "boolean"
  );
};

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
