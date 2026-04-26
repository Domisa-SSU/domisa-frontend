import { apiClient } from "./client";
import type { AuthMeResponse, UserStatus } from "../types/user";

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
        typeof response.cookieCount === "number" &&
        isUserStatus(response.status)
    );
};

export const getAuthMe = async () => {
    const { data } = await apiClient.get<unknown>("/api/auth/me");

    if (!isAuthMeResponse(data)) {
        throw new Error("Invalid auth me response");
    }

    return data;
};
