import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import NotLoginHeader from "../../components/NotLoginHeader";
import Toast from "../../components/Toast";
import heartIcon from "../../assets/heartIcon.svg";
import copyIcon from "../SignupPage/asset/copyIcon.svg";
import eyeIcon from "../SignupPage/asset/eyeIcon.svg";
import requireIcon from "../SignupPage/asset/requireIcon.png";

function RequireIntroducePage() {
    const navigate = useNavigate();
    const [showCopyToast, setShowCopyToast] = useState(false);
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
        setShowCopyToast(true);
    };

    useEffect(() => {
        if (!showCopyToast) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setShowCopyToast(false);
        }, 2000);

        return () => window.clearTimeout(timeoutId);
    }, [showCopyToast]);

    return (
        <div className="relative min-h-screen overflow-hidden bg-grey-100">
            <NotLoginHeader title="친구 소개하기" />

            <main className="flex min-h-[calc(100vh-5.9rem)] flex-col items-center px-5 pt-[5.75rem] pb-[12.5rem]">
                <h1 className="typo-header-3 text-center text-grey-900">
                    앗! {" "}
                    <span className="text-primary-500">친구 소개서</span>가 필요해요!
                    <br />
                    친구에게 도미사를 공유한 뒤,
                    <br />
                    소개서를 부탁해보세요
                </h1>

                <img
                    src={requireIcon}
                    alt=""
                    aria-hidden="true"
                    className="mt-[2.5rem] h-[15.36rem] w-[15.36rem] object-contain"
                />
            </main>

            <section className="fixed inset-x-0 bottom-0 bg-grey-100 px-5 pt-2.5 pb-[2.5rem]">
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
                        <button
                            type="button"
                            onClick={handleCopyLink}
                            className="flex h-[2.125rem] shrink-0 items-center gap-1 rounded-[1.25rem] bg-grey-100 px-3.5 py-2"
                        >
                            <img src={copyIcon} alt="" aria-hidden="true" className="h-3 w-3" />
                            <span className="typo-comment-2 text-primary-500">링크 복사</span>
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="flex h-[3.125rem] w-full items-center justify-center rounded-[0.875rem] bg-primary-500 px-2.5 py-2.5 typo-button-text-b text-grey-100"
                    >
                        홈으로
                    </button>
                </div>
            </section>

            {showCopyToast && <Toast message="복사되었습니다" />}
        </div>
    );
}

export default RequireIntroducePage;
