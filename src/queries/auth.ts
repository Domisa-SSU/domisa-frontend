import { isAxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getAuthMe,
  isBlacklistedUserAxiosError,
  isBlacklistedUserError,
  loginWithKakao,
  logout,
} from "../api/auth";
import { reportBlacklistedUser } from "../stores/blacklistedUserStore";
import { resetMixpanel } from "../utils/mixpanel";
import type { AuthMeResponse } from "../types/user";

export const authMeQueryKey = ["auth", "me"] as const;
const unauthenticatedStatusCodes = new Set([401, 403]);

const isUserNotFoundError = (error: unknown) => {
  if (!isAxiosError(error) || error.response?.status !== 404) {
    return false;
  }

  const data = error.response.data;

  if (!data || typeof data !== "object") {
    return false;
  }

  return (data as Record<string, unknown>).code === "USER_NOT_FOUND";
};

const getAuthMeOrNull = async (): Promise<AuthMeResponse | null> => {
  try {
    return await getAuthMe();
  } catch (error) {
    if (isBlacklistedUserError(error) || isBlacklistedUserAxiosError(error)) {
      reportBlacklistedUser();
      return null;
    }

    if (
      isAxiosError(error) &&
      unauthenticatedStatusCodes.has(error.response?.status ?? 0)
    ) {
      return null;
    }

    if (isUserNotFoundError(error)) {
      try {
        await logout();
      } catch {
        // The session is already unusable; keep the app recoverable as logged out.
      }

      return null;
    }

    throw error;
  }
};

/**
 * 마운트마다 다시 부르지는 않는다. 헤더까지 authMe 를 읽어서 요청이 과하게 늘기 때문이다.
 *
 * 다만 포커스 재조회는 켠다. 소개서 수락은 친구가 보낸 링크(다른 탭/인앱 브라우저)에서
 * 이뤄지는데, 그 탭의 갱신은 원래 탭 캐시에 닿지 않는다. 돌아왔을 때 다시 받아오지
 * 않으면 이미 수락했는데도 소개팅 진입이 계속 막힌다.
 * staleTime 이 30초라 탭을 자주 오가도 요청은 그만큼만 늘어난다.
 */
export const useAuthMeQuery = () =>
  useQuery({
    queryKey: authMeQueryKey,
    queryFn: getAuthMeOrNull,
    retry: false,
    staleTime: 30_000,
    refetchOnMount: false,
    refetchOnWindowFocus: true,
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
      // distinct_id 를 끊어야 공용 기기에서 다음 사용자 이벤트가 섞이지 않는다.
      // reset 은 수퍼 프로퍼티도 지우는데, authMe 가 null 이 되면서
      // App 의 effect 가 user_state 를 anonymous 로 다시 등록한다.
      resetMixpanel();
      queryClient.setQueryData(authMeQueryKey, null);
    },
  });
};
