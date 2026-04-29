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

export const getAuthMe = async () => {
    const { data } = await apiClient.get<unknown>("/api/auth/me");

    if (!isAuthMeResponse(data)) {
        throw new Error("Invalid auth me response");
    }

    return data;
};

export const loginWithKakao = async (payload: LoginWithKakaoRequest) => {
    const { data } = await apiClient.post<unknown>("/api/auth/login", payload);

    if (!isLoginWithKakaoResponse(data)) {
        throw new Error("Invalid kakao login response");
    }

    return data;
};

export const logout = async () => {
    const { data } = await apiClient.post<unknown>("/api/auth/logout");

    if (!isLogoutResponse(data)) {
        throw new Error("Invalid logout response");
    }

    return data;
};
