import { useSignupFlow } from "../useSignupFlow";
import alphacaImg from "../asset/alphacaImg.png";
import bearImg from "../asset/bearImg.png";
import capibaraImg from "../asset/capibaraImg.png";
import catImg from "../asset/catImg.png";
import deerImg from "../asset/deerImg.png";
import dogImg from "../asset/dogImg.png";
import eyeIcon from "../asset/eyeIcon.svg";
import foxImg from "../asset/foxImg.png";
import hamsterImg from "../asset/hamsterImg.png";
import namuneulboImg from "../asset/namuneulboImg.png";
import rabbitImg from "../asset/rabbitImg.png";
import sudalImg from "../asset/sudalImg.png";
import wolfImg from "../asset/wolfImg.png";

const animalOptions = [
    { name: "강아지", image: dogImg },
    { name: "고양이", image: catImg },
    { name: "곰", image: bearImg },
    { name: "나무늘보", image: namuneulboImg },
    { name: "햄스터", image: hamsterImg },
    { name: "늑대", image: wolfImg },
    { name: "토끼", image: rabbitImg },
    { name: "사슴", image: deerImg },
    { name: "수달", image: sudalImg },
    { name: "알파카", image: alphacaImg },
    { name: "여우", image: foxImg },
    { name: "카피바라", image: capibaraImg },
];

export function SignupStepAnimal() {
    const { formData, updateFormData, goNextStep } = useSignupFlow();
    const isSelectedValid = Boolean(formData.selectedAnimal);

    return (
        <div className="flex flex-col gap-5 pb-[7rem]">
            <h1 className="typo-title-header-1 text-grey-900">
                <span className="text-primary-600">본인과 닮은 동물</span>을 선택해주세요
            </h1>

            <div className="grid grid-cols-3 gap-x-[1.875rem] gap-y-5">
                {animalOptions.map((animal) => {
                    const isSelected = formData.selectedAnimal === animal.name;

                    return (
                        <button
                            key={animal.name}
                            type="button"
                            onClick={() => updateFormData({ selectedAnimal: animal.name })}
                            className="flex flex-col items-center gap-0.5"
                        >
                            <div
                                className={`flex h-[6.25rem] w-[6.25rem] items-center justify-center rounded-[1.875rem] transition-colors ${
                                    isSelected ? "bg-primary-500" : "bg-grey-300"
                                }`}
                            >
                                <img
                                    src={animal.image}
                                    alt={animal.name}
                                    className={`h-[6.25rem] w-[6.25rem] object-cover ${
                                        isSelected ? "animate-animal-swing" : ""
                                    }`}
                                />
                            </div>
                            <span
                                className={`typo-input-text transition-colors ${
                                    isSelected ? "text-primary-500 font-semibold" : "text-grey-900"
                                }`}
                            >
                                {animal.name}
                            </span>
                        </button>
                    );
                })}
            </div>

            <div className="fixed bottom-0 left-1/2 w-full frame-max-w -translate-x-1/2 z-20 bg-grey-100 px-5 pt-2.5 pb-[2.75rem]">
                <div className="mx-auto flex w-full max-w-[22.625rem] flex-col items-center gap-2">
                    <p className="flex items-center gap-0.5 typo-button-text text-primary-500">
                        {`저는 ${formData.selectedAnimal || "동물"}상`}
                        <img src={eyeIcon} alt="" aria-hidden="true" className="h-[1em] w-[1em]" />
                        이에요
                    </p>
                    <button
                        type="button"
                        disabled={!isSelectedValid}
                        onClick={goNextStep}
                        className={`flex h-[50px] w-full items-center justify-center rounded-[14px] text-[16px] font-bold leading-[19px] transition-colors ${
                            isSelectedValid
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
