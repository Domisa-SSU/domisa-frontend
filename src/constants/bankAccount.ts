/** 쿠키 구매 입금 계좌. 계좌이체 모달과 토스 송금 딥링크가 같은 값을 쓴다. */
export const BANK_NAME = "농협";
export const ACCOUNT_HOLDER = "조해원";

/** 화면에 표시하는 형식 */
export const ACCOUNT_NUMBER = "302-1155-5235-91";
/** 딥링크 등 숫자만 필요한 곳에서 쓰는 형식 */
export const ACCOUNT_NUMBER_PLAIN = ACCOUNT_NUMBER.replace(/-/g, "");
