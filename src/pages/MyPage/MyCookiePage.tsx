import { useNavigate } from "react-router-dom";
import NotLoginHeader from "../../components/NotLoginHeader";
import Button from "../../components/Button/Button";
import { ButtonVariant, ButtonSize } from "../../components/Button/ButtonEnums";
import cookieImg from "../../assets/cookie.svg";
import heartImg from "../../assets/heartIcon.svg";

// TODO: API 연동 시 교체
const COOKIE_COUNT = 10;
const REFERRAL_CODE = "d9fs3k29";

const COOKIE_PACKAGES = [
  { count: 5, price: "2,000" },
  { count: 10, price: "4,000" },
  { count: 30, price: "5,000" },
  { count: 60, price: "9,000" },
];

function MyCookiePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-grey-100">
      <NotLoginHeader title="보유 쿠키" />

      <div className="px-5 pt-9 pb-10">
        <div className="mx-auto flex w-full max-w-[22.6875rem] flex-col gap-10">

          {/* 보유 쿠키 수 */}
          <div className="flex items-center justify-center h-[3.75rem] bg-primary-100 rounded-[0.625rem]">
            <div className="flex items-center gap-1">
              <img src={cookieImg} alt="" className="w-4 h-4" />
              <span className="typo-header-3-b text-primary-500">{COOKIE_COUNT}개</span>
            </div>
          </div>

          {/* 쿠키 구매하기 */}
          <div className="flex flex-col gap-3.5">
            <span className="typo-button-text text-grey-900">쿠키 구매하기</span>
            <div className="flex flex-col">
              {COOKIE_PACKAGES.map(({ count, price }) => (
                <div
                  key={count}
                  className="flex items-center justify-between h-[3.125rem] px-2.5 py-2 border-b border-b-[0.8px] border-grey-400"
                >
                  <div className="flex items-center gap-2.5">
                    <img src={cookieImg} alt="" className="w-5 h-5" />
                    <span className="typo-comment-1 text-grey-900">쿠키 {count}개</span>
                  </div>
                  <button
                    className="flex items-center justify-center h-8 w-20 rounded-[0.3125rem] typo-comment-2 text-grey-100"
                    style={{
                      background:
                        "linear-gradient(174.66deg, rgb(255, 139, 110) 22.189%, rgb(255, 193, 78) 90.529%)",
                    }}
                  >
                    ₩ {price}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 친구 소개 */}
          <div className="flex flex-col items-center gap-2.5 px-2.5 py-5 bg-grey-200 rounded-[0.625rem]">
            <div className="flex items-center gap-1">
              <span className="typo-button-text text-grey-900">
                친구 소개하고{" "}
                <span className="text-primary-500">쿠키 2개</span>
                {" "}받기
              </span>
              <img src={heartImg} alt="" className="w-4 h-4" />
            </div>
            <span className="typo-input-text-m text-grey-700">
              추천인 코드: {REFERRAL_CODE}
            </span>
            <Button
              label="친구 소개하기"
              variant={ButtonVariant.Main}
              size={ButtonSize.Small}
              onClick={() => navigate("/introduce-friend")}
            />
          </div>

        </div>
      </div>
    </div>
  );
}

export default MyCookiePage;