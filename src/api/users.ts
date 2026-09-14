import { apiClient } from './client';
import { isValidNickname } from '../utils/nickname';
import { logout } from './auth';
import { isBackendStatusDto } from './status';
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
export type ContactType = 'INSTAGRAM' | 'KAKAO';

export type RegisterUserRequest = {
  nickname: string;
  gender: boolean;
  birthYear: number;
  animalProfile: AnimalProfile;
  mbti: string;
  contactType: ContactType;
  contact: string;
  notificationPhone: string | null;
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
    status: response.status,
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

const parseRandomNicknameResponse = (value: unknown): string | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const response = value as Record<string, unknown>;

  if (typeof response.RandomNick !== 'string') {
    return null;
  }

  const nickname = response.RandomNick.replace(/\s+/g, '');

  return isValidNickname(nickname) ? nickname : null;
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
 * API 제목: 랜덤 닉네임 생성
 * GET /api/users/random-nickname
 * 서버가 중복되지 않는 닉네임을 생성해 반환한다.
 */
export const getRandomNickname = async () => {
  const { data } = await apiClient.get<unknown>('/api/users/random-nickname');
  const randomNickname = parseRandomNicknameResponse(data);

  if (!randomNickname) {
    if (import.meta.env.DEV) {
      console.error("[Invalid random nickname response]", data);
    }

    throw new Error('Invalid random nickname response');
  }

  return randomNickname;
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

  // 탈퇴 API가 인증 쿠키까지 만료하지 않는 서버 구현도 안전하게 처리한다.
  // 계정 삭제 자체는 완료됐으므로, 로그아웃 실패가 탈퇴 성공을 뒤집지는 않는다.
  try {
    await logout();
  } catch {
    // 브라우저의 HttpOnly 쿠키는 프론트에서 직접 지울 수 없다.
    // 서버 로그아웃이 실패한 경우에도 아래 호출자는 로컬 인증 상태를 정리한다.
  }

  return deleteResponse;
};

export type UserMeResponse = {
  publicId: string;
  nickname: string;
  birthYear: number;
  gender: boolean;
  animalProfile: AnimalProfile;
  imageUrl?: string | null;
  mbti?: string;
  contactType?: ContactType;
  contact?: string;
  notificationPhone?: string | null;
  status: UserStatus;
};

export type UserCookiesResponse = {
  cookieCount: number;
};

type UpdateMeRequest = {
  nickname: string;
  gender: boolean;
  birthYear: number;
  animalProfile: AnimalProfile;
  mbti: string;
  contactType: ContactType;
  contact: string;
  /** 문자 알림을 받지 않으면 null 을 보낸다. PUT 은 전체 교체라 키를 빼면 안 된다 */
  notificationPhone: string | null;
};

/**
 * PUT /api/users/me 응답.
 * GET 과 달리 status 가 없어 UserMeResponse 와 파서를 공유할 수 없다.
 */
export type UpdateMeResponse = {
  publicId: string;
  nickname: string;
  gender: boolean;
  birthYear: number;
  animalProfile: AnimalProfile;
  mbti?: string;
  imageUrl?: string | null;
  contactType?: ContactType;
  contact?: string;
  notificationPhone?: string | null;
};

const parseUserMeResponse = (value: unknown): UserMeResponse | null => {
  if (!value || typeof value !== 'object') return null;
  const r = value as Record<string, unknown>;
  if (
    typeof r.publicId !== 'string' ||
    typeof r.nickname !== 'string' ||
    typeof r.birthYear !== 'number' ||
    typeof r.gender !== 'boolean' ||
    typeof r.animalProfile !== 'string' ||
    !isBackendStatusDto(r.status)
  ) return null;
  return {
    publicId: r.publicId,
    nickname: r.nickname,
    birthYear: r.birthYear,
    gender: r.gender,
    animalProfile: r.animalProfile as AnimalProfile,
    imageUrl: typeof r.imageUrl === 'string' ? r.imageUrl : null,
    mbti: typeof r.mbti === 'string' ? r.mbti : undefined,
    contactType: typeof r.contactType === 'string' ? (r.contactType as ContactType) : undefined,
    contact: typeof r.contact === 'string' ? r.contact : undefined,
    notificationPhone: typeof r.notificationPhone === 'string' ? r.notificationPhone : null,
    status: r.status,
  };
};

const parseUpdateMeResponse = (value: unknown): UpdateMeResponse | null => {
  if (!value || typeof value !== 'object') return null;
  const r = value as Record<string, unknown>;
  if (
    typeof r.publicId !== 'string' ||
    typeof r.nickname !== 'string' ||
    typeof r.birthYear !== 'number' ||
    typeof r.gender !== 'boolean' ||
    typeof r.animalProfile !== 'string'
  ) return null;
  return {
    publicId: r.publicId,
    nickname: r.nickname,
    birthYear: r.birthYear,
    gender: r.gender,
    animalProfile: r.animalProfile as AnimalProfile,
    imageUrl: typeof r.imageUrl === 'string' ? r.imageUrl : null,
    mbti: typeof r.mbti === 'string' ? r.mbti : undefined,
    contactType: typeof r.contactType === 'string' ? (r.contactType as ContactType) : undefined,
    contact: typeof r.contact === 'string' ? r.contact : undefined,
    notificationPhone: typeof r.notificationPhone === 'string' ? r.notificationPhone : null,
  };
};

const parseUserCookiesResponse = (value: unknown): UserCookiesResponse | null => {
  if (!value || typeof value !== 'object') return null;
  const r = value as Record<string, unknown>;
  if (typeof r.cookieCount !== 'number') return null;
  return { cookieCount: r.cookieCount };
};

/**
 * API 제목: 내 정보 조회
 * GET /api/users/me
 * 현재 로그인한 사용자의 프로필 정보를 조회한다.
 */
export const getMe = async (): Promise<UserMeResponse> => {
  const { data } = await apiClient.get<unknown>('/api/users/me');
  const result = parseUserMeResponse(data);
  if (!result) throw new Error('Invalid user me response');
  return result;
};

/**
 * API 제목: 보유 쿠키 조회
 * GET /api/users/cookies
 * 현재 로그인한 사용자의 보유 쿠키 수를 조회한다.
 */
export const getCookies = async (): Promise<UserCookiesResponse> => {
  const { data } = await apiClient.get<unknown>('/api/users/cookies');
  const result = parseUserCookiesResponse(data);
  if (!result) throw new Error('Invalid user cookies response');
  return result;
};

/**
 * API 제목: 내 정보 수정
 * PUT /api/users/me
 * 현재 로그인한 사용자의 프로필 정보를 수정한다.
 */
export const updateMe = async (payload: UpdateMeRequest): Promise<UpdateMeResponse> => {
  const { data } = await apiClient.put<unknown>('/api/users/me', payload);
  const result = parseUpdateMeResponse(data);
  if (!result) throw new Error('Invalid update user me response');
  return result;
};
