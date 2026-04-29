import { useMutation, useQueryClient } from "@tanstack/react-query";

import { checkNicknameAvailability, registerUser } from "../api/users";
import { authMeQueryKey } from "./auth";

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
