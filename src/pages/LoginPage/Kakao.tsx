import { useCallback, useEffect, useRef, useState } from "react";
import friendSignUpImg from "../IntroduceFriendPage/assets/friendSignUpImg.png";
import {
    INTRODUCE_FRIEND_AUTH_STATE_STORAGE_KEY,
    INTRODUCE_FRIEND_DRAFT_STORAGE_KEY,
    KAKAO_OAUTH_FLOW_STORAGE_KEY,
    KAKAO_OAUTH_STATE_STORAGE_KEY,
    KAKAO_RETURN_TO_STORAGE_KEY,
    KAKAO_LOGIN_TOAST_STORAGE_KEY,
} from "../../constants/storageKeys";
import loginImg from "./asset/loginImg.png";
import NotLoginHeader from "../../components/NotLoginHeader";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import rightArrowIcon from "../../assets/right_arrow.svg";
import kakaoIconImg from "./asset/kakaoLogo.svg";
import { useAuthMeQuery, useKakaoLoginMutation } from "../../queries/auth";
import type { UserStatus } from "../../types/user";

const KAKAO_AUTHORIZE_URL = "https://kauth.kakao.com/oauth/authorize";
const INTRODUCE_FRIEND_FLOW = "introduce-friend";
const canBypassKakaoLogin = import.meta.env.DEV;

const getSafeReturnTo = (value: string | null) => {
    if (!value || !value.startsWith("/") || value.startsWith("//")) {
        return null;
    }

    return value;
};

const getSignupReturnTo = (value: string | null) => {
    if (!value) {
        return null;
    }

    const pathname = new URL(value, window.location.origin).pathname;

    return pathname.startsWith("/auth/signup") ? value : null;
};

const createSignupPath = (isIntroduceFriendFlow: boolean, returnTo: string | null) => {
    const params = new URLSearchParams();

    if (isIntroduceFriendFlow) {
        params.set("flow", INTRODUCE_FRIEND_FLOW);
    }

    if (returnTo) {
        params.set("returnTo", returnTo);
    }

    const search = params.toString();

    return `/auth/signup${search ? `?${search}` : ""}`;
};

const createPendingSignupPath = (
    isIntroduceFriendFlow: boolean,
    returnTo: string | null,
) => getSignupReturnTo(returnTo) ?? createSignupPath(isIntroduceFriendFlow, returnTo);

const createAuthPath = (isIntroduceFriendFlow: boolean, returnTo: string | null) => {
    const params = new URLSearchParams();

    if (isIntroduceFriendFlow) {
        params.set("flow", INTRODUCE_FRIEND_FLOW);
    }

    if (returnTo) {
        params.set("returnTo", returnTo);
    }

    const search = params.toString();

    return `/auth${search ? `?${search}` : ""}`;
};

const getReceiveIntroduceReturnTo = (returnTo: string | null) => {
    if (!returnTo) {
        return null;
    }

    const pathname = new URL(returnTo, window.location.origin).pathname;

    return pathname.startsWith("/introduce/") ? returnTo : null;
};

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
    sessionStorage.removeItem(KAKAO_RETURN_TO_STORAGE_KEY);
};

const getKakaoRedirectUri = () => `${window.location.origin}/auth`;

const hasValidIntroduceFriendDraft = () => {
    const savedDraft = sessionStorage.getItem(INTRODUCE_FRIEND_DRAFT_STORAGE_KEY);

    if (!savedDraft) {
        return false;
    }

    try {
        const draft = JSON.parse(savedDraft) as Record<string, unknown>;

        return (
            typeof draft.shortIntro === "string" &&
            draft.shortIntro.trim().length > 0 &&
            typeof draft.charmPoint === "string" &&
            draft.charmPoint.trim().length > 0 &&
            typeof draft.funnyEpisode === "string" &&
            draft.funnyEpisode.trim().length > 0
        );
    } catch {
        return false;
    }
};

const getNextPathAfterLogin = (
    status: UserStatus,
    isIntroduceFriendFlow: boolean,
    returnTo: string | null,
) => {
    if (!status.isRegistered) {
        return createPendingSignupPath(isIntroduceFriendFlow, returnTo);
    }

    if (returnTo) {
        return returnTo;
    }

    return isIntroduceFriendFlow ? "/introduce-friend/generating" : "/";
};

type PendingSignupTransition = {
    path: string;
    showKakaoLoginToast: boolean;
};

type KakaoLocationState = {
    pendingSignupPath?: unknown;
    showKakaoLoginToast?: unknown;
} | null;

type SignupTermsAgreementModalProps = {
    onAccept: () => void;
    onOpenTerms: (path: string) => void;
};

function SignupTermsAgreementModal({
    onAccept,
    onOpenTerms,
}: SignupTermsAgreementModalProps) {
    const agreementItems = [
        {
            label: "[필수] 이용약관 동의",
            path: "/terms/service",
        },
        {
            label: "[필수] 개인정보 수집 및 이용동의",
            path: "/terms/privacy",
        },
    ];

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="signup-terms-title"
            className="fixed inset-0 z-50 flex items-end justify-center bg-grey-900/70 px-5 pb-[1.875rem]"
        >
            <div className="flex w-full max-w-[22.625rem] flex-col items-center gap-6 rounded-[0.875rem] bg-grey-100 px-5 pt-[1.875rem] pb-5">
                <div className="flex w-full max-w-[20.125rem] flex-col gap-2.5">
                    <h2
                        id="signup-terms-title"
                        className="typo-title-header-1-b text-grey-900"
                    >
                        도미사럽 로그인을 위해
                        <br />
                        꼭 필요한 동의만 추렸어요
                    </h2>
                    <p className="typo-input-text-m text-warning-ac">
                        *도미사럽은 대학(원) 재·휴학생만 이용 가능해요
                    </p>
                </div>

                <div className="flex w-full max-w-[20.125rem] flex-col gap-2.5">
                    <p className="typo-input-text-m text-grey-700">
                        도미사럽 동의항목
                    </p>
                    {agreementItems.map((item) => (
                        <button
                            key={item.path}
                            type="button"
                            onClick={() => onOpenTerms(item.path)}
                            className="flex h-[1.875rem] w-full items-center justify-between"
                        >
                            <span className="flex items-center gap-2.5">
                                <span
                                    aria-hidden="true"
                                    className="flex h-[1.875rem] w-[1.6875rem] items-center justify-center text-[1.375rem] font-semibold leading-none text-primary-500"
                                >
                                    ✓
                                </span>
                                <span className="typo-button-text-b text-grey-700">
                                    {item.label}
                                </span>
                            </span>
                            <img
                                src={rightArrowIcon}
                                alt=""
                                aria-hidden="true"
                                className="h-[0.875rem] w-2"
                            />
                        </button>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={onAccept}
                    className="flex h-[3.125rem] w-full max-w-[20.125rem] items-center justify-center rounded-[0.875rem] bg-primary-500 px-2.5 typo-button-text-b text-grey-100"
                >
                    동의하고 시작하기
                </button>
            </div>
        </div>
    );
}

function Kakao() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { data: authMe } = useAuthMeQuery();
    const authorizationCode = searchParams.get("code");
    const kakaoError = searchParams.get("error");
    const kakaoErrorDescription = searchParams.get("error_description");
    const callbackState = searchParams.get("state");
    const storedOAuthFlow = sessionStorage.getItem(KAKAO_OAUTH_FLOW_STORAGE_KEY);
    const returnTo = getSafeReturnTo(
        searchParams.get("returnTo") ??
        sessionStorage.getItem(KAKAO_RETURN_TO_STORAGE_KEY),
    );
    const isIntroduceFriendFlow =
        searchParams.get("flow") === INTRODUCE_FRIEND_FLOW ||
        storedOAuthFlow === INTRODUCE_FRIEND_FLOW;
    const processedCodeRef = useRef<string | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [pendingSignupTransition, setPendingSignupTransition] =
        useState<PendingSignupTransition | null>(null);
    const {
        mutateAsync: loginWithKakao,
        isPending: isLoggingIn,
    } = useKakaoLoginMutation();

    const loginImage = isIntroduceFriendFlow ? friendSignUpImg : loginImg;
    const nextPath = isIntroduceFriendFlow
        ? "/introduce-friend/generating"
        : "/auth/signup";
    const headerTitle = isIntroduceFriendFlow ? "친구 소개하기" : "로그인";
    const currentAuthPath = createAuthPath(isIntroduceFriendFlow, returnTo);
    const receiveIntroduceReturnTo = getReceiveIntroduceReturnTo(returnTo);
    const locationState = location.state as KakaoLocationState;
    const signupReturnTo = getSignupReturnTo(returnTo);
    const pendingSignupPathFromLocationState =
        typeof locationState?.pendingSignupPath === "string"
            ? getSafeReturnTo(locationState.pendingSignupPath)
            : null;
    const shouldShowKakaoLoginToastFromLocationState =
        locationState?.showKakaoLoginToast === true;
    const canShowSignupTermsModal = authMe?.status.isRegistered !== true;
    const pendingSignupTransitionFromLocationState =
        canShowSignupTermsModal && pendingSignupPathFromLocationState
            ? {
                path: pendingSignupPathFromLocationState,
                showKakaoLoginToast: shouldShowKakaoLoginToastFromLocationState,
            }
            : null;
    const pendingSignupTransitionFromReturnTo =
        canShowSignupTermsModal &&
        !authorizationCode &&
        !kakaoError &&
        !kakaoErrorDescription &&
        authMe &&
        signupReturnTo
            ? {
                path: signupReturnTo,
                showKakaoLoginToast: false,
            }
            : null;
    const activePendingSignupTransition =
        pendingSignupTransition ??
        pendingSignupTransitionFromLocationState ??
        pendingSignupTransitionFromReturnTo;

    const openSignupTermsModal = useCallback(
        (signupPath: string, showKakaoLoginToast: boolean) => {
            const nextTransition = {
                path: signupPath,
                showKakaoLoginToast,
            };

            setPendingSignupTransition(nextTransition);
            navigate(currentAuthPath, {
                replace: true,
                state: {
                    pendingSignupPath: signupPath,
                    showKakaoLoginToast,
                },
            });
        },
        [currentAuthPath, navigate, setPendingSignupTransition],
    );

    useEffect(() => {
        if (
            !isIntroduceFriendFlow ||
            !authMe ||
            authMe.status.isRegistered !== true ||
            authorizationCode ||
            kakaoError ||
            kakaoErrorDescription
        ) {
            return;
        }

        navigate(
            hasValidIntroduceFriendDraft() ? "/introduce-friend/generating" : "/introduce-friend",
            { replace: true },
        );
    }, [
        authMe,
        authorizationCode,
        isIntroduceFriendFlow,
        kakaoError,
        kakaoErrorDescription,
        navigate,
    ]);

    useEffect(() => {
        const setDeferredErrorMessage = (message: string) => {
            window.setTimeout(() => setErrorMessage(message), 0);
        };

        if (kakaoError || kakaoErrorDescription) {
            clearKakaoOAuthContext();

            if (kakaoError === "access_denied" && receiveIntroduceReturnTo) {
                navigate(receiveIntroduceReturnTo, { replace: true });
                return;
            }

            setDeferredErrorMessage(
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
            setDeferredErrorMessage("카카오 로그인 요청을 확인할 수 없어요. 다시 시도해주세요.");
            navigate(currentAuthPath, { replace: true });
            return;
        }

        processedCodeRef.current = authorizationCode;
        setDeferredErrorMessage("");

        loginWithKakao({
            authorizationCode,
            redirectUri: getKakaoRedirectUri(),
        })
            .then((response) => {
                clearKakaoOAuthContext();

                const nextPathAfterLogin = getNextPathAfterLogin(
                    response.status,
                    isIntroduceFriendFlow,
                    returnTo,
                );

                if (isIntroduceFriendFlow) {
                    sessionStorage.setItem(
                        INTRODUCE_FRIEND_AUTH_STATE_STORAGE_KEY,
                        "logged-in",
                    );
                }

                if (nextPathAfterLogin.startsWith("/auth/signup")) {
                    openSignupTermsModal(nextPathAfterLogin, true);
                    return;
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
        openSignupTermsModal,
        receiveIntroduceReturnTo,
        returnTo,
    ]);

    const handleKakaoLogin = () => {
        const kakaoRestApiKey = import.meta.env.VITE_KAKAO_REST_API_KEY;

        if (!kakaoRestApiKey) {
            setErrorMessage("카카오 로그인 설정이 없습니다.");
            return;
        }

        const state = createKakaoOAuthState();
        const redirectUri = getKakaoRedirectUri();
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

        if (returnTo) {
            sessionStorage.setItem(KAKAO_RETURN_TO_STORAGE_KEY, returnTo);
        } else {
            sessionStorage.removeItem(KAKAO_RETURN_TO_STORAGE_KEY);
        }

        setErrorMessage("");

        window.location.replace(`${KAKAO_AUTHORIZE_URL}?${authorizeParams.toString()}`);
    };

    const handleHeaderBack = () => {
        clearKakaoOAuthContext();
        navigate(
            receiveIntroduceReturnTo
                ? receiveIntroduceReturnTo
                : isIntroduceFriendFlow
                ? "/introduce-friend"
                : "/",
            { replace: true },
        );
    };

    const handleSkip = () => {
        sessionStorage.setItem(INTRODUCE_FRIEND_AUTH_STATE_STORAGE_KEY, "guest");
        navigate(nextPath);
    };

    const handleSignupBypass = () => {
        clearKakaoOAuthContext();
        setErrorMessage("");
        openSignupTermsModal(
            createPendingSignupPath(isIntroduceFriendFlow, returnTo),
            false,
        );
    };

    const handleAcceptSignupTerms = () => {
        if (!activePendingSignupTransition) {
            return;
        }

        if (activePendingSignupTransition.showKakaoLoginToast) {
            sessionStorage.setItem(KAKAO_LOGIN_TOAST_STORAGE_KEY, "true");
        }

        const nextSignupPath = activePendingSignupTransition.path;
        setPendingSignupTransition(null);
        navigate(nextSignupPath, {
            replace: true,
            state: { signupTermsAccepted: true },
        });
    };

    const handleOpenTerms = (path: string) => {
        if (!activePendingSignupTransition) {
            return;
        }

        navigate(path, {
            state: {
                fromAuthPath: currentAuthPath,
                pendingSignupPath: activePendingSignupTransition.path,
                showKakaoLoginToast: activePendingSignupTransition.showKakaoLoginToast,
            },
        });
    };

    return (
        <div
            className="flex min-h-screen flex-col overflow-hidden"
            style={{
                background: "linear-gradient(180deg, #FFF 13.73%, #FF6C9D 83.58%)",
            }}
        >
            <div className="shrink-0">
                <NotLoginHeader title={headerTitle} onBack={handleHeaderBack}></NotLoginHeader>
            </div>
            {isIntroduceFriendFlow ? (
                <>
                    <main className="flex min-h-0 flex-1 items-center justify-center px-5">
                        <div className="flex w-full max-w-[22.625rem] flex-col items-center">
                            <p className="text-center typo-title-header-1 leading-[1.55] text-grey-900">
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
                                className="h-[15.36rem] w-[15.36rem] object-contain"
                            />
                        </div>
                    </main>
                    <section className="shrink-0 px-5 pb-[2.94rem]">
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
                            {canBypassKakaoLogin ? (
                                <button
                                    type="button"
                                    onClick={handleSignupBypass}
                                    className="typo-comment-1 text-grey-100 underline underline-offset-[0.18rem]"
                                >
                                    회원가입 UI 확인하기
                                </button>
                            ) : null}
                            {errorMessage && (
                                <p className="typo-comment-2 text-warning">
                                    {errorMessage}
                                </p>
                            )}
                        </div>
                    </section>
                </>
            ) : (
                <>
                    <main className="flex min-h-0 flex-1 items-center justify-center px-5">
                        <div className="flex flex-col items-center">
                            <p className="whitespace-pre-line text-center typo-title-header-1 text-grey-900">
                                {"3초만에 로그인하고\n캠퍼스에서 기다리고 있는\n내 인연을 만나보세요"}
                            </p>
                            <img
                                src={loginImage}
                                alt=""
                                className="h-[15.36rem] w-[15.36rem] object-cover"
                            />
                        </div>
                    </main>
                    <section className="shrink-0 bg-primary-400 px-5 pt-[0.62rem] pb-[2.94rem]">
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
                        {canBypassKakaoLogin ? (
                            <button
                                type="button"
                                onClick={handleSignupBypass}
                                className="mx-auto mt-3 block typo-comment-1 text-grey-100 underline underline-offset-[0.18rem]"
                            >
                                회원가입 UI 확인하기
                            </button>
                        ) : null}
                        {errorMessage && (
                            <p className="mt-2 text-center typo-comment-2 text-warning">
                                {errorMessage}
                            </p>
                        )}
                    </section>
                </>
            )}
            {activePendingSignupTransition ? (
                <SignupTermsAgreementModal
                    onAccept={handleAcceptSignupTerms}
                    onOpenTerms={handleOpenTerms}
                />
            ) : null}
        </div>
    );
}

export default Kakao;
