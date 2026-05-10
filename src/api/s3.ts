import { apiClient } from "./client";
import { ApiRequestError } from "../utils/apiError";

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

/**
 * API 제목: 프로필 이미지 Presigned URL 발급
 * POST /api/users/me/profile-image/upload-url
 * 프로필 이미지를 S3에 PUT 업로드하기 위한 presigned URL과 objectKey를 발급받는다.
 */
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

/**
 * API 제목: 프로필 이미지 S3 업로드
 * PUT {presignedUrl}
 * 백엔드가 아닌 S3 presigned URL로 선택한 이미지 파일을 직접 업로드한다.
 */
export const uploadProfileImageToS3 = async ({
  presignedUrl,
  file,
}: {
  presignedUrl: string;
  file: File;
}) => {
  let response: Response;

  try {
    response = await fetch(presignedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });
  } catch {
    throw new ApiRequestError("Failed to upload profile image", {
      isNetworkError: true,
    });
  }

  if (!response.ok) {
    throw new ApiRequestError("Failed to upload profile image", {
      status: response.status,
    });
  }
};

/**
 * API 제목: 프로필 이미지 업로드 완료
 * POST /api/users/me/profile-image/complete
 * S3 업로드가 끝난 뒤 백엔드에 업로드 완료를 알린다.
 */
export const completeProfileImageUpload = async (
  payload: CompleteProfileImageUploadRequest,
) => {
  await apiClient.post("/api/users/me/profile-image/complete", payload);
};
