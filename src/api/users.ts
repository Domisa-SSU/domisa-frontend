import { apiClient } from './client';
import { isBackendStatusDto, normalizeUserStatus } from './status';
import type { UserStatus } from '../types/user';

export type AnimalProfile =
  | 'DOG'
  | 'CAT'
  | 'BEAR'
  | 'SLOTH'
  | 'HAMSTER'
  | 'WOLF'
  | 'RABBIT'
  | 'DEER'
  | 'OTTER'
  | 'ALPACA'
  | 'FOX'
  | 'CAPYBARA';

type RegisterUserRequest = {
  nickname: string;
  gender: boolean;
  birthYear: number;
  animalProfile: AnimalProfile;
};

export type RegisterUserResponse = {
  publicId: string;
  status: UserStatus;
  totalUserCount: number;
};

export type CheckNicknameAvailabilityResponse = {
  isAvailable: boolean;
};

export type DeleteUserResponse = {
  message: string;
};

const parseRegisterUserResponse = (value: unknown): RegisterUserResponse | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const response = value as Record<string, unknown>;

  if (
    typeof response.publicId !== 'string' ||
    !isBackendStatusDto(response.status) ||
    typeof response.totalUserCount !== 'number'
  ) {
    return null;
  }

  return {
    publicId: response.publicId,
    status: normalizeUserStatus(response.status),
    totalUserCount: response.totalUserCount,
  };
};

const parseCheckNicknameAvailabilityResponse = (
  value: unknown
): CheckNicknameAvailabilityResponse | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const response = value as Record<string, unknown>;

  if (typeof response.isAvailable !== 'boolean') {
    return null;
  }

  return { isAvailable: response.isAvailable };
};

const parseDeleteUserResponse = (value: unknown): DeleteUserResponse | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const response = value as Record<string, unknown>;

  if (typeof response.message !== 'string') {
    return null;
  }

  return { message: response.message };
};

/**
 * API 제목: 회원가입
 * POST /api/users/register
 * 회원가입 입력 정보를 등록하고, 등록 후 유저 ID와 서비스 진행 상태를 받는다.
 */
export const registerUser = async (payload: RegisterUserRequest) => {
  const { data } = await apiClient.post<unknown>('/api/users/register', payload);
  const registerResponse = parseRegisterUserResponse(data);

  if (!registerResponse) {
    throw new Error('Invalid register user response');
  }

  return registerResponse;
};

/**
 * API 제목: 닉네임 중복 조회
 * GET /api/users/check-nickname
 * 회원가입과 프로필 수정에서 닉네임 중복 여부를 확인한다.
 */
export const checkNicknameAvailability = async (nickname: string) => {
  const { data } = await apiClient.get<unknown>('/api/users/check-nickname', {
    params: { nickname },
  });
  const availabilityResponse = parseCheckNicknameAvailabilityResponse(data);

  if (!availabilityResponse) {
    throw new Error('Invalid check nickname response');
  }

  return availabilityResponse;
};

/**
 * API 제목: 회원탈퇴
 * DELETE /api/users/me
 * 현재 로그인한 사용자의 계정을 삭제한다.
 */
export const deleteMe = async () => {
  const { data } = await apiClient.delete<unknown>('/api/users/me');
  const deleteResponse = parseDeleteUserResponse(data);

  if (!deleteResponse) {
    throw new Error('Invalid delete user response');
  }

  return deleteResponse;
};
