import { apiClient } from "./client";
import type { AuthMeResponse, UserStatus } from "../types/user";

type LoginWithKakaoRequest = {
    authorizationCode: string;
};

export type LoginWithKakaoResponse = {
    status: UserStatus;
};

type LogoutResponse = {
    message: string;
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

const isAuthMeResponse = (value: unknown): value is AuthMeResponse => {
    if (!value || typeof value !== "object") {
        return false;
    }

    const response = value as Record<string, unknown>;

    return (
        typeof response.userId === "number" &&
        isUserStatus(response.status)
    );
};

const isLoginWithKakaoResponse = (
    value: unknown,
): value is LoginWithKakaoResponse => {
    if (!value || typeof value !== "object") {
        return false;
    }

    const response = value as Record<string, unknown>;

    return isUserStatus(response.status);
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

    if (!isAuthMeResponse(data)) {
        throw new Error("Invalid auth me response");
    }

    return data;
};

/**
 * API 제목: 카카오 로그인
 * POST /api/auth/login
 * 카카오 인가 코드로 로그인하고, 인증 토큰은 서버의 Set-Cookie 응답으로 설정된다.
 */
export const loginWithKakao = async (payload: LoginWithKakaoRequest) => {
    const { data } = await apiClient.post<unknown>("/api/auth/login", payload);

    if (!isLoginWithKakaoResponse(data)) {
        throw new Error("Invalid kakao login response");
    }

    return data;
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
