import { apiClient } from './client';

export type CookieProductCode =
  | 'COOKIE_5'
  | 'COOKIE_10'
  | 'COOKIE_30'
  | 'COOKIE_60'
  | 'COOKIE_1000_TEST';

export type CreateCookieOrderRequest = {
  productCode: CookieProductCode;
};

export type CreateCookieOrderResponse = {
  billingName: string;
  orderAmount: number;
};

const parseCreateCookieOrderResponse = (value: unknown): CreateCookieOrderResponse | null => {
  if (!value || typeof value !== 'object') return null;
  const r = value as Record<string, unknown>;
  if (typeof r.billing_name !== 'string' || typeof r.order_amount !== 'number') return null;
  return {
    billingName: r.billing_name,
    orderAmount: r.order_amount,
  };
};

export type CancelCookieOrderRequest = {
  billing_name: string;
  order_amount: number;
};

/**
 * API 제목: 쿠키 주문 취소
 * POST /api/orders/cookies/cancel
 * 진행 중인 쿠키 구매 주문을 취소한다.
 */
export const cancelCookieOrder = async (payload: CancelCookieOrderRequest): Promise<void> => {
  await apiClient.post('/api/orders/cookies/cancel', payload);
};

/**
 * API 제목: 쿠키 주문 생성
 * POST /api/orders/cookies
 * 쿠키 구매 주문을 생성하고, 입금자명과 주문 금액을 반환한다.
 */
export const createCookieOrder = async (
  payload: CreateCookieOrderRequest
): Promise<CreateCookieOrderResponse> => {
  const { data } = await apiClient.post<unknown>('/api/orders/cookies', payload);
  const result = parseCreateCookieOrderResponse(data);
  if (!result) throw new Error('Invalid create cookie order response');
  return result;
};