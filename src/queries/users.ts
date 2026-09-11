import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { checkNicknameAvailability, deleteMe, getCookies, getMe, registerUser, updateMe } from "../api/users";
import type { UserMeResponse } from "../api/users";
import { authMeQueryKey } from "./auth";

export const userMeQueryKey = ["users", "me"] as const;
export const userCookiesQueryKey = ["users", "cookies"] as const;

export const useUserMeQuery = () =>
  useQuery({
    queryKey: userMeQueryKey,
    queryFn: getMe,
    retry: false,
    staleTime: 10 * 60 * 1000, // 10분 (imageUrl Signed URL 만료 20분보다 짧게)
  });

export const useUserCookiesQuery = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: userCookiesQueryKey,
    queryFn: getCookies,
    retry: false,
    staleTime: 0,
    enabled: options?.enabled,
  });

export const useUpdateMeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMe,
    onSuccess: (updated) => {
      // PUT 응답에는 status 가 없다. 기존 캐시의 status 를 유지한 채 병합한다
      queryClient.setQueryData<UserMeResponse>(userMeQueryKey, (prev) =>
        prev ? { ...prev, ...updated } : prev,
      );
    },
  });
};

export const useRegisterUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authMeQueryKey });
      await queryClient.invalidateQueries({ queryKey: userMeQueryKey });
    },
  });
};

export const useCheckNicknameMutation = () =>
  useMutation({
    mutationFn: checkNicknameAvailability,
  });

export const useDeleteMeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMe,
    onSuccess: () => {
      queryClient.setQueryData(authMeQueryKey, null);
      queryClient.removeQueries({ queryKey: userMeQueryKey });
      queryClient.removeQueries({ queryKey: userCookiesQueryKey });
    },
  });
};
