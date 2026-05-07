import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { checkNicknameAvailability, deleteMe, getCookies, getMe, registerUser, updateMe } from "../api/users";
import { authMeQueryKey } from "./auth";

export const userMeQueryKey = ["users", "me"] as const;
export const userCookiesQueryKey = ["users", "cookies"] as const;

export const useUserMeQuery = () =>
  useQuery({
    queryKey: userMeQueryKey,
    queryFn: getMe,
    staleTime: Infinity,
  });

export const useUserCookiesQuery = () =>
  useQuery({
    queryKey: userCookiesQueryKey,
    queryFn: getCookies,
    staleTime: 0,
  });

export const useUpdateMeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userMeQueryKey });
    },
  });
};

export const useRegisterUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authMeQueryKey });
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
    },
  });
};
