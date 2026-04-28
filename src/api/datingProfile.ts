import { apiClient } from "./client";

type PresignedUrlResponse = {
  uploadUrl: string;
  objectKey: string;
};

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

const isPresignedUrlResponse = (
  value: unknown,
): value is PresignedUrlResponse => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const response = value as Record<string, unknown>;

  return (
    typeof response.uploadUrl === "string" &&
    typeof response.objectKey === "string"
  );
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

export const getProfileImagePresignedUrl = async (contentType: string) => {
  const { data } = await apiClient.post<unknown>(
    "/api/users/me/profile-image/presigned-url",
    { contentType },
  );

  if (!isPresignedUrlResponse(data)) {
    throw new Error("Invalid profile image presigned URL response");
  }

  return data;
};

export const uploadProfileImageToS3 = async ({
  uploadUrl,
  file,
}: {
  uploadUrl: string;
  file: File;
}) => {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error("Failed to upload profile image");
  }
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
