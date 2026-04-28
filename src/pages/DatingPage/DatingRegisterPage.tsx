import { useRef, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";

import {
  createDatingProfile,
  getProfileImagePresignedUrl,
  uploadProfileImageToS3,
} from "../../api/datingProfile";
import heartIcon from "../../assets/heartIcon.svg";
import Button from "../../components/Button/Button";
import { ButtonVariant } from "../../components/Button/ButtonEnums";
import NotLoginHeader from "../../components/NotLoginHeader";
import { useUserStore } from "../../stores/userStore";
import { DatingRegisterFlowProvider } from "./DatingRegisterFlowContext";
import smileIcon from "./assets/smileIcon.svg";
import sumnailIcon from "./assets/sumnailIcon.png";
import uploadIcon from "./assets/uploadIcon.svg";
import { useDatingRegisterFlow } from "./useDatingRegisterFlow";

const MBTI_PAIRS: [string, string][] = [
  ["E", "I"],
  ["N", "S"],
  ["T", "F"],
  ["P", "J"],
];

const ROMANTIC_STYLE_MAX_LENGTH = 75;
const ROMANTIC_STYLE_PLACEHOLDER =
  "공강 때 요거바라 가서 요거트 먹고, 같이 학교 산책하는 연애";
const IDEAL_TYPE_MAX_LENGTH = 75;
const IDEAL_TYPE_PLACEHOLDER = "대화가 잘 통하고 같이 있으면 편한 사람";

function DatingRegisterMbtiStep() {
  const { formData, selectMbtiLetter, goNextStep } = useDatingRegisterFlow();
  const isMbtiComplete = formData.mbti.length === 4;

  return (
    <>
      <main className="px-5 pt-[1.625rem] pb-[8.125rem]">
        <div className="mx-auto flex w-full max-w-[22.6875rem] flex-col gap-[2rem]">
          <h1 className="typo-title-header-1 text-grey-900">
            MBTI를 알려주세요
          </h1>

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
                        : "bg-primary-100 typo-title-header-1 text-grey-600"
                    }`}
                  >
                    {letter}
                  </button>
                );
              }),
            )}
          </div>
        </div>
      </main>

      <section className="fixed inset-x-0 bottom-0 bg-grey-100 px-5 pt-2.5 pb-[2.75rem]">
        <div className="mx-auto w-full max-w-[22.625rem]">
          <Button
            label="다음"
            variant={ButtonVariant.Main}
            disabled={!isMbtiComplete}
            onClick={goNextStep}
          />
        </div>
      </section>
    </>
  );
}

type DatingRegisterTextStepProps = {
  title: string;
  value: string;
  maxLength: number;
  placeholder: string;
  onChange: (nextValue: string) => void;
};

function DatingRegisterTextStep({
  title,
  value,
  maxLength,
  placeholder,
  onChange,
}: DatingRegisterTextStepProps) {
  const { goNextStep } = useDatingRegisterFlow();
  const isComplete = value.trim().length > 0;
  const fieldClassName = `h-[5.0625rem] w-full resize-none overflow-y-auto rounded-[0.625rem] px-2.5 py-2 placeholder:text-grey-600 focus:outline-none ${
    value.length > 0
      ? "bg-primary-100 typo-input-text text-primary-500"
      : "bg-grey-300 typo-input-text-m text-grey-600"
  }`;

  return (
    <>
      <main className="px-5 pt-[1.625rem] pb-[8.125rem]">
        <div className="mx-auto flex w-full max-w-[22.6875rem] flex-col gap-[1.875rem]">
          <h1 className="typo-title-header-1 text-grey-900">{title}</h1>

          <div className="flex flex-col gap-[0.3125rem]">
            <textarea
              value={value}
              maxLength={maxLength}
              placeholder={placeholder}
              onChange={(event) => onChange(event.target.value)}
              className={fieldClassName}
            />
            <p className="typo-comment-1-m text-right text-grey-600">
              {value.length}/{maxLength}
            </p>
          </div>
        </div>
      </main>

      <section className="fixed inset-x-0 bottom-0 bg-grey-100 px-5 pt-2.5 pb-[2.75rem]">
        <div className="mx-auto w-full max-w-[22.625rem]">
          <Button
            label="다음"
            variant={ButtonVariant.Main}
            disabled={!isComplete}
            onClick={goNextStep}
          />
        </div>
      </section>
    </>
  );
}

function DatingRegisterRomanticStyleStep() {
  const { formData, setRomanticStyle } = useDatingRegisterFlow();

  return (
    <DatingRegisterTextStep
      title="원하는 연애 스타일을 적어주세요"
      value={formData.romanticStyle}
      maxLength={ROMANTIC_STYLE_MAX_LENGTH}
      placeholder={ROMANTIC_STYLE_PLACEHOLDER}
      onChange={setRomanticStyle}
    />
  );
}

function DatingRegisterIdealTypeStep() {
  const { formData, setIdealType } = useDatingRegisterFlow();

  return (
    <DatingRegisterTextStep
      title="이상형을 한 줄로 적어주세요"
      value={formData.idealType}
      maxLength={IDEAL_TYPE_MAX_LENGTH}
      placeholder={IDEAL_TYPE_PLACEHOLDER}
      onChange={setIdealType}
    />
  );
}

type DatingRegisterCompleteModalProps = {
  onConfirm: () => void;
};

function DatingRegisterCompleteModal({
  onConfirm,
}: DatingRegisterCompleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
      <div className="absolute inset-0 bg-grey-900/70" />
      <div className="relative z-10 flex w-full max-w-[21.25rem] flex-col items-center gap-6 rounded-[0.875rem] bg-grey-100 px-5 py-8 text-center">
        <div className="flex flex-col items-center gap-2">
          <img src={heartIcon} alt="" className="h-7 w-7" />
          <h2 className="typo-subtitle-header-2 text-grey-900">
            프로필 등록 완료
          </h2>
          <p className="typo-input-text-m text-grey-700">
            소개팅 카드를 등록했어요
          </p>
        </div>
        <Button label="확인" variant={ButtonVariant.Main} onClick={onConfirm} />
      </div>
    </div>
  );
}

function DatingRegisterPhotoStep() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateStatus = useUserStore((state) => state.updateStatus);
  const { formData, setPhotoFile, resetRegisterFlow } = useDatingRegisterFlow();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

  const isFormComplete =
    formData.mbti.length === 4 &&
    formData.romanticStyle.trim().length > 0 &&
    formData.idealType.trim().length > 0 &&
    !!formData.photoFile;

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setErrorMessage("");
    setPhotoFile(file);
  };

  const handleSubmit = async () => {
    if (!isFormComplete || !formData.photoFile || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const { uploadUrl, objectKey } = await getProfileImagePresignedUrl(
        formData.photoFile.type,
      );

      await uploadProfileImageToS3({
        uploadUrl,
        file: formData.photoFile,
      });

      const response = await createDatingProfile({
        mbti: formData.mbti,
        datingStyle: formData.romanticStyle,
        idealType: formData.idealType,
        imageKey: objectKey,
      });

      updateStatus({
        isRegistered: response.status.isRegistered,
        hasIntroduction: response.status.hasIntroduction,
        isProfileCompleted: response.status.isCardCompleted,
      });
      setIsCompleteModalOpen(true);
    } catch (error) {
      console.error(error);
      setErrorMessage("프로필 등록에 실패했어요. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteConfirm = () => {
    resetRegisterFlow();
    navigate("/");
  };

  return (
    <>
      <main className="px-5 pt-[1.625rem] pb-[8.125rem]">
        <div className="mx-auto flex w-full max-w-[22.6875rem] flex-col gap-[1.875rem]">
          <section className="flex flex-col gap-5">
            <div className="flex flex-col gap-5">
              <h1 className="typo-title-header-1 text-grey-900">
                마지막으로
                <br />
                나를 표현하는 사진을 올려주세요
              </h1>
              <div className="flex items-center gap-1">
                <p className="typo-input-text-m text-grey-700">
                  사진은 내가 호감을 보낸 사람에게만 보여요
                </p>
                <img src={smileIcon} alt="" className="h-3.5 w-3.5" />
              </div>
              <div className="flex items-center gap-1">
                <span className="rounded-[0.5rem] bg-primary-500 px-1 py-0.5 typo-comment-2 text-grey-100">
                  TIP
                </span>
                <p className="typo-input-text-m text-primary-600">
                  얼굴이 나온 사진일수록 매칭 확률이 올라가요
                </p>
                <img src={heartIcon} alt="" className="h-3.5 w-3.5" />
              </div>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative flex h-[15.8125rem] w-full items-center justify-center overflow-hidden rounded-[0.625rem] border-[1.8px] border-dashed border-grey-700 bg-grey-300"
            >
              {formData.photoPreviewUrl ? (
                <img
                  src={formData.photoPreviewUrl}
                  alt="선택한 프로필 사진"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <>
                  <img
                    src={sumnailIcon}
                    alt=""
                    className="absolute left-1/2 top-[2.7rem] h-[13.0625rem] w-[12.43375rem] -translate-x-1/2 object-contain opacity-50"
                  />
                  <div className="relative z-10 flex flex-col items-center gap-2.5">
                    <img src={uploadIcon} alt="" className="h-6 w-6" />
                    <span className="typo-input-text-m text-grey-900 opacity-50">
                      클릭하여 파일 선택
                    </span>
                  </div>
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
            {errorMessage && (
              <p className="typo-comment-1-m text-warning">{errorMessage}</p>
            )}
          </section>
        </div>
      </main>

      <section className="fixed inset-x-0 bottom-0 bg-grey-100 px-5 pt-2.5 pb-[2.75rem]">
        <div className="mx-auto w-full max-w-[22.625rem]">
          <Button
            label={isSubmitting ? "등록 중..." : "프로필 등록하기"}
            variant={ButtonVariant.Main}
            disabled={!isFormComplete || isSubmitting}
            onClick={handleSubmit}
          />
        </div>
      </section>

      {isCompleteModalOpen && (
        <DatingRegisterCompleteModal onConfirm={handleCompleteConfirm} />
      )}
    </>
  );
}

function DatingRegisterContent() {
  const navigate = useNavigate();
  const { currentStep, goPrevStep } = useDatingRegisterFlow();

  const handleBack = () => {
    if (currentStep === 1) {
      navigate("/");
      return;
    }

    goPrevStep();
  };

  return (
    <div className="min-h-screen bg-grey-100">
      <NotLoginHeader title="소개팅 카드" onBack={handleBack} />
      <div className="h-1 w-full bg-grey-100">
        <div
          className="h-full bg-primary-500 transition-[width] duration-500 ease-out"
          style={{ width: `${currentStep * 25}%` }}
        />
      </div>

      {currentStep === 1 && <DatingRegisterMbtiStep />}
      {currentStep === 2 && <DatingRegisterRomanticStyleStep />}
      {currentStep === 3 && <DatingRegisterIdealTypeStep />}
      {currentStep >= 4 && <DatingRegisterPhotoStep />}
    </div>
  );
}

function DatingRegisterPage() {
  return (
    <DatingRegisterFlowProvider>
      <DatingRegisterContent />
    </DatingRegisterFlowProvider>
  );
}

export default DatingRegisterPage;
