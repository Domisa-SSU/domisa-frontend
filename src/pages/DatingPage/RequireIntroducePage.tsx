import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import NotLoginHeader from "../../components/NotLoginHeader";
import Toast from "../../components/Toast";
import heartIcon from "../../assets/heartIcon.svg";
import eyeIcon from "../SignupPage/asset/eyeIcon.svg";
import introduceRequestOtter from "./assets/introduceRequestOtter.png";

function RequireIntroducePage() {
    const navigate = useNavigate();
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [hasShared, setHasShared] = useState(false);
    const introduceFriendUrl = useMemo(
        () => `${window.location.origin}/introduce-friend`,
        [],
    );

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(introduceFriendUrl);
        } catch {
            const textarea = document.createElement("textarea");
            textarea.value = introduceFriendUrl;
            textarea.style.position = "fixed";
            textarea.style.opacity = "0";
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
        }
        setToastMessage("공유를 지원하지 않아 링크를 복사했어요");
    };

    const handleShare = async () => {
        setHasShared(true);

        if (typeof navigator !== "undefined" && navigator.share) {
            try {
                await navigator.share({
                    title: "도미사 친구 소개서",
                    text: "내 친구 소개서를 확인해줘",
                    url: introduceFriendUrl,
                });
                return;
            } catch (error) {
                if (error instanceof DOMException && error.name === "AbortError") {
                    return;
                }
            }
        }
        await handleCopyLink();
    };

    useEffect(() => {
        if (!toastMessage) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setToastMessage(null);
        }, 2000);

        return () => window.clearTimeout(timeoutId);
    }, [toastMessage]);

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-grey-100">
            <NotLoginHeader title="소개서 요청" onBack={() => navigate("/")} />

            <main className="flex min-h-[calc(100vh-5.9rem)] flex-col items-center px-5 pt-8 pb-[14.5rem]">
                <h1 className="text-center font-semibold text-[1.125rem] leading-[1.75rem] text-grey-900">
                    도미사럽은{" "}
                    <span className="text-[#ff3d7e]">친구가 써주는 소개서</span>가 필수예요!
                    <br />
                    친구에게 링크를 공유한 뒤,
                    <br />
                    <span className="text-[#ff3d7e]">내 소개서 작성</span>을 부탁해보세요!
                </h1>

                <img
                    src={introduceRequestOtter}
                    alt=""
                    aria-hidden="true"
                    className="mt-6 h-[17.5rem] w-[17.5rem] object-contain"
                />
            </main>

            <section className="fixed bottom-0 left-1/2 w-full frame-max-w -translate-x-1/2 bg-grey-100 px-5 pt-2.5 pb-[2.5rem]">
                <div className="mx-auto flex w-full max-w-[22.625rem] flex-col items-center gap-2.5">
                    <div className="flex items-center justify-center gap-2.5">
                        <span className="typo-button-text text-primary-500">↓</span>
                        <div className="flex items-center gap-0.5">
                            <img src={heartIcon} alt="" aria-hidden="true" className="h-4 w-4" />
                            <span className="typo-button-text text-primary-500">링크</span>
                            <img src={eyeIcon} alt="" aria-hidden="true" className="h-4 w-4" />
                        </div>
                        <span className="typo-button-text text-primary-500">↓</span>
                    </div>

                    <div className="flex h-[3.125rem] w-full items-center justify-between gap-2 overflow-hidden rounded-[0.625rem] bg-grey-300 px-2.5 py-2">
                        <p className="min-w-0 flex-1 truncate typo-input-text-r text-grey-900">
                            {introduceFriendUrl}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleShare}
                        className="flex h-[3.125rem] w-full items-center justify-center rounded-[0.875rem] bg-primary-500 px-2.5 py-2.5 typo-button-text-b text-grey-100 active:opacity-90"
                    >
                        공유하기
                    </button>

                    {hasShared && (
                        <button
                            type="button"
                            onClick={() => navigate("/")}
                            className="typo-button-text-b text-grey-600 underline py-1 active:opacity-75"
                        >
                            홈으로 가기
                        </button>
                    )}
                </div>
            </section>

            {toastMessage && <Toast message={toastMessage} />}
        </div>
    );
}

export default RequireIntroducePage;

