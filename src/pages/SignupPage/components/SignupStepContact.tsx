import { type ChangeEvent, useState } from "react";
import type { ContactType } from "../../../api/users";
import { useSignupFlow } from "../useSignupFlow";

const CONTACT_METHODS: ContactType[] = ["INSTAGRAM", "KAKAO"];

const CONTACT_METHOD_LABELS: Record<ContactType, string> = {
    INSTAGRAM: "인스타 ID",
    KAKAO: "카카오톡 ID",
};

const CONTACT_METHOD_PLACEHOLDERS: Record<ContactType, string> = {
    INSTAGRAM: "인스타 ID를 입력하세요",
    KAKAO: "카카오톡 ID를 입력하세요",
};

const CONTACT_ID_ALLOWED_CHARACTERS = /[^A-Za-z0-9_.-]/g;

export function SignupStepContact() {
    const { formData, updateFormData, goNextStep } = useSignupFlow();
    const isInstagram = formData.contactType === "INSTAGRAM";
    const isComplete = formData.contact.trim().length > 0;
    const [hasInvalidContactCharacter, setHasInvalidContactCharacter] = useState(false);

    const handleContactChange = (event: ChangeEvent<HTMLInputElement>) => {
        const rawValue = event.target.value;
        const nextValue = rawValue
            .replace(CONTACT_ID_ALLOWED_CHARACTERS, "")
            .replace(/^@+/, "");

        setHasInvalidContactCharacter(rawValue !== nextValue);

        updateFormData({
            contact: nextValue,
        });
    };

    return (
        <div className="flex flex-col gap-[1.875rem] pb-[7rem]">
            <h1 className="typo-title-header-1 text-grey-900">
                최종 매칭 시 상대에게
                <br />
                공유할 연락처를 입력해주세요..
            </h1>

            <div className="grid grid-cols-2 gap-[0.875rem]">
                {CONTACT_METHODS.map((method) => {
                    const isSelected = formData.contactType === method;

                    return (
                        <button
                            key={method}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => updateFormData({ contactType: method })}
                            className={`flex h-[2.875rem] items-center justify-center rounded-[0.625rem] px-2.5 typo-button-text transition-colors ${
                                isSelected
                                    ? "border-[1.8px] border-primary-500 bg-primary-100 text-primary-600"
                                    : "bg-grey-200 text-grey-700 hover:bg-grey-300"
                            }`}
                        >
                            {CONTACT_METHOD_LABELS[method]}
                        </button>
                    );
                })}
            </div>

            <label className="flex flex-col gap-2.5">
                <span className="typo-comment-2 text-primary-600">
                    {CONTACT_METHOD_LABELS[formData.contactType]}
                </span>
                <div className="flex h-9 items-center gap-2 border-b-[1.8px] border-primary-500">
                    {isInstagram && <span className="typo-header-3 text-primary-500">@</span>}
                    <input
                        value={formData.contact}
                        onChange={handleContactChange}
                        placeholder={CONTACT_METHOD_PLACEHOLDERS[formData.contactType]}
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        aria-describedby={
                            hasInvalidContactCharacter
                                ? "contact-format-warning"
                                : undefined
                        }
                        className="min-w-0 flex-1 bg-transparent typo-header-3 text-primary-500 placeholder:text-grey-600 focus:outline-none"
                    />
                </div>
                {hasInvalidContactCharacter ? (
                    <span
                        id="contact-format-warning"
                        role="alert"
                        className="typo-comment-1-m text-warning"
                    >
                        영문, 숫자, 밑줄(_), 하이픈(-), 마침표(.)만 사용할 수 있어요.
                    </span>
                ) : null}
            </label>

            <div className="fixed bottom-0 left-1/2 w-full frame-max-w -translate-x-1/2 z-20 bg-grey-100 px-5 pt-2.5 pb-[2.75rem]">
                <div className="mx-auto w-full max-w-[22.625rem]">
                    <button
                        type="button"
                        disabled={!isComplete}
                        onClick={goNextStep}
                        className={`flex h-[50px] w-full items-center justify-center rounded-[14px] text-[16px] font-bold leading-[19px] transition-colors ${
                            isComplete
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
