import { isAxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getAuthMe, loginWithKakao, logout } from "../api/auth";
import type { AuthMeResponse } from "../types/user";

export const authMeQueryKey = ["auth", "me"] as const;

const mockAuthMeResponse: AuthMeResponse = {
  userId: "1",
  cookies: 10,
  status: {
    isRegistered: true,
    hasIntroduction: true,
    isProfileCompleted: false,
  },
};

const getAuthMeOrNull = async (): Promise<AuthMeResponse | null> => {
  try {
    return await getAuthMe();
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 401) {
      return null;
    }

    if (import.meta.env.DEV) {
      return mockAuthMeResponse;
    }

    throw error;
  }
};

export const useAuthMeQuery = () =>
  useQuery({
    queryKey: authMeQueryKey,
    queryFn: getAuthMeOrNull,
    retry: false,
  });

export const useKakaoLoginMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginWithKakao,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authMeQueryKey });
    },
  });
};

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(authMeQueryKey, null);
    },
  });
};
