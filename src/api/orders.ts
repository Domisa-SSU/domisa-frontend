import { apiClient } from './client';

export type CookieProductCode =
  | 'COOKIE_5'
  | 'COOKIE_10'
  | 'COOKIE_30'
  | 'COOKIE_60';

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

type CookieOrderStatus = 'PAID' | 'PAYMENT_PENDING' | 'UNCONFIRMED';

export type CookieOrderStatusResponse = {
  confirmed: boolean;
  status: CookieOrderStatus;
  cookieAmount: number | null;
  message?: string;
};

const parseCookieOrderStatusResponse = (value: unknown): CookieOrderStatusResponse | null => {
  if (!value || typeof value !== 'object') return null;
  const r = value as Record<string, unknown>;
  if (typeof r.confirmed !== 'boolean' || typeof r.status !== 'string') return null;
  return {
    confirmed: r.confirmed,
    status: r.status as CookieOrderStatus,
    cookieAmount: typeof r.cookie_amount === 'number' ? r.cookie_amount : null,
    message: typeof r.message === 'string' ? r.message : undefined,
  };
};

/**
 * API 제목: 쿠키 충전 완료 확인
 * GET /api/orders/cookies/status
 * 입금자명과 입금금액으로 쿠키 주문 상태를 조회한다.
 */
export const getCookieOrderStatus = async (params: {
  billingName: string;
  orderAmount: number;
}): Promise<CookieOrderStatusResponse> => {
  const { data } = await apiClient.get<unknown>('/api/orders/cookies/status', {
    params: { billing_name: params.billingName, order_amount: params.orderAmount },
  });
  const result = parseCookieOrderStatusResponse(data);
  if (!result) throw new Error('Invalid cookie order status response');
  return result;
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