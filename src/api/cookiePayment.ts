import axios from 'axios';
import { apiClient } from './client';

/** 쿠키 상품 코드. 결제 확인 API의 cookieType과 같은 값을 쓴다. */
export type CookieProductCode =
  | 'COOKIE_5'
  | 'COOKIE_10'
  | 'COOKIE_15'
  | 'COOKIE_50'
  | 'COOKIE_999999';

/** PAID: 지급 완료(200), WAITING: 입금 내역 확인 중(202) */
export type CookiePaymentStatus = 'PAID' | 'WAITING';

export type ConfirmCookiePaymentRequest = {
  depositorName: string;
  cookieType: CookieProductCode;
};

export type ConfirmCookiePaymentResponse = {
  status: CookiePaymentStatus;
  cookieType: CookieProductCode;
  purchasedCookieCount: number;
  currentCookieCount: number;
  message?: string;
};

const parseConfirmCookiePaymentResponse = (
  value: unknown
): ConfirmCookiePaymentResponse | null => {
  if (!value || typeof value !== 'object') return null;
  const r = value as Record<string, unknown>;
  if (typeof r.status !== 'string') return null;
  if (typeof r.cookieType !== 'string') return null;
  if (typeof r.purchasedCookieCount !== 'number') return null;
  if (typeof r.currentCookieCount !== 'number') return null;
  return {
    status: r.status as CookiePaymentStatus,
    cookieType: r.cookieType as CookieProductCode,
    purchasedCookieCount: r.purchasedCookieCount,
    currentCookieCount: r.currentCookieCount,
    message: typeof r.message === 'string' ? r.message : undefined,
  };
};

/** 같은 조건의 입금 내역이 여러 건이라 서버가 건을 특정하지 못한 경우. (409) */
export const isDuplicatedPaymentError = (error: unknown) =>
  axios.isAxiosError(error) && error.response?.status === 409;

/** 로그인이 풀린 경우. (401) 전역 인증 처리에 맡긴다. */
export const isLoginRequiredError = (error: unknown) =>
  axios.isAxiosError(error) && error.response?.status === 401;

/**
 * 서버가 입금 확인 대기(sleep) 중 인터럽트된 일시적 예외. (503)
 * 결과를 모르는 것뿐이므로 그대로 다시 확인하면 된다.
 */
export const isPaymentConfirmDelayInterruptedError = (error: unknown) => {
  if (!axios.isAxiosError(error) || error.response?.status !== 503) {
    return false;
  }

  const responseData = error.response.data;

  if (!responseData || typeof responseData !== 'object') {
    return false;
  }

  return (
    (responseData as Record<string, unknown>).code ===
    'PAYMENT_CONFIRM_DELAY_INTERRUPTED'
  );
};

/**
 * API 제목: 쿠키 결제 확인
 * POST /api/cookies/payment/confirm
 * 사용자가 입력한 입금자명으로 입금 내역을 확인하고 쿠키를 지급한다.
 *
 * 200 PAID: 지급 완료
 * 202 WAITING: 아직 입금 내역이 없음. 서버가 약 1초 지연 후 응답하므로 그대로 재요청하면 된다.
 * 400 INVALID_REQUEST / MISSING_REQUIRED_FIELD, 401 LOGIN_REQUIRED,
 * 404 USER_NOT_FOUND, 409 DUPLICATED_PAYMENT, 503 PAYMENT_CONFIRM_DELAY_INTERRUPTED
 */
export const confirmCookiePayment = async (
  payload: ConfirmCookiePaymentRequest
): Promise<ConfirmCookiePaymentResponse> => {
  const { data } = await apiClient.post<unknown>('/api/cookies/payment/confirm', payload);
  const result = parseConfirmCookiePaymentResponse(data);
  if (!result) throw new Error('Invalid confirm cookie payment response');
  return result;
};
