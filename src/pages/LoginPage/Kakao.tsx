import friendSignUpImg from "../IntroduceFriendPage/assets/friendSignUpImg.png";
import { KAKAO_LOGIN_TOAST_STORAGE_KEY } from "../../constants/storageKeys";
import loginImg from "./asset/loginImg.png";
import NotLoginHeader from "../../components/NotLoginHeader";
import { useNavigate, useSearchParams } from "react-router-dom";

const kakaoIconImg =
    "https://www.figma.com/api/mcp/asset/7f35b5c3-ab8b-475a-b18a-506be69f947c";

function Kakao() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isIntroduceFriendFlow = searchParams.get("flow") === "introduce-friend";

    const loginImage = isIntroduceFriendFlow ? friendSignUpImg : loginImg;
    const nextPath = isIntroduceFriendFlow
        ? "/auth/signup?flow=introduce-friend"
        : "/auth/signup";
    const headerTitle = isIntroduceFriendFlow ? "친구 소개하기" : "로그인";

    const handleKakaoLogin = () => {
        // TODO: API 연동 시 카카오 OAuth 성공 콜백 안으로 이동
        sessionStorage.setItem(KAKAO_LOGIN_TOAST_STORAGE_KEY, "true");
        navigate(nextPath);
    };

    return (
        <div
            className="relative min-h-screen overflow-hidden"
            style={{
                background: "linear-gradient(180deg, #FFF 13.73%, #FF6C9D 83.58%)",
            }}
        >
            <div className="absolute inset-x-0 top-0 z-10">
                <NotLoginHeader title={headerTitle}></NotLoginHeader>
            </div>
            {isIntroduceFriendFlow ? (
                <div className="relative min-h-screen px-5 pb-[2.94rem]">
                    <p className="absolute inset-x-0 top-[10.75rem] px-5 text-center typo-title-header-1 leading-[1.55] text-grey-900">
                            {"지금 로그인하고 친구에게 공유하면,"}
                            <br />
                            {"친구가 서비스에 등록할 시"}
                            <br />
                            <span className="text-primary-600">쿠키 200P</span>
                            {"를 받을 수 있어요"}
                    </p>
                    <img
                        src={loginImage}
                        alt=""
                        className="absolute left-1/2 top-[20.75rem] h-[15.36rem] w-[15.36rem] -translate-x-1/2 object-contain"
                    />
                    <div className="mx-auto flex w-full max-w-[22.625rem] flex-col items-center gap-[1.12rem]">
                        <div className="absolute inset-x-0 bottom-[2.94rem] px-5">
                            <div className="mx-auto flex w-full max-w-[22.625rem] flex-col items-center gap-[1.12rem]">
                                <button
                                    type="button"
                                    onClick={() => navigate(nextPath)}
                                    className="typo-button-text-b text-grey-100 underline underline-offset-[0.18rem]"
                                >
                                    건너뛰기
                                </button>
                                <button
                                    type="button"
                                    onClick={handleKakaoLogin}
                                    className="relative flex h-12 w-full items-center justify-center rounded-[0.375rem] bg-[#FEE500] px-[0.875rem]"
                                >
                                    <img
                                        src={kakaoIconImg}
                                        alt=""
                                        className="absolute left-[0.875rem] h-[1.125rem] w-[1.125rem]"
                                    />
                                    <span className="text-[1.125rem] font-semibold leading-[1.5] text-[rgba(0,0,0,0.85)]">
                                        카카오 로그인
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="absolute inset-0 flex -translate-y-[10vh] flex-col items-center justify-center px-5">
                        <p className="mb-[1.19rem] whitespace-pre-line text-center typo-title-header-1 text-grey-900">
                            {"3초만에 로그인하고\n캠퍼스에서 기다리고 있는\n내 인연을 만나보세요"}
                        </p>
                        <img
                            src={loginImage}
                            alt=""
                            className="h-[15.36rem] w-[15.36rem] object-cover"
                        />
                    </div>
                    <div className="absolute inset-x-0 bottom-0 bg-primary-400 px-5 pt-[0.62rem] pb-[2.94rem]">
                        <button
                            type="button"
                            onClick={handleKakaoLogin}
                            className="relative mx-auto flex h-12 w-full max-w-[20.9375rem] items-center justify-center rounded-[0.375rem] bg-[#FEE500] px-[0.875rem]"
                        >
                            <img
                                src={kakaoIconImg}
                                alt=""
                                className="absolute left-[0.875rem] h-[1.125rem] w-[1.125rem]"
                            />
                            <span className="text-[1.125rem] font-semibold leading-[1.5] text-[rgba(0,0,0,0.85)]">
                                카카오 로그인
                            </span>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default Kakao;
