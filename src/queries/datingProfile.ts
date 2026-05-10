import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getDatingProfile, updateDatingProfile } from "../api/datingProfile";

export const datingProfileQueryKey = ["users", "datingProfile"] as const;

export const useDatingProfileQuery = () =>
  useQuery({
    queryKey: datingProfileQueryKey,
    queryFn: getDatingProfile,
    retry: false,
    staleTime: 10 * 60 * 1000, // 10분 (Signed URL 만료 20분보다 짧게)
  });

export const useUpdateDatingProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDatingProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: datingProfileQueryKey, refetchType: 'none' });
    },
  });
};
