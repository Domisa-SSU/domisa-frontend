import { useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  checkNicknameAvailability,
  deleteMe,
  getCookies,
  getMe,
  getRandomNickname,
  registerUser,
  updateMe,
} from "../api/users";
import type { UserMeResponse } from "../api/users";
import { authMeQueryKey, clearAuthenticatedUserQueries, useAuthMeQuery } from "./auth";
import { registerGender } from "../utils/mixpanel";

export const userMeQueryKey = ["users", "me"] as const;
export const userCookiesQueryKey = ["users", "cookies"] as const;

/** imageUrl 이 준비되기를 기다리며 3초 간격으로 최대 20번(약 1분) 다시 받아온다 */
const PROFILE_IMAGE_POLL_INTERVAL_MS = 3 * 1000;
const PROFILE_IMAGE_MAX_POLLS = 20;

/**
 * 회원가입에서 사진은 필수라, 가입한 사용자의 imageUrl 이 null 이면
 * "사진 없음"이 아니라 서버에서 아직 처리 중이라는 뜻이다.
 * pollWhileImageMissing 을 주면 준비될 때까지(최대 1분) 다시 받아온다.
 */
export const useUserMeQuery = (options?: { pollWhileImageMissing?: boolean; enabled?: boolean }) => {
  const pollAttemptsRef = useRef(0);
  const { data: authMe } = useAuthMeQuery();

  /**
   * 가입을 마친 사용자에게만 의미가 있는 요청이다.
   *
   * 탈퇴 직후가 문제였다. 세션 쿠키는 살아 있고 가입 상태만 풀리는데, 이때
   * /api/users/me 는 401 이 아니라 200 으로 응답하면서 프로필 필드를 주지 않는다.
   * 파싱이 실패해 "Invalid user me response" 가 나고, 계약 위반은 전역 에러로 올라가
   * 탈퇴가 성공했는데도 사용자에게는 에러 화면이 보인다.
   *
   * 탈퇴·로그아웃은 캐시를 비우는데(clearAuthenticatedUserQueries), 그 순간 살아 있는
   * 옵저버가 곧바로 다시 받아오려 한다. 호출부마다 막기보다 여기서 한 번 잠근다.
   */
  const isRegisteredUser = authMe?.status.isRegistered === true;

  const query = useQuery({
    queryKey: userMeQueryKey,
    queryFn: getMe,
    retry: false,
    enabled: (options?.enabled ?? true) && isRegisteredUser,
    staleTime: 10 * 60 * 1000, // 10분 (imageUrl Signed URL 만료 20분보다 짧게)
    refetchInterval: options?.pollWhileImageMissing
      ? (query) => {
          const me = query.state.data;

          if (!me || me.imageUrl) {
            pollAttemptsRef.current = 0;
            return false;
          }

          if (pollAttemptsRef.current >= PROFILE_IMAGE_MAX_POLLS) {
            return false;
          }

          pollAttemptsRef.current += 1;
          return PROFILE_IMAGE_POLL_INTERVAL_MS;
        }
      : undefined,
  });

  /**
   * 쿠키 구매 지표를 남녀로 나눠 보려면 성별이 이벤트에 붙어 있어야 한다.
   * gender 는 이 응답에만 있으므로 여기서 한 번 등록하고,
   * 수퍼 프로퍼티라 이후 이벤트에는 계속 따라붙는다.
   */
  const gender = query.data?.gender;

  useEffect(() => {
    if (gender === undefined) {
      return;
    }

    registerGender(gender);
  }, [gender]);

  return query;
};

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

export const useRandomNicknameMutation = () =>
  useMutation({
    mutationKey: ["users", "random-nickname"],
    meta: { suppressGlobalError: true },
    mutationFn: getRandomNickname,
  });

export const useDeleteMeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMe,
    onSuccess: () => {
      clearAuthenticatedUserQueries(queryClient);
    },
  });
};
