import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ErrorPage from "../ErrorPage/ErrorPage";
import NotLoginHeader from "../../components/NotLoginHeader";
import ReferralSection from "../../components/ReferralSection";
import { useUserCookiesQuery } from "../../queries/users";
import { isServerError } from "../../utils/apiError";
import {
  INSUFFICIENT_COOKIES_REASON,
  type CookiePageLocationState,
} from "../../constants/cookieNavigation";
import cookieImg from "../../assets/cookie.svg";
import cookiePackageImg from "../../assets/cookieIllerst.png";
import type { CookieProductCode } from "../../api/cookiePayment";
import { track } from "../../utils/mixpanel";

const COOKIE_PACKAGES: {
  count: number;
  price: string;
  productCode: CookieProductCode;
  discount?: string;
}[] = [
  { count: 5, price: "1,900", productCode: "COOKIE_5" },
  { count: 10, price: "3,500", productCode: "COOKIE_10", discount: "8% 할인" },
  { count: 15, price: "5,000", productCode: "COOKIE_15", discount: "12% 할인" },
  { count: 50, price: "7,000", productCode: "COOKIE_50", discount: "63% 할인" },
  { count: 999999, price: "999,999", productCode: "COOKIE_999999", discount: "99% 할인" },
];

const PRICE_BUTTON_GRADIENT =
  "linear-gradient(174.66deg, rgb(255, 139, 110) 22.189%, rgb(255, 193, 78) 90.529%)";
const DISCOUNT_TEXT_GRADIENT =
  "linear-gradient(167.22deg, rgb(255, 240, 163) 6.498%, rgb(255, 241, 89) 86.393%)";

function MyCookiePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: cookies, error } = useUserCookiesQuery();
  const locationState = location.state as CookiePageLocationState | null;
  const isInsufficientCookiesEntry =
    locationState?.reason === INSUFFICIENT_COOKIES_REASON;

  // 구매 퍼널의 시작점. 여기 들어왔다가 구매 없이 나간 사람이 이탈이다.
  useEffect(() => {
    track("cookie_page_viewed", {
      entry: isInsufficientCookiesEntry ? "insufficient_cookies" : "direct",
    });
  }, [isInsufficientCookiesEntry]);

  if (isServerError(error)) {
    return <ErrorPage />;
  }

  return (
    <div className="min-h-screen bg-grey-100">
      <NotLoginHeader title="보유 쿠키" />

      <div className="px-5 pt-9 pb-10">
        <div className="mx-auto flex w-full max-w-[22.6875rem] flex-col gap-10">

          {/* 보유 쿠키 수 */}
          <div className="flex flex-col items-center gap-2.5">
            <div
              className={`flex w-full items-center justify-center rounded-[0.625rem] bg-primary-100 px-2.5 ${
                isInsufficientCookiesEntry
                  ? "min-h-[5.1875rem] flex-col gap-1.5 py-4"
                  : "h-[3.75rem]"
              }`}
            >
              {isInsufficientCookiesEntry && (
                <p className="typo-comment-1 text-center text-warning">
                  쿠키가 부족해요
                </p>
              )}
              <div className="flex items-center gap-1">
                <img src={cookieImg} alt="" className="w-4 h-4" />
                <span className="typo-header-3-b text-primary-500">{cookies?.cookieCount ?? '-'}개</span>
              </div>
            </div>
            <p className="typo-comment-2 text-center text-primary-600">
              * 도미사럽은 9/17 23:59분에 종료돼요.
              <br />
              이후에는 쿠키 사용이 불가능해요
            </p>
          </div>

          {/* 쿠키 구매하기 */}
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-col gap-3.5">
              <span className="typo-button-text text-grey-900">쿠키 구매하기</span>
              <div className="flex flex-col">
                {COOKIE_PACKAGES.map(({ count, price, productCode, discount }) => (
                  <div
                    key={productCode}
                    className="flex items-center justify-between h-[3.375rem] px-2.5 py-2 border-b border-b-[0.8px] border-grey-400"
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={cookiePackageImg} alt="" className="w-[1.28rem] h-[1.28rem] object-cover" />
                      <span className="typo-comment-1 text-grey-900">쿠키 {count.toLocaleString()}개</span>
                    </div>
                    <button
                      onClick={() => {
                        track("cookie_product_selected", {
                          product_code: productCode,
                          cookie_count: count,
                          price: Number(price.replace(/,/g, "")),
                        });
                        navigate("/my/cookie/purchase", { state: { count, price, productCode, returnTo: locationState?.returnTo } });
                      }}
                      className="flex flex-col items-center justify-center h-10 w-[5.625rem] px-2.5 rounded-[0.3125rem]"
                      style={{ background: PRICE_BUTTON_GRADIENT }}
                    >
                      {discount && (
                        <span
                          className="typo-comment-2 font-bold tracking-[-0.045em] bg-clip-text text-transparent"
                          style={{ backgroundImage: DISCOUNT_TEXT_GRADIENT }}
                        >
                          {discount}
                        </span>
                      )}
                      <span className="flex items-center justify-center gap-0.5 text-[0.8125rem] font-semibold leading-[0.875rem] text-grey-100">
                        <span>₩</span>
                        <span>{price}</span>
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <p className="typo-input-text-r text-grey-700">
              나에게 호감 표시한 사람의 프로필 확인하기 : 쿠키 2개
              <br />
              카드 섞기 : 쿠키 2개
            </p>
          </div>

          {/* 친구 소개 */}
          <ReferralSection buttonLabel="무료 쿠키 받으러 가기" />

        </div>
      </div>
    </div>
  );
}

export default MyCookiePage;
