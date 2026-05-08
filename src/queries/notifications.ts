import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getActiveNotifications,
  getNotifications,
  markNotificationAsRead,
} from "../api/notifications";

export const notificationsQueryKey = ["notifications"] as const;
export const activeNotificationsQueryKey = ["notifications", "active"] as const;

export const useNotificationsQuery = () =>
  useQuery({
    queryKey: notificationsQueryKey,
    queryFn: getNotifications,
    staleTime: 0,
  });

export const useActiveNotificationsQuery = (enabled: boolean) =>
  useQuery({
    queryKey: activeNotificationsQueryKey,
    queryFn: getActiveNotifications,
    enabled,
    retry: false,
    gcTime: 0,
  });

export const useMarkNotificationAsReadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
    },
  });
};
