import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getDatingProfile, updateDatingProfile } from "../api/datingProfile";

export const datingProfileQueryKey = ["users", "datingProfile"] as const;

export const useDatingProfileQuery = () =>
  useQuery({
    queryKey: datingProfileQueryKey,
    queryFn: getDatingProfile,
    staleTime: Infinity,
  });

export const useUpdateDatingProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDatingProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: datingProfileQueryKey });
    },
  });
};