import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NotLoginHeader from "../../components/NotLoginHeader";
import Toast from "../../components/Toast";
import {
    hasCompleteIntroductionAnswers,
    type IntroductionAnswers,
} from "../../constants/introductionQuestions";
import { createIntroductionLink } from "../../api/introduction";
import inviteCreatedIcon from "./assets/inviteCreatedIcon.svg";
import introduceInvitationCreated from "./assets/introduceInvitationCreated.png";
import inviteShareArrow from "./assets/inviteShareArrow.svg";
import requireIcon from "./assets/requireIcon.png";
import { track } from "../../utils/mixpanel";
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
            // 소개서가 실제로 만들어진 지점. 같은 초안은 위에서 걸러져 한 번만 발생한다.
            track("introduce_friend_created");

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
    // 공유를 끝내기 전에 홈으로 빠져나갈 길을 열어두면 링크를 보내지 않고 나가버린다.
    const [hasShared, setHasShared] = useState(false);

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
                    url: invitationUrl,
                });
                setHasShared(true);
                return;
            } catch (error) {
                // 공유 시트를 그냥 닫은 것이라 아직 보낸 게 아니다.
                if (error instanceof DOMException && error.name === "AbortError") {
                    return;
                }
            }
        }

        await copyInvitationUrl(invitationUrl);

        setHasShared(true);
        setToastMessage("공유를 지원하지 않아 링크를 복사했어요");
    };

    if (isResultVisible) {
        return (
            <div className="relative min-h-screen bg-grey-100">
                <NotLoginHeader
                    title="솔로인 내 친구 소개하기"
                    hideBackButton
                    titleClassName="text-grey-700"
                />

                <main className="absolute inset-0 flex items-center px-5">
                    <div className="mx-auto flex w-full max-w-[22.5625rem] -translate-y-[2.5625rem] flex-col items-center gap-[1.875rem]">
                        <div className="flex w-full flex-col items-center gap-2.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                                <h1 className="typo-subtitle-header-2 text-grey-900">
                                    초대장이 만들어졌어요
                                </h1>
                                <img
                                    src={inviteCreatedIcon}
                                    alt=""
                                    aria-hidden="true"
                                    className="h-5 w-5"
                                />
                            </div>
                            <p className="typo-title-header-1-b text-primary-600">
                                작성하신 소개서를 친구에게 보내주세요
                            </p>
                        </div>

                        <div className="relative h-[6.75rem] w-[10.8125rem] shrink-0 overflow-hidden">
                            <img
                                src={introduceInvitationCreated}
                                alt=""
                                aria-hidden="true"
                                className="absolute left-0 top-[-22.97%] h-[145.46%] w-[100.3%] max-w-none"
                            />
                        </div>

                        <section className="flex w-full flex-col gap-[0.875rem]">
                            <div className="flex h-[3.125rem] items-center overflow-hidden rounded-[0.875rem] bg-grey-300 px-2.5 py-2">
                                <p className="min-w-0 truncate typo-input-text-r text-grey-900">
                                    {invitationUrl}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleShare}
                                className="flex h-[3.125rem] items-center justify-center gap-2 rounded-[0.875rem] bg-primary-600 px-2.5 py-2"
                            >
                                <span className="text-[1.125rem] font-semibold leading-[1.125rem] tracking-[-0.0225rem] text-grey-300">
                                    솔로 친구에게 소개서 보내기
                                </span>
                                <img
                                    src={inviteShareArrow}
                                    alt=""
                                    aria-hidden="true"
                                    className="h-[0.8125rem] w-3 rotate-90"
                                />
                            </button>
                        </section>
                    </div>
                </main>

                {hasShared && (
                    <section className="fixed bottom-8 left-1/2 w-full frame-max-w -translate-x-1/2 text-center">
                        <button
                            type="button"
                            onClick={() => navigate("/")}
                            className="typo-button-text-b text-grey-700 underline underline-offset-0"
                        >
                            홈으로 갈래요
                        </button>
                    </section>
                )}

                {toastMessage && <Toast message={toastMessage} />}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-grey-100">
            <NotLoginHeader
                title="솔로인 내 친구 소개하기"
                hideBackButton
                titleClassName="text-grey-700"
            />

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
