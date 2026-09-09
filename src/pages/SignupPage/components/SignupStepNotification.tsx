import { type ChangeEvent } from "react";
import smileIcon from "../../DatingPage/assets/smileIcon.svg";
import { useSignupFlow } from "../useSignupFlow";

const NOTIFICATION_PHONE_MAX_LENGTH = 11;

const formatPhoneNumber = (phoneNumber: string) => {
    const digitsOnly = phoneNumber.replace(/[^0-9]/g, "").slice(0, NOTIFICATION_PHONE_MAX_LENGTH);

    if (digitsOnly.length <= 3) {
        return digitsOnly;
    }

    if (digitsOnly.length <= 7) {
        return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3)}`;
    }

    return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 7)}-${digitsOnly.slice(7)}`;
};

type SignupStepNotificationProps = {
    isSubmitting: boolean;
    errorMessage: string;
    onSubmit: () => void;
};

export function SignupStepNotification({
    isSubmitting,
    errorMessage,
    onSubmit,
}: SignupStepNotificationProps) {
    const { formData, updateFormData } = useSignupFlow();

    const digitsOnly = formData.notificationPhone.replace(/[^0-9]/g, "");
    const isPhoneComplete =
        digitsOnly.length >= 10 || formData.isSmsOptedOut;

    const handlePhoneChange = (event: ChangeEvent<HTMLInputElement>) => {
        const rawDigits = event.target.value
            .replace(/[^0-9]/g, "")
            .slice(0, NOTIFICATION_PHONE_MAX_LENGTH);
        updateFormData({ notificationPhone: rawDigits });
    };

    const handleToggleOptOut = () => {
        updateFormData({ isSmsOptedOut: !formData.isSmsOptedOut });
    };

    return (
        <div className="flex flex-col gap-[1.875rem] pb-[7rem]">
            <div className="flex flex-col gap-3.5">
                <h1 className="typo-title-header-1 text-grey-900">
                    새로운 호감이나 매칭이 이루어졌을 때
                    <br />
                    문자로 알려드릴게요
                </h1>
                <div className="flex items-center gap-1">
                    <p className="typo-input-text-m text-grey-700">
                        매일 낮 12시와 18시에 문자로 알려드려요
                    </p>
                    <img src={smileIcon} alt="" className="h-3.5 w-3.5" />
                </div>
            </div>

            <label className="flex flex-col gap-2.5">
                <span
                    className={`typo-comment-2 ${
                        formData.isSmsOptedOut ? "text-grey-400" : "text-primary-600"
                    }`}
                >
                    전화번호
                </span>
                <input
                    value={formatPhoneNumber(formData.notificationPhone)}
                    onChange={handlePhoneChange}
                    disabled={formData.isSmsOptedOut}
                    inputMode="numeric"
                    maxLength={13}
                    placeholder="전화번호를 입력하세요"
                    className={`h-9 border-b-[1.8px] bg-transparent typo-header-3 focus:outline-none transition-colors ${
                        formData.isSmsOptedOut
                            ? "border-grey-400 text-grey-400 placeholder:text-grey-400"
                            : "border-primary-500 text-primary-500 placeholder:text-grey-600"
                    }`}
                />
            </label>

            <button
                type="button"
                aria-pressed={formData.isSmsOptedOut}
                onClick={handleToggleOptOut}
                className="flex items-center gap-2.5 self-start"
            >
                <span
                    className={`flex h-[1.5625rem] w-[1.5625rem] items-center justify-center rounded-[0.3125rem] typo-comment-1-b transition-colors ${
                        formData.isSmsOptedOut
                            ? "bg-primary-500 text-grey-100"
                            : "border-[1.8px] border-grey-500 bg-grey-100 text-transparent"
                    }`}
                >
                    ✓
                </span>
                <span
                    className={`typo-button-text transition-colors ${
                        formData.isSmsOptedOut ? "text-primary-600 font-semibold" : "text-grey-700"
                    }`}
                >
                    문자 괜찮아요
                </span>
            </button>

            {errorMessage && (
                <p className="typo-comment-1-m text-warning">{errorMessage}</p>
            )}

            <div className="fixed inset-x-0 bottom-0 z-20 bg-grey-100 px-5 pt-2.5 pb-[2.75rem]">
                <div className="mx-auto w-full max-w-[22.625rem]">
                    <button
                        type="button"
                        disabled={!isPhoneComplete || isSubmitting}
                        onClick={onSubmit}
                        className={`flex h-[50px] w-full items-center justify-center rounded-[14px] text-[16px] font-bold leading-[19px] transition-colors ${
                            isPhoneComplete && !isSubmitting
                                ? "bg-primary-500 text-grey-100 hover:bg-primary-600"
                                : "cursor-not-allowed bg-[#eaeaea] text-grey-100"
                        }`}
                    >
                        {isSubmitting ? "가입 처리 중..." : "가입 완료"}
                    </button>
                </div>
            </div>
        </div>
    );
}
