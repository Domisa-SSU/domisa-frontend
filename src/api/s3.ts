import { apiClient } from "./client";

type CreateProfileImageUploadUrlRequest = {
  contentType: string;
  fileSize: number;
};

type CreateProfileImageUploadUrlResponse = {
  objectKey: string;
  presignedUrl: string;
  expiresInSeconds: number;
};

type CompleteProfileImageUploadRequest = {
  uploadKey: string;
};

const isCreateProfileImageUploadUrlResponse = (
  value: unknown,
): value is CreateProfileImageUploadUrlResponse => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const response = value as Record<string, unknown>;

  return (
    typeof response.objectKey === "string" &&
    typeof response.presignedUrl === "string" &&
    typeof response.expiresInSeconds === "number"
  );
};

export const createProfileImageUploadUrl = async (
  payload: CreateProfileImageUploadUrlRequest,
) => {
  const { data } = await apiClient.post<unknown>(
    "/api/users/me/profile-image/upload-url",
    payload,
  );

  if (!isCreateProfileImageUploadUrlResponse(data)) {
    throw new Error("Invalid profile image upload URL response");
  }

  return data;
};

export const uploadProfileImageToS3 = async ({
  presignedUrl,
  file,
}: {
  presignedUrl: string;
  file: File;
}) => {
  const response = await fetch(presignedUrl, {
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

export const completeProfileImageUpload = async (
  payload: CompleteProfileImageUploadRequest,
) => {
  await apiClient.post("/api/users/me/profile-image/complete", payload);
};
