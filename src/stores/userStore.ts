import { create } from "zustand";
import { getAuthMe } from "../api/auth";
import type { AuthMeResponse, UserStatus } from "../types/user";

interface UserState {
    userId: number | null;
    status: UserStatus | null;
    cookieCount: number | null;
    isLoggedIn: boolean;
    isAuthLoaded: boolean;
    fetchMe: () => Promise<void>;
    setAuthData: (data: AuthMeResponse) => void;
    updateStatus: (newStatus: Partial<UserStatus>) => void;
    setCookieCount: (count: number) => void;
    clearAuth: () => void;
}

const mockAuthMeResponse: AuthMeResponse = {
    userId: 1,
    cookieCount: 10,
    status: {
        isRegistered: true,
        hasIntroduction: true,
        isProfileCompleted: false,
    },
};

export const useUserStore = create<UserState>((set) => ({
    userId: null,
    status: null,
    cookieCount: null,
    isLoggedIn: false,
    isAuthLoaded: false,

    fetchMe: async () => {
        set({ isAuthLoaded: false });

        try {
            const data = await getAuthMe();

            set({
                userId: data.userId,
                status: data.status,
                cookieCount: data.cookieCount,
                isLoggedIn: true,
                isAuthLoaded: true,
            });
        } catch {
            if (import.meta.env.DEV) {
                set({
                    userId: mockAuthMeResponse.userId,
                    status: mockAuthMeResponse.status,
                    cookieCount: mockAuthMeResponse.cookieCount,
                    isLoggedIn: true,
                    isAuthLoaded: true,
                });
                return;
            }

            set({
                userId: null,
                status: null,
                cookieCount: null,
                isLoggedIn: false,
                isAuthLoaded: true,
            });
        }
    },

    setAuthData: (data) =>
        set({
            userId: data.userId,
            status: data.status,
            cookieCount: data.cookieCount,
            isLoggedIn: true,
            isAuthLoaded: true,
        }),

    updateStatus: (newStatus) =>
        set((state) => ({
            status: state.status ? { ...state.status, ...newStatus } : null,
        })),

    setCookieCount: (count) => set({ cookieCount: count }),

    clearAuth: () =>
        set({
            userId: null,
            status: null,
            cookieCount: null,
            isLoggedIn: false,
            isAuthLoaded: true,
        }),
}));
