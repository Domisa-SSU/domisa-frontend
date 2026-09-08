import { useSignupFlow } from "../useSignupFlow";

const MBTI_PAIRS: [string, string][] = [
    ["E", "I"],
    ["N", "S"],
    ["T", "F"],
    ["P", "J"],
];

export function SignupStepMbti() {
    const { formData, updateFormData, goNextStep } = useSignupFlow();
    const isMbtiComplete = formData.mbti.length === 4;

    const selectMbtiLetter = (rowIndex: number, letter: string) => {
        const letters = formData.mbti.padEnd(4, " ").split("");
        letters[rowIndex] = letter;
        // Check if all slots up to this or all slots are letters
        const nextMbti = letters.join("").trimEnd();
        updateFormData({ mbti: nextMbti });
    };

    return (
        <div className="flex flex-col gap-[2rem] pb-[7rem]">
            <h1 className="typo-title-header-1 text-grey-900">MBTI를 알려주세요</h1>

            <div className="mx-auto grid w-full max-w-[21.25rem] grid-cols-2 gap-x-5 gap-y-5">
                {MBTI_PAIRS.map(([left, right], rowIndex) =>
                    [left, right].map((letter) => {
                        const isSelected = formData.mbti[rowIndex] === letter;

                        return (
                            <button
                                key={letter}
                                type="button"
                                aria-pressed={isSelected}
                                onClick={() => selectMbtiLetter(rowIndex, letter)}
                                className={`flex h-[3.4375rem] items-center justify-center rounded-[0.875rem] transition-colors ${
                                    isSelected
                                        ? "bg-primary-400 typo-title-header-1-b text-grey-100"
                                        : "bg-primary-100 typo-title-header-1 text-grey-600 hover:bg-primary-200"
                                }`}
                            >
                                {letter}
                            </button>
                        );
                    })
                )}
            </div>

            <div className="fixed inset-x-0 bottom-0 z-20 bg-grey-100 px-5 pt-2.5 pb-[2.75rem]">
                <div className="mx-auto w-full max-w-[22.625rem]">
                    <button
                        type="button"
                        disabled={!isMbtiComplete}
                        onClick={goNextStep}
                        className={`flex h-[50px] w-full items-center justify-center rounded-[14px] text-[16px] font-bold leading-[19px] transition-colors ${
                            isMbtiComplete
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
