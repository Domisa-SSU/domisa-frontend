import { isAxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getAuthMe, loginWithKakao, logout } from "../api/auth";
import type { AuthMeResponse } from "../types/user";

export const authMeQueryKey = ["auth", "me"] as const;
const unauthenticatedStatusCodes = new Set([401, 403]);

const getAuthMeOrNull = async (): Promise<AuthMeResponse | null> => {
  try {
    return await getAuthMe();
  } catch (error) {
    if (
      isAxiosError(error) &&
      unauthenticatedStatusCodes.has(error.response?.status ?? 0)
    ) {
      return null;
    }

    throw error;
  }
};

export const useAuthMeQuery = () =>
  useQuery({
    queryKey: authMeQueryKey,
    queryFn: getAuthMeOrNull,
    retry: false,
    staleTime: 30_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
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
