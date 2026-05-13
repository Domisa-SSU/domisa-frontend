import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NotLoginHeader from "../../components/NotLoginHeader";
import Toast from "../../components/Toast";
import RightArrow from "../../assets/right_arrow.svg?react";
import {
    hasCompleteIntroductionAnswers,
    type IntroductionAnswers,
} from "../../constants/introductionQuestions";
import { createIntroductionLink } from "../../api/introduction";
import inviteCreatedIcon from "./assets/inviteCreatedIcon.svg";
import requireIcon from "./assets/requireIcon.png";
import {
    clearIntroduceFriendDraft,
    getIntroduceFriendDraft,
} from "../../utils/introduceFriendDraftStorage";

type IntroduceFriendDraft = IntroductionAnswers;

let pendingIntroductionLinkRequest:
    | {
        draftKey: string;
        promise: Promise<string>;
    }
    | null = null;

const createInvitationUrl = (draft: IntroduceFriendDraft) => {
    const draftKey = JSON.stringify(draft);

    if (pendingIntroductionLinkRequest?.draftKey === draftKey) {
        return pendingIntroductionLinkRequest.promise;
    }

    const promise = createIntroductionLink(draft)
        .then((response) => {
            const linkCode = encodeURIComponent(response.linkCode);

            return `${window.location.origin}/introduce/${linkCode}`;
        })
        .finally(() => {
            if (pendingIntroductionLinkRequest?.draftKey === draftKey) {
                pendingIntroductionLinkRequest = null;
            }
        });

    pendingIntroductionLinkRequest = {
        draftKey,
        promise,
    };

    return promise;
};

const minimumGeneratingDelayMs = 2000;

const wait = (delayMs: number) =>
    new Promise<void>((resolve) => {
        window.setTimeout(resolve, delayMs);
    });

function IntroduceFriendGeneratingPage() {
    const navigate = useNavigate();
    const [isResultVisible, setIsResultVisible] = useState(false);
    const [invitationUrl, setInvitationUrl] = useState("");
    const [toastMessage, setToastMessage] = useState("");

    useEffect(() => {
        let isMounted = true;
        const draft = getIntroduceFriendDraft();

        if (!hasCompleteIntroductionAnswers(draft)) {
            navigate("/error", { replace: true });
            return () => {
                isMounted = false;
            };
        }

        Promise.all([
            createInvitationUrl(draft),
            wait(minimumGeneratingDelayMs),
        ])
            .then(([nextInvitationUrl]) => {
                if (isMounted) {
                    setInvitationUrl(nextInvitationUrl);
                    setIsResultVisible(true);
                    clearIntroduceFriendDraft();
                }
            })
            .catch((error) => {
                console.error(error);
                if (isMounted) {
                    navigate("/error", { replace: true });
                }
            });

        return () => {
            isMounted = false;
        };
    }, [navigate]);

    useEffect(() => {
        if (!toastMessage) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setToastMessage("");
        }, 2000);

        return () => window.clearTimeout(timeoutId);
    }, [toastMessage]);

    const copyInvitationUrl = async (value: string) => {
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
    };

    const handleShare = async () => {
        if (!invitationUrl) {
            return;
        }

        if (navigator.share) {
            try {
                await navigator.share({
                    title: "도미사 친구 소개서",
                    text: "내 친구 소개서를 확인해줘",
                    url: invitationUrl,
                });
                return;
            } catch (error) {
                if (error instanceof DOMException && error.name === "AbortError") {
                    return;
                }
            }
        }

        await copyInvitationUrl(invitationUrl);

        setToastMessage("공유를 지원하지 않아 링크를 복사했어요");
    };

    if (isResultVisible) {
        return (
            <div className="relative min-h-screen bg-grey-100">
                <NotLoginHeader title="솔로인 내 친구 소개하기" />

                <main className="absolute inset-0 flex items-center px-5">
                    <div className="mx-auto flex w-full max-w-[22.5625rem] -translate-y-[2.125rem] flex-col items-center gap-[3.125rem]">
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
                                링크를 친구에게 공유해주세요
                            </p>
                        </div>

                        <div className="flex w-full flex-col gap-[3.125rem]">
                            <section className="flex flex-col gap-[0.875rem]">
                                <div className="flex h-10 items-center overflow-hidden rounded-[0.625rem] bg-grey-300 px-2.5 py-2">
                                    <p className="min-w-0 truncate typo-input-text-r text-grey-900">
                                        {invitationUrl}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleShare}
                                    className="flex h-10 items-center justify-center rounded-[0.625rem] bg-primary-500 px-2.5 py-2"
                                >
                                    <span className="typo-input-text text-grey-100">
                                        공유하기
                                    </span>
                                </button>
                            </section>
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

                {toastMessage && <Toast message={toastMessage} />}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-grey-100">
            <NotLoginHeader title="솔로인 내 친구 소개하기" />

            <main className="flex flex-col items-center px-5 pt-[6.5rem] pb-[13rem]">
                <div className="flex flex-col items-center gap-[0.375rem] text-center">
                    <p className="typo-comment-1 text-primary-500">따끈따끈하게</p>
                    <h1 className="typo-title-header-1 text-grey-900">
                        초대장 요리 중
                        <span
                            className="ml-0.5 inline-flex w-[1.1rem] animate-generating-dots justify-between"
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
        </div>
    );
}

export default IntroduceFriendGeneratingPage;
