export const INSUFFICIENT_COOKIES_REASON = "insufficientCookies";

export type CookiePageLocationState = {
  reason?: typeof INSUFFICIENT_COOKIES_REASON;
  returnTo?: string;
};

export const insufficientCookiesLocationState: CookiePageLocationState = {
  reason: INSUFFICIENT_COOKIES_REASON,
};
