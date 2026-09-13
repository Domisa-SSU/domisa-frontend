import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    useCheckNicknameMutation,
    useRandomNicknameMutation,
} from "../../../queries/users";
import { NICKNAME_MAX_LENGTH } from "../../../utils/randomNickname";
import Toast from "../../../components/Toast";
import { useSignupFlow } from "../useSignupFlow";
import { track } from "../../../utils/mixpanel";
import forbiddenIcon from "../asset/forbiddenIcon.svg";
import pinkCheckIcon from "../asset/pinkCheckIcon.svg";
import selectArrow from "../asset/selectArrow.svg";
import sparkleIcon from "../asset/sparkleIcon.svg";

const birthYears = Array.from({ length: 28 }, (_, index) => `${2007 - index}`);
const NICKNAME_ALLOWED_CHARACTERS = /[^A-Za-z0-9가-힣]/g;

export function SignupStepBasic() {
    const { formData, updateFormData, goNextStep } = useSignupFlow();
    const [nicknameErrorMessage, setNicknameErrorMessage] = useState("");
    const [toastMessage, setToastMessage] = useState("");
    const hasRequestedInitialRandomNickname = useRef(false);
    const randomNicknameRequestId = useRef(0);
    const isNicknameComposing = useRef(false);
    const {
        mutateAsync: checkNicknameAvailability,
        isPending: isCheckingNickname,
    } = useCheckNicknameMutation();
    const {
        mutateAsync: getRandomNickname,
        isPending: isGeneratingRandomNickname,
    } = useRandomNicknameMutation();

    useEffect(() => {
        if (!toastMessage) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setToastMessage("");
        }, 2000);

        return () => window.clearTimeout(timeoutId);
    }, [toastMessage]);

    const isFormValid = useMemo(() => {
        return (
            formData.nickname.trim().length > 0 &&
            formData.isNicknameChecked &&
            formData.gender.length > 0 &&
            formData.birthYear.length > 0
        );
    }, [
        formData.birthYear,
        formData.gender,
        formData.isNicknameChecked,
        formData.nickname,
    ]);

    const handleNicknameChange = (value: string) => {
        randomNicknameRequestId.current += 1;
        const normalizedNickname = value.replace(NICKNAME_ALLOWED_CHARACTERS, "");
        const nickname = normalizedNickname.slice(0, NICKNAME_MAX_LENGTH);

        updateFormData({
            nickname,
            isNicknameChecked: false,
            isNicknameRandom: false,
        });
        setNicknameErrorMessage(
            value !== normalizedNickname
                ? "공백 및 특수문자 없이 한글, 영문, 숫자만 사용할 수 있어요"
                : "",
        );
    };

    const handleNicknameInputChange = (value: string) => {
        if (isNicknameComposing.current) {
            randomNicknameRequestId.current += 1;
            updateFormData({
                nickname: value,
                isNicknameChecked: false,
            });
            setNicknameErrorMessage("");
            return;
        }

        handleNicknameChange(value);
    };

    const handleCheckNickname = async (nicknameToCheck?: string) => {
        const targetNickname = (nicknameToCheck ?? formData.nickname).trim();

        if (targetNickname.length === 0) {
            updateFormData({ isNicknameChecked: false });
            setNicknameErrorMessage("닉네임을 입력해주세요");
            return;
        }

        try {
            const { isAvailable } = await checkNicknameAvailability(targetNickname);

            updateFormData({ isNicknameChecked: isAvailable });
            setNicknameErrorMessage(
                isAvailable ? "" : "이미 사용 중인 닉네임입니다",
            );
        } catch (error) {
            console.error(error);
            updateFormData({ isNicknameChecked: false });
            setNicknameErrorMessage("닉네임 확인에 실패했어요. 다시 시도해주세요");
        }
    };

    const requestRandomNickname = useCallback(async () => {
        const requestId = randomNicknameRequestId.current + 1;
        randomNicknameRequestId.current = requestId;

        try {
            const randomNickname = await getRandomNickname();

            if (requestId !== randomNicknameRequestId.current) {
                return;
            }

            const { isAvailable } = await checkNicknameAvailability(randomNickname);

            if (requestId !== randomNicknameRequestId.current) {
                return;
            }

            updateFormData({
                nickname: randomNickname,
                isNicknameChecked: isAvailable,
                isNicknameRandom: true,
            });
            setNicknameErrorMessage(
                isAvailable ? "" : "이미 사용 중인 닉네임입니다",
            );
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error("[Signup random nickname error]", error);
            }

            if (requestId === randomNicknameRequestId.current) {
                setToastMessage("닉네임을 불러오지 못했어요. 다시 시도해주세요.");
            }
        }
    }, [checkNicknameAvailability, getRandomNickname, updateFormData]);

    useEffect(() => {
        if (formData.nickname || hasRequestedInitialRandomNickname.current) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            if (hasRequestedInitialRandomNickname.current) {
                return;
            }

            hasRequestedInitialRandomNickname.current = true;
            void requestRandomNickname();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [formData.nickname, requestRandomNickname]);

    return (
        <div className="flex flex-col gap-[20px]">
            {toastMessage ? <Toast message={toastMessage} /> : null}
            {/* 닉네임 섹션 */}
            <section className="flex flex-col gap-[14px]">
                <div className="flex items-center gap-[10px]">
                    <h2 className="text-[19px] font-semibold leading-[19px] tracking-[-0.38px] text-grey-900">
                        닉네임
                    </h2>
                    <p className="text-[13px] font-semibold leading-[14px] text-primary-300">
                        * 닉네임은 8자까지만 작성이 가능해요
                    </p>
                </div>

                <div className="flex flex-col gap-[10px]">
                    <div
                        className={`relative flex h-[44px] w-full items-center rounded-[10px] bg-primary-100 px-[10px] border-[1.2px] transition-colors ${
                            nicknameErrorMessage
                                ? "border-warning"
                                : "border-transparent"
                        }`}
                    >
                        <input
                            value={formData.nickname}
                            maxLength={NICKNAME_MAX_LENGTH}
                            spellCheck={false}
                            autoCorrect="off"
                            autoCapitalize="none"
                            onChange={(event) => handleNicknameInputChange(event.target.value)}
                            onCompositionStart={() => {
                                isNicknameComposing.current = true;
                            }}
                            onCompositionEnd={(event) => {
                                isNicknameComposing.current = false;
                                handleNicknameChange(event.currentTarget.value);
                            }}
                            placeholder="난최고야"
                            className="h-full w-full bg-transparent pr-[4.75rem] text-[16px] font-medium tracking-[-0.32px] text-primary-500 placeholder:text-grey-600 focus:outline-none"
                        />
                        <button
                            type="button"
                            disabled={isCheckingNickname}
                            onClick={() => handleCheckNickname()}
                            className="absolute right-[5px] top-1/2 -translate-y-1/2 flex items-center justify-center rounded-[12px] border-[0.88px] border-primary-200 bg-white px-[17.6px] py-[8.8px] transition-colors hover:bg-primary-100/40 disabled:opacity-50"
                        >
                            <span className="text-[14px] font-semibold leading-[15.4px] text-primary-300">
                                {isCheckingNickname ? "확인 중" : "확인"}
                            </span>
                        </button>
                    </div>

                    {/* 피드백 메시지 */}
                    {nicknameErrorMessage ? (
                        <div className="flex items-center gap-[2px]">
                            <span className="text-[12px] font-semibold leading-[14px] text-warning">
                                {nicknameErrorMessage}
                            </span>
                            <img
                                src={forbiddenIcon}
                                alt=""
                                className="size-[11px]"
                            />
                        </div>
                    ) : formData.isNicknameChecked ? (
                        <div className="flex items-center gap-[2px]">
                            <span className="text-[12px] font-semibold leading-[14px] text-primary-300">
                                사용 가능한 닉네임입니다
                            </span>
                            <img
                                src={pinkCheckIcon}
                                alt=""
                                className="size-[11px]"
                            />
                        </div>
                    ) : null}

                    {/* 닉네임 자동 생성 버튼 */}
                    <button
                        type="button"
                        onClick={() => {
                            /**
                             * 함수 안이 아니라 여기서 남긴다.
                             * requestRandomNickname 은 화면에 들어올 때 자동으로도 불리므로,
                             * 함수 안에 두면 사용자가 누른 것과 자동 생성이 섞인다.
                             */
                            track("nickname_regenerated");
                            void requestRandomNickname();
                        }}
                        disabled={isCheckingNickname || isGeneratingRandomNickname}
                        className="flex h-[40px] w-[140px] items-center justify-center gap-[6px] rounded-[10px] border border-primary-200 bg-white pl-[10px] pr-[8px] transition-colors hover:bg-primary-100/50 disabled:opacity-50"
                    >
                        <img src={sparkleIcon} alt="" className="size-[16px]" />
                        <span className="text-[14px] font-semibold leading-[17px] text-primary-400 whitespace-nowrap">
                            {isGeneratingRandomNickname ? "생성 중" : "닉네임 자동 생성"}
                        </span>
                    </button>
                </div>
            </section>

            {/* 성별 섹션 */}
            <section className="flex flex-col gap-[14px]">
                <h2 className="text-[19px] font-semibold leading-[19px] tracking-[-0.38px] text-grey-900">
                    성별
                </h2>
                <div className="flex gap-[5px]">
                    {(["남성", "여성"] as const).map((option) => {
                        const isSelected = formData.gender === option;

                        return (
                            <button
                                key={option}
                                type="button"
                                onClick={() => updateFormData({ gender: option })}
                                className={`flex h-[44px] flex-1 items-center justify-center rounded-[10px] text-[16px] font-medium tracking-[-0.32px] transition-colors ${
                                    isSelected
                                        ? "bg-primary-500 text-grey-100"
                                        : "bg-primary-100 text-grey-600 hover:bg-primary-200/50"
                                }`}
                            >
                                {option}
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* 출생 연도 섹션 */}
            <section className="flex flex-col gap-[10px]">
                <h2 className="text-[19px] font-semibold leading-[19px] tracking-[-0.38px] text-grey-900">
                    출생 연도
                </h2>
                <div className="relative h-[44px] w-[174px] rounded-[10px] bg-primary-100">
                    <select
                        value={formData.birthYear}
                        onChange={(event) => updateFormData({ birthYear: event.target.value })}
                        className={`h-full w-full appearance-none rounded-[10px] bg-transparent px-[10px] py-[8px] pr-8 text-[16px] font-medium tracking-[-0.32px] focus:outline-none ${
                            formData.birthYear ? "text-primary-500" : "text-grey-600"
                        }`}
                    >
                        <option value="">출생 연도</option>
                        {birthYears.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                    <img
                        src={selectArrow}
                        alt=""
                        className="pointer-events-none absolute right-[10px] top-1/2 -translate-y-1/2 h-[5px] w-[10px]"
                    />
                </div>
            </section>

            {/* 하단 완료 액션 */}
            <div className="fixed bottom-0 left-1/2 w-full frame-max-w -translate-x-1/2 z-20 bg-grey-100 px-5 pt-2.5 pb-[2.75rem]">
                <div className="mx-auto w-full max-w-[363px]">
                    <button
                        type="button"
                        disabled={!isFormValid}
                        onClick={goNextStep}
                        className={`flex h-[50px] w-full items-center justify-center rounded-[14px] text-[16px] font-bold leading-[19px] transition-colors ${
                            isFormValid
                                ? "bg-primary-500 text-grey-100 hover:bg-primary-600"
                                : "cursor-not-allowed bg-[#eaeaea] text-grey-100"
                        }`}
                    >
                        다음
                    </button>
                </div>
            </div>
        </div>
    );
}
