import { useEffect, useRef, useState } from "react";
import friendSignUpImg from "../IntroduceFriendPage/assets/friendSignUpImg.png";
import {
    INTRODUCE_FRIEND_AUTH_STATE_STORAGE_KEY,
    KAKAO_OAUTH_FLOW_STORAGE_KEY,
    KAKAO_OAUTH_STATE_STORAGE_KEY,
    KAKAO_LOGIN_TOAST_STORAGE_KEY,
} from "../../constants/storageKeys";
import loginImg from "./asset/loginImg.png";
import NotLoginHeader from "../../components/NotLoginHeader";
import { useNavigate, useSearchParams } from "react-router-dom";
import kakaoIconImg from "./asset/kakaoLogo.svg";
import { useKakaoLoginMutation } from "../../queries/auth";
import type { UserStatus } from "../../types/user";

const KAKAO_AUTHORIZE_URL = "https://kauth.kakao.com/oauth/authorize";
const INTRODUCE_FRIEND_FLOW = "introduce-friend";
const SHOULD_CALL_BACKEND_LOGIN = false;

const createKakaoOAuthState = () => {
    if (window.crypto?.getRandomValues) {
        const randomValues = new Uint32Array(4);
        window.crypto.getRandomValues(randomValues);
        return Array.from(randomValues, (value) => value.toString(36)).join("");
    }

    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
};

const clearKakaoOAuthContext = () => {
    sessionStorage.removeItem(KAKAO_OAUTH_STATE_STORAGE_KEY);
    sessionStorage.removeItem(KAKAO_OAUTH_FLOW_STORAGE_KEY);
};

const getNextPathAfterLogin = (
    status: UserStatus,
    isIntroduceFriendFlow: boolean,
) => {
    if (!status.isRegistered) {
        return isIntroduceFriendFlow
            ? "/auth/signup?flow=introduce-friend"
            : "/auth/signup";
    }

    if (!status.hasIntroduction) {
        return "/dating/require-introduce";
    }

    if (!status.isProfileCompleted) {
        return "/dating/register";
    }

    return isIntroduceFriendFlow ? "/introduce-friend/generating" : "/";
};

function Kakao() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const authorizationCode = searchParams.get("code");
    const kakaoError = searchParams.get("error");
    const kakaoErrorDescription = searchParams.get("error_description");
    const callbackState = searchParams.get("state");
    const storedOAuthFlow = sessionStorage.getItem(KAKAO_OAUTH_FLOW_STORAGE_KEY);
    const isIntroduceFriendFlow =
        searchParams.get("flow") === INTRODUCE_FRIEND_FLOW ||
        storedOAuthFlow === INTRODUCE_FRIEND_FLOW;
    const processedCodeRef = useRef<string | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const {
        mutateAsync: loginWithKakao,
        isPending: isLoggingIn,
    } = useKakaoLoginMutation();

    const loginImage = isIntroduceFriendFlow ? friendSignUpImg : loginImg;
    const nextPath = isIntroduceFriendFlow
        ? "/introduce-friend/generating"
        : "/auth/signup";
    const headerTitle = isIntroduceFriendFlow ? "친구 소개하기" : "로그인";
    const currentAuthPath = isIntroduceFriendFlow
        ? "/auth?flow=introduce-friend"
        : "/auth";

    useEffect(() => {
        if (kakaoError || kakaoErrorDescription) {
            clearKakaoOAuthContext();
            setErrorMessage(
                kakaoError === "access_denied"
                    ? "카카오 로그인이 취소되었어요."
                    : "카카오 로그인에 실패했어요. 다시 시도해주세요.",
            );
            navigate(currentAuthPath, { replace: true });
            return;
        }

        if (!authorizationCode || processedCodeRef.current === authorizationCode) {
            return;
        }

        const storedOAuthState = sessionStorage.getItem(KAKAO_OAUTH_STATE_STORAGE_KEY);

        if (!callbackState || !storedOAuthState || callbackState !== storedOAuthState) {
            clearKakaoOAuthContext();
            setErrorMessage("카카오 로그인 요청을 확인할 수 없어요. 다시 시도해주세요.");
            navigate(currentAuthPath, { replace: true });
            return;
        }

        processedCodeRef.current = authorizationCode;
        setErrorMessage("");
        console.log("[Kakao OAuth] authorization code:", authorizationCode);

        if (!SHOULD_CALL_BACKEND_LOGIN) {
            clearKakaoOAuthContext();
            setErrorMessage("카카오 인가 코드가 콘솔에 출력됐어요.");
            navigate(currentAuthPath, { replace: true });
            return;
        }

        loginWithKakao({ authorizationCode })
            .then((response) => {
                clearKakaoOAuthContext();

                const nextPathAfterLogin = getNextPathAfterLogin(
                    response.status,
                    isIntroduceFriendFlow,
                );

                if (isIntroduceFriendFlow) {
                    sessionStorage.setItem(
                        INTRODUCE_FRIEND_AUTH_STATE_STORAGE_KEY,
                        "logged-in",
                    );
                }

                if (nextPathAfterLogin === "/auth/signup") {
                    sessionStorage.setItem(KAKAO_LOGIN_TOAST_STORAGE_KEY, "true");
                }

                navigate(nextPathAfterLogin, { replace: true });
            })
            .catch((error) => {
                console.error(error);
                clearKakaoOAuthContext();
                processedCodeRef.current = null;
                setErrorMessage("카카오 로그인에 실패했어요. 다시 시도해주세요.");
                navigate(currentAuthPath, { replace: true });
            });
    }, [
        authorizationCode,
        callbackState,
        currentAuthPath,
        kakaoError,
        kakaoErrorDescription,
        isIntroduceFriendFlow,
        loginWithKakao,
        navigate,
    ]);

    const handleKakaoLogin = () => {
        const kakaoRestApiKey = import.meta.env.VITE_KAKAO_REST_API_KEY;

        if (!kakaoRestApiKey) {
            setErrorMessage("카카오 로그인 설정이 없습니다.");
            return;
        }

        const state = createKakaoOAuthState();
        const redirectUri = `${window.location.origin}/auth`;
        const authorizeParams = new URLSearchParams({
            response_type: "code",
            client_id: kakaoRestApiKey,
            redirect_uri: redirectUri,
            state,
        });

        sessionStorage.setItem(KAKAO_OAUTH_STATE_STORAGE_KEY, state);
        sessionStorage.setItem(
            KAKAO_OAUTH_FLOW_STORAGE_KEY,
            isIntroduceFriendFlow ? INTRODUCE_FRIEND_FLOW : "default",
        );
        setErrorMessage("");

        window.location.assign(`${KAKAO_AUTHORIZE_URL}?${authorizeParams.toString()}`);
    };

    const handleSkip = () => {
        sessionStorage.setItem(INTRODUCE_FRIEND_AUTH_STATE_STORAGE_KEY, "guest");
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
                                    onClick={handleSkip}
                                    className="typo-button-text-b text-grey-100 underline underline-offset-[0.18rem]"
                                >
                                    건너뛰기
                                </button>
                                <button
                                    type="button"
                                    onClick={handleKakaoLogin}
                                    disabled={isLoggingIn}
                                    className="relative flex h-12 w-full items-center justify-center rounded-[0.375rem] bg-[#FEE500] px-[0.875rem]"
                                >
                                    <img
                                        src={kakaoIconImg}
                                        alt=""
                                        className="absolute left-[0.875rem] h-[1.125rem] w-[1.125rem]"
                                    />
                                    <span className="text-[1.125rem] font-semibold leading-[1.5] text-[rgba(0,0,0,0.85)]">
                                        {isLoggingIn ? "로그인 처리 중..." : "카카오 로그인"}
                                    </span>
                                </button>
                                {errorMessage && (
                                    <p className="typo-comment-2 text-warning">
                                        {errorMessage}
                                    </p>
                                )}
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
                            disabled={isLoggingIn}
                            className="relative mx-auto flex h-12 w-full max-w-[20.9375rem] items-center justify-center rounded-[0.375rem] bg-[#FEE500] px-[0.875rem]"
                        >
                            <img
                                src={kakaoIconImg}
                                alt=""
                                className="absolute left-[0.875rem] h-[1.125rem] w-[1.125rem]"
                            />
                            <span className="text-[1.125rem] font-semibold leading-[1.5] text-[rgba(0,0,0,0.85)]">
                                {isLoggingIn ? "로그인 처리 중..." : "카카오 로그인"}
                            </span>
                        </button>
                        {errorMessage && (
                            <p className="mt-2 text-center typo-comment-2 text-warning">
                                {errorMessage}
                            </p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default Kakao;
