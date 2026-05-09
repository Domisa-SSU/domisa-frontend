import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import BottomActionBar from "../../components/BottomActionBar";
import Toast from "../../components/Toast";
import { KAKAO_LOGIN_TOAST_STORAGE_KEY } from "../../constants/storageKeys";
import NotLoginHeader from "../../components/NotLoginHeader";
import { useCheckNicknameMutation } from "../../queries/users";
import { useSignupFlow } from "./useSignupFlow";
import forbiddenIcon from "./asset/forbiddenIcon.svg";
import pinkCheckIcon from "./asset/pinkCheckIcon.svg";
import selectArrow from "./asset/selectArrow.svg";

const birthYears = Array.from({ length: 10 }, (_, index) => `${2007 - index}`);

const fieldClassName =
    "h-10 w-full rounded-[0.625rem] border-[1.2px] border-transparent bg-primary-100 px-[0.875rem] typo-input-text-m text-primary-500 placeholder:text-grey-600 focus:outline-none";
const selectClassName =
    "h-10 w-full appearance-none rounded-[0.625rem] bg-primary-100 px-[0.875rem] pr-9 typo-input-text-m focus:outline-none";

function SignupPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { signupFormData, setSignupFormData } = useSignupFlow();
    const [nickname, setNickname] = useState(signupFormData.nickname);
    const [isNicknameChecked, setIsNicknameChecked] = useState(
        signupFormData.nickname.trim().length > 0,
    );
    const [nicknameErrorMessage, setNicknameErrorMessage] = useState("");
    const [gender, setGender] = useState(signupFormData.gender);
    const [birthYear, setBirthYear] = useState(signupFormData.birthYear);
    const {
        mutateAsync: checkNicknameAvailability,
        isPending: isCheckingNickname,
    } = useCheckNicknameMutation();
    const [showKakaoLoginToast, setShowKakaoLoginToast] = useState(() => {
        const shouldShowToast =
            sessionStorage.getItem(KAKAO_LOGIN_TOAST_STORAGE_KEY) === "true";

        if (shouldShowToast) {
            sessionStorage.removeItem(KAKAO_LOGIN_TOAST_STORAGE_KEY);
        }

        return shouldShowToast;
    });

    const isFormValid = useMemo(() => {
        return (
            nickname.trim().length > 0 &&
            isNicknameChecked &&
            gender.length > 0 &&
            birthYear.length > 0
        );
    }, [
        birthYear,
        gender,
        isNicknameChecked,
        nickname,
    ]);

    const handleLimitedChange = (
        value: string,
        limit: number,
        setter: (nextValue: string) => void,
    ) => {
        if (value.length <= limit) {
            setter(value);
        }
    };

    const handleCheckNickname = async () => {
        const trimmedNickname = nickname.trim();

        if (trimmedNickname.length === 0) {
            setIsNicknameChecked(false);
            setNicknameErrorMessage("닉네임을 입력해주세요");
            return;
        }

        try {
            const { isAvailable } = await checkNicknameAvailability(trimmedNickname);

            setIsNicknameChecked(isAvailable);
            setNicknameErrorMessage(
                isAvailable ? "" : "이미 사용 중인 닉네임입니다",
            );
        } catch (error) {
            console.error(error);
            setIsNicknameChecked(false);
            setNicknameErrorMessage("닉네임 확인에 실패했어요. 다시 시도해주세요");
        }
    };

    const handleNext = () => {
        setSignupFormData({
            nickname,
            gender,
            birthYear,
        });

        const nextSearch = searchParams.toString();
        navigate(`/auth/signup/next${nextSearch ? `?${nextSearch}` : ""}`);
    };

    useEffect(() => {
        if (!showKakaoLoginToast) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setShowKakaoLoginToast(false);
        }, 2000);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [showKakaoLoginToast]);

    return (
        <div className="min-h-screen bg-grey-100">
            {showKakaoLoginToast ? <Toast message="카카오 로그인 완료!" /> : null}
            <NotLoginHeader title="회원가입"></NotLoginHeader>
            <div className="px-5 pt-6 pb-[7.5625rem]">
                <div className="mx-auto flex w-full max-w-[22.6875rem] flex-col gap-5">
                    <section className="flex flex-col gap-[0.875rem]">
                        <div className="flex items-center gap-2.5">
                            <h2 className="typo-comment-1 text-grey-900">닉네임</h2>
                            <p className="typo-comment-2 text-primary-300">
                                * 닉네임은 4자까지만 작성이 가능해요
                            </p>
                        </div>
                        <div className="flex flex-col gap-[0.31rem]">
                            <div className="relative">
                                <input
                                    value={nickname}
                                    maxLength={4}
                                    onChange={(event) => {
                                        handleLimitedChange(event.target.value, 4, setNickname);
                                        setIsNicknameChecked(false);
                                        setNicknameErrorMessage("");
                                    }}
                                    className={`${fieldClassName} pr-[5.5rem] ${
                                        nicknameErrorMessage
                                            ? "border-[1.2px] border-warning"
                                            : ""
                                    }`}
                                    placeholder="닉네임을 입력하세요"
                                />
                                <button
                                    type="button"
                                    disabled={isCheckingNickname}
                                    onClick={handleCheckNickname}
                                    className="absolute right-[0.31rem] top-1/2 flex -translate-y-1/2 items-center justify-center rounded-[0.625rem] border-[0.8px] border-primary-200 bg-grey-100 px-4 py-2"
                                >
                                    <span className="typo-comment-2 text-primary-300">
                                        {isCheckingNickname ? "확인 중" : "확인"}
                                    </span>
                                </button>
                            </div>
                            <div className="min-h-[0.875rem]">
                                {nicknameErrorMessage ? (
                                    <div className="flex items-center gap-[0.125rem]">
                                        <span className="typo-comment-2 text-warning">
                                            {nicknameErrorMessage}
                                        </span>
                                        <img
                                            src={forbiddenIcon}
                                            alt=""
                                            className="h-[0.6875rem] w-[0.6875rem]"
                                        />
                                    </div>
                                ) : isNicknameChecked ? (
                                    <div className="flex items-center gap-[0.125rem]">
                                        <span className="typo-comment-2 text-primary-300">
                                            사용 가능한 닉네임입니다
                                        </span>
                                        <img
                                            src={pinkCheckIcon}
                                            alt=""
                                            className="h-[0.6875rem] w-[0.6875rem]"
                                        />
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </section>

                    <section className="flex flex-col gap-[0.875rem]">
                        <h2 className="typo-comment-1 text-grey-900">성별</h2>
                        <div className="flex gap-[0.3125rem]">
                            {["남성", "여성"].map((option) => {
                                const isSelected = gender === option;

                                return (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() => setGender(option)}
                                        className={`flex h-10 flex-1 items-center justify-center rounded-[0.625rem] px-2.5 typo-input-text-m ${
                                            isSelected
                                                ? "bg-primary-500 text-grey-100"
                                                : "bg-primary-100 text-grey-600"
                                        }`}
                                    >
                                        {option}
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    <section className="flex flex-col gap-2.5">
                        <h2 className="typo-comment-1 text-grey-900">출생 연도</h2>
                        <div className="relative w-[10.875rem]">
                            <select
                                value={birthYear}
                                onChange={(event) => setBirthYear(event.target.value)}
                                className={`${selectClassName} typo-input-text ${
                                    birthYear ? "text-primary-500" : "text-grey-600"
                                }`}
                            >
                                <option value="">출생 연도</option>
                                {birthYears.map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                            <span className="pointer-events-none absolute right-[0.875rem] top-1/2 -translate-y-1/2 text-grey-600">
                                <img src={selectArrow} alt="" className="h-[0.3125rem] w-[0.625rem]" />
                            </span>
                        </div>
                    </section>
                </div>
            </div>

            <BottomActionBar
                label="다음"
                disabled={!isFormValid}
                onClick={handleNext}
            />
        </div>
    );
}

export default SignupPage;
