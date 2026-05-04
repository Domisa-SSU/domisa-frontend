import { apiClient } from "./client";
import { isBackendStatusDto, normalizeUserStatus } from "./status";
import type { AuthMeResponse, UserStatus } from "../types/user";

type LoginWithKakaoRequest = {
    authorizationCode: string;
    redirectUri: string;
};

export type LoginWithKakaoResponse = {
    status: UserStatus;
};

type LogoutResponse = {
    message: string;
};

const parseAuthMeResponse = (value: unknown): AuthMeResponse | null => {
    if (!value || typeof value !== "object") {
        return null;
    }

    const response = value as Record<string, unknown>;

    if (
        typeof response.userId !== "string" ||
        typeof response.cookies !== "number" ||
        !isBackendStatusDto(response.status)
    ) {
        return null;
    }

    return {
        userId: response.userId,
        cookies: response.cookies,
        status: normalizeUserStatus(response.status),
    };
};

const parseLoginWithKakaoResponse = (value: unknown): LoginWithKakaoResponse | null => {
    if (!value || typeof value !== "object") {
        return null;
    }

    const response = value as Record<string, unknown>;

    if (!isBackendStatusDto(response.status)) {
        return null;
    }

    return {
        status: normalizeUserStatus(response.status),
    };
};

const isLogoutResponse = (value: unknown): value is LogoutResponse => {
    if (!value || typeof value !== "object") {
        return false;
    }

    const response = value as Record<string, unknown>;

    return typeof response.message === "string";
};

/**
 * API 제목: 로그인 여부 + 진행 상태 조회
 * GET /api/auth/me
 * 쿠키에 담긴 인증 토큰으로 현재 로그인 유저와 서비스 진행 상태를 조회한다.
 */
export const getAuthMe = async () => {
    const { data } = await apiClient.get<unknown>("/api/auth/me");
    const authMe = parseAuthMeResponse(data);

    if (!authMe) {
        throw new Error("Invalid auth me response");
    }

    return authMe;
};

/**
 * API 제목: 카카오 로그인
 * POST /api/auth/login
 * 카카오 인가 코드로 로그인하고, 인증 토큰은 서버의 Set-Cookie 응답으로 설정된다.
 */
export const loginWithKakao = async (payload: LoginWithKakaoRequest) => {
    const { data } = await apiClient.post<unknown>("/api/auth/login", payload);
    const loginResponse = parseLoginWithKakaoResponse(data);

    if (!loginResponse) {
        throw new Error("Invalid kakao login response");
    }

    return loginResponse;
};

/**
 * API 제목: 로그아웃
 * POST /api/auth/logout
 * 서버에 httpOnly 인증 쿠키 만료를 요청해 현재 세션을 종료한다.
 */
export const logout = async () => {
    const { data } = await apiClient.post<unknown>("/api/auth/logout");

    if (!isLogoutResponse(data)) {
        throw new Error("Invalid logout response");
    }

    return data;
};
