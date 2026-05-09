export const INSUFFICIENT_COOKIES_REASON = "insufficientCookies";

export type CookiePageLocationState = {
  reason?: typeof INSUFFICIENT_COOKIES_REASON;
};

export const insufficientCookiesLocationState: CookiePageLocationState = {
  reason: INSUFFICIENT_COOKIES_REASON,
};
