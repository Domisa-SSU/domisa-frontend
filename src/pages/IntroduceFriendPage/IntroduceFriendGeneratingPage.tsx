import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomActionBar from "../../components/BottomActionBar";
import NotLoginHeader from "../../components/NotLoginHeader";
import Toast from "../../components/Toast";
import RightArrow from "../../assets/right_arrow.svg?react";
import {
    INTRODUCE_FRIEND_AUTH_STATE_STORAGE_KEY,
    INTRODUCE_FRIEND_DRAFT_STORAGE_KEY,
} from "../../constants/storageKeys";
import copyIcon from "../SignupPage/asset/copyIcon.svg";
import inviteCreatedIcon from "./assets/inviteCreatedIcon.svg";
import requireIcon from "./assets/requireIcon.png";

type IntroduceFriendDraft = {
    shortIntro: string;
    charmPoint: string;
    funnyEpisode: string;
};

type CreateInvitationResponse = {
    invitationCode: string;
    referralCode: string;
};

const MOCK_INVITATION_URL_BASE = "http://example.com/blind-date";

const requestCreateInvitation = (draft: IntroduceFriendDraft | null) => {
    return new Promise<CreateInvitationResponse>((resolve) => {
        window.setTimeout(() => {
            console.log("[mock] create introduce friend invitation", draft);
            resolve({
                invitationCode: "12345",
                referralCode: "2837198",
            });
        }, 1200);
    });
};

const getIntroduceFriendDraft = () => {
    const savedDraft = sessionStorage.getItem(INTRODUCE_FRIEND_DRAFT_STORAGE_KEY);

    if (!savedDraft) {
        return null;
    }

    try {
        return JSON.parse(savedDraft) as IntroduceFriendDraft;
    } catch {
        return null;
    }
};

const getIntroduceFriendAuthState = () => {
    return sessionStorage.getItem(INTRODUCE_FRIEND_AUTH_STATE_STORAGE_KEY) === "logged-in";
};

function IntroduceFriendGeneratingPage() {
    const navigate = useNavigate();
    const [isInvitationReady, setIsInvitationReady] = useState(false);
    const [isResultVisible, setIsResultVisible] = useState(false);
    const [invitationUrl, setInvitationUrl] = useState("");
    const [referralCode, setReferralCode] = useState("");
    const [isLoggedIn] = useState(getIntroduceFriendAuthState);
    const [showCopyToast, setShowCopyToast] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const draft = getIntroduceFriendDraft();

        requestCreateInvitation(draft).then((response) => {
            if (isMounted) {
                setInvitationUrl(`${MOCK_INVITATION_URL_BASE}/${response.invitationCode}`);
                setReferralCode(response.referralCode);
                setIsInvitationReady(true);
            }
        });

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (!showCopyToast) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setShowCopyToast(false);
        }, 2000);

        return () => window.clearTimeout(timeoutId);
    }, [showCopyToast]);

    const handleNext = () => {
        if (isInvitationReady) {
            setIsResultVisible(true);
        }
    };

    const handleCopy = async (value: string) => {
        try {
            await navigator.clipboard.writeText(value);
        } catch {
            const textarea = document.createElement("textarea");
            textarea.value = value;
            textarea.style.position = "fixed";
            textarea.style.opacity = "0";
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
        }

        setShowCopyToast(true);
    };

    if (isResultVisible) {
        return (
            <div className="relative min-h-screen bg-grey-100">
                <NotLoginHeader title="친구 소개하기" />

                <main
                    className={`px-5 ${
                        isLoggedIn
                            ? "pt-[clamp(3rem,10vh,5.75rem)] pb-[12rem]"
                            : "pt-[clamp(3rem,10vh,5.75rem)] pb-[9.5rem]"
                    }`}
                >
                    <div className="mx-auto flex w-full max-w-[22.5625rem] flex-col items-center gap-[clamp(2rem,6vh,3.125rem)]">
                        <div className="flex w-full flex-col items-center gap-[0.375rem] text-center">
                            <div className="flex items-center justify-center gap-1">
                                <h1 className="typo-title-header-1 text-grey-900">
                                    초대장이 만들어졌어요
                                </h1>
                                <img
                                    src={inviteCreatedIcon}
                                    alt=""
                                    aria-hidden="true"
                                    className="h-5 w-5"
                                />
                            </div>
                            <p className="typo-input-text text-primary-500">
                                아래 링크를 복사하여 친구에게 공유해주세요
                            </p>
                        </div>

                        <div className="flex w-full flex-col gap-[clamp(2rem,6vh,3.125rem)]">
                            <section className="flex flex-col gap-[0.875rem]">
                                <div className="flex h-10 items-center overflow-hidden rounded-[0.625rem] bg-grey-300 px-2.5 py-2">
                                    <p className="min-w-0 truncate typo-input-text-r text-grey-900">
                                        {invitationUrl}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleCopy(invitationUrl)}
                                    className="flex h-10 items-center justify-center gap-1.5 rounded-[0.625rem] bg-primary-100 px-2.5 py-2"
                                >
                                    <img
                                        src={copyIcon}
                                        alt=""
                                        aria-hidden="true"
                                        className="h-3.5 w-[0.8125rem]"
                                    />
                                    <span className="typo-input-text text-primary-500">
                                        복사하기
                                    </span>
                                </button>
                            </section>

                            {isLoggedIn && (
                                <section className="flex flex-col gap-[0.875rem]">
                                    <div className="flex flex-col gap-[0.3125rem]">
                                        <h2 className="text-[1rem] font-semibold leading-7 text-grey-900 opacity-50">
                                            추천인 코드
                                        </h2>
                                        <p className="typo-comment-2 text-primary-300">
                                            * 친구가 추천인 코드를 입력하면 쿠키 20개를 받아요
                                        </p>
                                    </div>
                                    <div className="flex h-10 items-center overflow-hidden rounded-[0.625rem] bg-grey-300 px-2.5 py-2">
                                        <p className="min-w-0 truncate typo-input-text-r text-grey-900">
                                            {referralCode}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(referralCode)}
                                        className="flex h-10 items-center justify-center gap-1.5 rounded-[0.625rem] bg-primary-100 px-2.5 py-2"
                                    >
                                        <img
                                            src={copyIcon}
                                            alt=""
                                            aria-hidden="true"
                                            className="h-3.5 w-[0.8125rem]"
                                        />
                                        <span className="typo-input-text text-primary-500">
                                            복사하기
                                        </span>
                                    </button>
                                </section>
                            )}
                        </div>
                    </div>
                </main>

                <section className="fixed inset-x-0 bottom-0 bg-grey-100 px-5 pt-[0.62rem] pb-[2.94rem]">
                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="mx-auto flex h-[3.125rem] w-full max-w-[22.625rem] items-center justify-center gap-2.5 rounded-[0.875rem] bg-primary-500 px-2.5 py-2.5 typo-button-text-b text-grey-100"
                    >
                        <span>홈으로</span>
                        <RightArrow className="h-3 w-[0.8125rem] text-grey-100" />
                    </button>
                </section>

                {showCopyToast && <Toast message="복사되었습니다" />}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-grey-100">
            <NotLoginHeader title="친구 소개하기" />

            <main className="flex flex-col items-center px-5 pt-[6.5rem] pb-[13rem]">
                <div className="flex flex-col items-center gap-[0.375rem] text-center">
                    <p className="typo-comment-1 text-primary-500">따끈따끈하게</p>
                    <h1 className="typo-title-header-1 text-grey-900">
                        초대장 요리 중
                        <span
                            className={`ml-0.5 inline-flex w-[1.1rem] justify-between ${
                                isInvitationReady ? "" : "animate-generating-dots"
                            }`}
                            aria-hidden="true"
                        >
                            <span>.</span>
                            <span>.</span>
                            <span>.</span>
                        </span>
                        <span className="sr-only">...</span>
                    </h1>
                </div>

                <img
                    src={requireIcon}
                    alt=""
                    aria-hidden="true"
                    className="mt-8 h-[15.36rem] w-[15.36rem] object-contain"
                />
            </main>

            <BottomActionBar
                label="다음"
                disabled={!isInvitationReady}
                onClick={handleNext}
            />
        </div>
    );
}

export default IntroduceFriendGeneratingPage;
