import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type SyntheticEvent,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import ReactCrop, {
  centerCrop,
  convertToPixelCrop,
  makeAspectCrop,
  type PercentCrop,
  type PixelCrop,
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import { createDatingProfile } from '../../api/datingProfile';
import {
  completeProfileImageUpload,
  createProfileImageUploadUrl,
  uploadProfileImageToS3,
} from '../../api/s3';
import arrowIcon from '../../assets/arrowIcon.svg';
import flowerIcon from '../../assets/flowerIcon.svg';
import heartIcon from '../../assets/heartIcon.svg';
import Button from '../../components/Button/Button';
import { ButtonVariant } from '../../components/Button/ButtonEnums';
import NotLoginHeader from '../../components/NotLoginHeader';
import { authMeQueryKey } from '../../queries/auth';
import { userMeQueryKey } from '../../queries/users';
import { reportGlobalErrorIfNeeded } from '../../stores/globalErrorStore';
import type { DatingRegisterContactMethod } from './DatingRegisterFlowState';
import { DatingRegisterFlowProvider } from './DatingRegisterFlowContext';
import smileIcon from './assets/smileIcon.svg';
import sumnailIcon from './assets/sumnailIcon.png';
import uploadIcon from './assets/uploadIcon.svg';
import eyeIcon from '../SignupPage/asset/eyeIcon.svg';
import { useDatingRegisterFlow } from './useDatingRegisterFlow';

const MBTI_PAIRS: [string, string][] = [
  ['E', 'I'],
  ['N', 'S'],
  ['T', 'F'],
  ['P', 'J'],
];

const TOTAL_REGISTER_STEPS = 6;
const CONTACT_METHODS: DatingRegisterContactMethod[] = ['INSTAGRAM', 'KAKAO'];
const CONTACT_METHOD_LABELS: Record<DatingRegisterContactMethod, string> = {
  INSTAGRAM: '인스타 ID',
  KAKAO: '카카오톡 ID',
};
const CONTACT_METHOD_PLACEHOLDERS: Record<DatingRegisterContactMethod, string> = {
  INSTAGRAM: '인스타 ID를 입력하세요',
  KAKAO: '카카오톡 ID를 입력하세요',
};
const ROMANTIC_STYLE_MAX_LENGTH = 75;
const ROMANTIC_STYLE_PLACEHOLDER = '공강 때 요거바라 가서 요거트 먹고, 같이 학교 산책하는 연애';
const IDEAL_TYPE_MAX_LENGTH = 75;
const IDEAL_TYPE_PLACEHOLDER = '대화가 잘 통하고 같이 있으면 편한 사람';
const NOTIFICATION_PHONE_MAX_LENGTH = 11;
const PHOTO_CROP_ASPECT = 71 / 109;
const PHOTO_CROP_OUTPUT_WIDTH = 710;
const PHOTO_CROP_OUTPUT_HEIGHT = 1090;

const getCroppedImageFile = async ({
  imageElement,
  sourceFile,
  cropAreaPixels,
}: {
  imageElement: HTMLImageElement;
  sourceFile: File;
  cropAreaPixels: PixelCrop;
}) => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Canvas context is not available');
  }

  canvas.width = PHOTO_CROP_OUTPUT_WIDTH;
  canvas.height = PHOTO_CROP_OUTPUT_HEIGHT;

  const scaleX = imageElement.naturalWidth / imageElement.width;
  const scaleY = imageElement.naturalHeight / imageElement.height;

  context.drawImage(
    imageElement,
    cropAreaPixels.x * scaleX,
    cropAreaPixels.y * scaleY,
    cropAreaPixels.width * scaleX,
    cropAreaPixels.height * scaleY,
    0,
    0,
    PHOTO_CROP_OUTPUT_WIDTH,
    PHOTO_CROP_OUTPUT_HEIGHT
  );

  const outputType = sourceFile.type === 'image/png' ? 'image/png' : 'image/jpeg';
  const outputExtension = outputType === 'image/png' ? 'png' : 'jpg';
  const outputName = sourceFile.name.replace(/\.[^.]+$/, '') || 'profile-image';

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (nextBlob) => {
        if (nextBlob) {
          resolve(nextBlob);
          return;
        }

        reject(new Error('Failed to crop image'));
      },
      outputType,
      0.92
    );
  });

  return new File([blob], `${outputName}.${outputExtension}`, {
    type: outputType,
    lastModified: Date.now(),
  });
};

const createInitialPhotoCrop = (imageWidth: number, imageHeight: number) =>
  centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      PHOTO_CROP_ASPECT,
      imageWidth,
      imageHeight
    ),
    imageWidth,
    imageHeight
  );

const formatPhoneNumber = (phoneNumber: string) => {
  const digitsOnly = phoneNumber.replace(/[^0-9]/g, '').slice(0, NOTIFICATION_PHONE_MAX_LENGTH);

  if (digitsOnly.length <= 3) {
    return digitsOnly;
  }

  if (digitsOnly.length <= 7) {
    return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3)}`;
  }

  return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 7)}-${digitsOnly.slice(7)}`;
};

function DatingRegisterMbtiStep() {
  const { formData, selectMbtiLetter, goNextStep } = useDatingRegisterFlow();
  const isMbtiComplete = formData.mbti.length === 4;

  return (
    <>
      <main className="px-5 pt-[1.625rem] pb-[8.125rem]">
        <div className="mx-auto flex w-full max-w-[22.6875rem] flex-col gap-[2rem]">
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
                        ? 'bg-primary-400 typo-title-header-1-b text-grey-100'
                        : 'bg-primary-100 typo-title-header-1 text-grey-600'
                    }`}
                  >
                    {letter}
                  </button>
                );
              })
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
      ? 'bg-primary-100 typo-input-text text-primary-500'
      : 'bg-grey-300 typo-input-text-m text-grey-600'
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

function DatingRegisterContactStep() {
  const { formData, setContactMethod, setContactValue, goNextStep } = useDatingRegisterFlow();
  const isInstagram = formData.contactMethod === 'INSTAGRAM';
  const isComplete = formData.contactValue.trim().length > 0;

  const handleContactChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    setContactValue(isInstagram ? nextValue.replace(/^@+/, '') : nextValue);
  };

  return (
    <>
      <main className="px-5 pt-[1.625rem] pb-[8.125rem]">
        <div className="mx-auto flex w-full max-w-[22.6875rem] flex-col gap-[1.875rem]">
          <h1 className="typo-title-header-1 text-grey-900">
            최종 매칭 시 상대에게
            <br />
            공유할 연락처를 입력해주세요..
          </h1>

          <div className="grid grid-cols-2 gap-[0.875rem]">
            {CONTACT_METHODS.map((method) => {
              const isSelected = formData.contactMethod === method;

              return (
                <button
                  key={method}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setContactMethod(method)}
                  className={`flex h-[2.875rem] items-center justify-center rounded-[0.625rem] px-2.5 typo-button-text transition-colors ${
                    isSelected
                      ? 'border-[1.8px] border-primary-500 bg-primary-100 text-primary-600'
                      : 'bg-grey-200 text-grey-700'
                  }`}
                >
                  {CONTACT_METHOD_LABELS[method]}
                </button>
              );
            })}
          </div>

          <label className="flex flex-col gap-2.5">
            <span className="typo-comment-2 text-primary-600">
              {CONTACT_METHOD_LABELS[formData.contactMethod]}
            </span>
            <div className="flex h-9 items-center gap-2 border-b-[1.8px] border-primary-500">
              {isInstagram && <span className="typo-header-3 text-primary-500">@</span>}
              <input
                value={formData.contactValue}
                onChange={handleContactChange}
                placeholder={CONTACT_METHOD_PLACEHOLDERS[formData.contactMethod]}
                className="min-w-0 flex-1 bg-transparent typo-header-3 text-primary-500 placeholder:text-grey-600 focus:outline-none"
              />
            </div>
          </label>
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

type DatingRegisterCompleteModalProps = {
  totalUserCount: number;
  onConfirm: () => void;
};

function DatingRegisterCompleteModal({
  totalUserCount,
  onConfirm,
}: DatingRegisterCompleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
      <div className="absolute inset-0 bg-grey-900/70" />
      <div className="relative z-10 flex w-full max-w-[21.25rem] flex-col items-center justify-center gap-5 rounded-[0.875rem] bg-grey-100 px-5 pt-[1.875rem] pb-5 text-center">
        <div className="flex flex-col items-center gap-[0.9375rem]">
          <h2 className="typo-subtitle-header-2 text-grey-900">
            등록 완료!
            <br />
            바로 시작해볼까요?
          </h2>
          <div className="flex items-center justify-center gap-1">
            <p className="typo-input-text-m text-grey-700">
              {totalUserCount}명의 솔로가 기다리고 있어요
            </p>
            <img src={flowerIcon} alt="" aria-hidden="true" className="h-3.5 w-3.5" />
          </div>
        </div>
        <button
          type="button"
          onClick={onConfirm}
          className="flex h-[3.125rem] w-full max-w-[18.75rem] items-center justify-center rounded-[0.875rem] bg-primary-500 px-2.5 py-2.5"
        >
          <span className="flex items-center gap-1 typo-button-text-b text-grey-100">
            솔로 둘러보기
            <img src={eyeIcon} alt="" aria-hidden="true" className="h-[1.125rem] w-[1.125rem]" />
            <img src={arrowIcon} alt="" aria-hidden="true" className="h-3 w-3" />
          </span>
        </button>
      </div>
    </div>
  );
}

type DatingRegisterPhotoCropModalProps = {
  imageUrl: string;
  crop: PercentCrop | undefined;
  isSubmitting: boolean;
  errorMessage: string;
  onCropChange: (nextCrop: PercentCrop) => void;
  onCropComplete: (cropAreaPixels: PixelCrop) => void;
  onImageLoad: (event: SyntheticEvent<HTMLImageElement>) => void;
  onCancel: () => void;
  onConfirm: () => void;
};

function DatingRegisterPhotoCropModal({
  imageUrl,
  crop,
  isSubmitting,
  errorMessage,
  onCropChange,
  onCropComplete,
  onImageLoad,
  onCancel,
  onConfirm,
}: DatingRegisterPhotoCropModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dating-register-photo-crop-title"
      className="fixed inset-0 z-50 flex items-center justify-center px-5"
    >
      <button
        type="button"
        aria-label="사진 크롭 닫기"
        onClick={onCancel}
        className="absolute inset-0 bg-grey-900/70"
      />
      <div className="relative z-10 flex w-full max-w-[22.6875rem] flex-col gap-5 rounded-[0.875rem] bg-grey-100 px-5 py-5">
        <div className="flex flex-col gap-1">
          <h2
            id="dating-register-photo-crop-title"
            className="typo-subtitle-header-2 text-grey-900"
          >
            사진 영역 조정
          </h2>
        </div>

        <div className="flex max-h-[58vh] min-h-[12rem] w-full items-center justify-center overflow-auto rounded-[0.625rem] bg-grey-900">
          <ReactCrop
            crop={crop}
            aspect={PHOTO_CROP_ASPECT}
            keepSelection
            ruleOfThirds
            onChange={(_pixelCrop, percentCrop) => onCropChange(percentCrop)}
            onComplete={(pixelCrop) => onCropComplete(pixelCrop)}
            className="max-h-[58vh] w-full max-w-full"
          >
            <img
              src={imageUrl}
              alt="크롭할 프로필 사진"
              onLoad={onImageLoad}
              className="h-auto max-h-[58vh] w-full object-contain"
            />
          </ReactCrop>
        </div>

        <div className="flex flex-col gap-1">
          <p className="typo-input-text-m text-grey-700">
            박스의 모서리를 움직여 크기를 조절하고,
            <br />
            박스 안을 드래그해 위치를 맞춰주세요.
          </p>
        </div>

        {errorMessage && <p className="typo-comment-1-m text-warning">{errorMessage}</p>}

        <div className="grid grid-cols-2 gap-2.5">
          <Button
            label="취소"
            variant={ButtonVariant.Muted}
            disabled={isSubmitting}
            onClick={onCancel}
          />
          <Button
            label={isSubmitting ? '처리 중...' : '완료'}
            variant={ButtonVariant.Main}
            disabled={isSubmitting}
            onClick={onConfirm}
          />
        </div>
      </div>
    </div>
  );
}

function DatingRegisterPhotoStep() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { formData, setPhotoFile, goNextStep } = useDatingRegisterFlow();
  const [cropSourceFile, setCropSourceFile] = useState<File | null>(null);
  const [cropSourceUrl, setCropSourceUrl] = useState('');
  const [cropImageElement, setCropImageElement] = useState<HTMLImageElement | null>(null);
  const [crop, setCrop] = useState<PercentCrop>();
  const [cropAreaPixels, setCropAreaPixels] = useState<PixelCrop | null>(null);
  const [cropErrorMessage, setCropErrorMessage] = useState('');
  const [isCropSubmitting, setIsCropSubmitting] = useState(false);

  const closeCropModal = useCallback(() => {
    if (cropSourceUrl) {
      URL.revokeObjectURL(cropSourceUrl);
    }

    setCropSourceFile(null);
    setCropSourceUrl('');
    setCropImageElement(null);
    setCrop(undefined);
    setCropAreaPixels(null);
    setCropErrorMessage('');
    setIsCropSubmitting(false);
  }, [cropSourceUrl]);

  useEffect(() => {
    return () => {
      if (cropSourceUrl) {
        URL.revokeObjectURL(cropSourceUrl);
      }
    };
  }, [cropSourceUrl]);

  const handleCropComplete = useCallback((nextCropAreaPixels: PixelCrop) => {
    setCropAreaPixels(nextCropAreaPixels);
  }, []);

  const handleCropImageLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;
    setCropImageElement(image);

    const nextCrop = createInitialPhotoCrop(image.width, image.height);
    setCrop(nextCrop);
    setCropAreaPixels(convertToPixelCrop(nextCrop, image.width, image.height));
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    if (cropSourceUrl) {
      URL.revokeObjectURL(cropSourceUrl);
    }

    setCropSourceFile(file);
    setCropSourceUrl(URL.createObjectURL(file));
    setCropImageElement(null);
    setCrop(undefined);
    setCropAreaPixels(null);
    setCropErrorMessage('');
  };

  const handleCropConfirm = async () => {
    if (!cropSourceFile || !cropImageElement || !cropAreaPixels || isCropSubmitting) {
      return;
    }

    setIsCropSubmitting(true);
    setCropErrorMessage('');

    try {
      const croppedFile = await getCroppedImageFile({
        imageElement: cropImageElement,
        sourceFile: cropSourceFile,
        cropAreaPixels,
      });

      setPhotoFile(croppedFile);
      closeCropModal();
    } catch (error) {
      console.error(error);
      setCropErrorMessage('사진을 자르지 못했어요. 다시 시도해주세요.');
      setIsCropSubmitting(false);
    }
  };

  return (
    <>
      <main className="px-5 pt-[1.625rem] pb-[8.125rem]">
        <div className="mx-auto flex w-full max-w-[22.6875rem] flex-col gap-[1.875rem]">
          <section className="flex flex-col gap-5">
            <div className="flex flex-col gap-5">
              <h1 className="typo-title-header-1 text-grey-900">
                나를 표현하는 사진을
                <br />
                올려주세요
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
              className={`relative mx-auto flex aspect-[1086/591] w-full items-center justify-center overflow-hidden rounded-[0.625rem] bg-grey-300 ${
                formData.photoPreviewUrl ? "" : "border-[1.8px] border-dashed border-grey-700"
              }`}
            >
              {formData.photoPreviewUrl ? (
                <>
                  <img
                    src={formData.photoPreviewUrl}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full scale-[1.08] object-cover brightness-[0.88] saturate-[1.08] blur-[10px]"
                  />
                  <div className="absolute inset-0 bg-black/10" />
                  <img
                    src={formData.photoPreviewUrl}
                    alt="선택한 프로필 사진"
                    className="relative z-10 h-full w-auto max-w-full object-contain"
                  />
                </>
              ) : (
                <>
                  <img
                    src={sumnailIcon}
                    alt=""
                    className="absolute left-1/2 top-1/2 h-[9.9375rem] w-[10.3125rem] -translate-x-1/2 -translate-y-1/2 object-contain opacity-50"
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
          </section>
        </div>
      </main>

      <section className="fixed inset-x-0 bottom-0 bg-grey-100 px-5 pt-2.5 pb-[2.75rem]">
        <div className="mx-auto w-full max-w-[22.625rem]">
          <Button
            label="다음"
            variant={ButtonVariant.Main}
            disabled={!formData.photoFile}
            onClick={goNextStep}
          />
        </div>
      </section>

      {cropSourceUrl && (
        <DatingRegisterPhotoCropModal
          imageUrl={cropSourceUrl}
          crop={crop}
          isSubmitting={isCropSubmitting}
          errorMessage={cropErrorMessage}
          onCropChange={setCrop}
          onCropComplete={handleCropComplete}
          onImageLoad={handleCropImageLoad}
          onCancel={closeCropModal}
          onConfirm={handleCropConfirm}
        />
      )}
    </>
  );
}

function DatingRegisterNotificationPhoneStep() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { formData, setNotificationPhone, setIsSmsOptedOut, resetRegisterFlow } =
    useDatingRegisterFlow();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [totalUserCount, setTotalUserCount] = useState<number | null>(null);

  const isPhoneComplete =
    formData.notificationPhone.length === NOTIFICATION_PHONE_MAX_LENGTH || formData.isSmsOptedOut;
  const isFormComplete =
    formData.mbti.length === 4 &&
    formData.romanticStyle.trim().length > 0 &&
    formData.idealType.trim().length > 0 &&
    formData.contactValue.trim().length > 0 &&
    !!formData.photoFile &&
    isPhoneComplete;

  const handlePhoneChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNotificationPhone(
      event.target.value.replace(/[^0-9]/g, '').slice(0, NOTIFICATION_PHONE_MAX_LENGTH)
    );
  };

  const handleSubmit = async () => {
    if (!isFormComplete || !formData.photoFile || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setTotalUserCount(null);

    try {
      const profileImageUpload = await createProfileImageUploadUrl({
        contentType: formData.photoFile.type,
        fileSize: formData.photoFile.size,
      });

      await uploadProfileImageToS3({
        presignedUrl: profileImageUpload.presignedUrl,
        file: formData.photoFile,
      });

      await completeProfileImageUpload({
        uploadKey: profileImageUpload.objectKey,
      });

      const createdProfile = await createDatingProfile({
        mbti: formData.mbti,
        datingStyle: formData.romanticStyle,
        idealType: formData.idealType,
        contactType: formData.contactMethod,
        contact: formData.contactValue.trim(),
        notificationPhone: formData.isSmsOptedOut ? null : formData.notificationPhone,
      });

      await queryClient.invalidateQueries({ queryKey: authMeQueryKey });
      await queryClient.invalidateQueries({ queryKey: userMeQueryKey });

      if (!createdProfile.status.hasIntroduction) {
        resetRegisterFlow();
        navigate('/dating/require-introduce', { replace: true });
        return;
      }

      setTotalUserCount(createdProfile.totalUserCount);
      setIsCompleteModalOpen(true);
    } catch (error) {
      if (reportGlobalErrorIfNeeded(error)) {
        return;
      }

      console.error(error);
      setErrorMessage('프로필 등록에 실패했어요. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteConfirm = () => {
    resetRegisterFlow();
    navigate('/dating', { replace: true });
  };

  return (
    <>
      <main className="px-5 pt-[1.625rem] pb-[8.125rem]">
        <div className="mx-auto flex w-full max-w-[22.6875rem] flex-col gap-[1.875rem]">
          <div className="flex flex-col gap-3.5">
            <h1 className="typo-title-header-1 text-grey-900">
              새로운 호감이나 매칭이 이루어졌을 때
              <br />
              문자로 알려드릴게요
            </h1>
            <div className="flex items-center gap-1">
              <p className="typo-input-text-m text-grey-700">
                매일 15시, 20시에 문자로 알려드려요
              </p>
              <img src={smileIcon} alt="" className="h-3.5 w-3.5" />
            </div>
          </div>

          <label className="flex flex-col gap-2.5">
            <span
              className={`typo-comment-2 ${
                formData.isSmsOptedOut ? 'text-grey-400' : 'text-primary-600'
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
              className={`h-9 border-b-[1.8px] bg-transparent typo-header-3 focus:outline-none ${
                formData.isSmsOptedOut
                  ? 'border-grey-400 text-grey-400 placeholder:text-grey-400'
                  : 'border-primary-500 text-primary-500 placeholder:text-grey-600'
              }`}
            />
          </label>

          <button
            type="button"
            aria-pressed={formData.isSmsOptedOut}
            onClick={() => setIsSmsOptedOut(!formData.isSmsOptedOut)}
            className="flex items-center gap-2.5 self-start"
          >
            <span
              className={`flex h-[1.5625rem] w-[1.5625rem] items-center justify-center rounded-[0.3125rem] typo-comment-1-b ${
                formData.isSmsOptedOut
                  ? 'bg-primary-500 text-grey-100'
                  : 'border-[1.8px] border-grey-500 bg-grey-100 text-transparent'
              }`}
            >
              ✓
            </span>
            <span
              className={`typo-button-text ${
                formData.isSmsOptedOut ? 'text-primary-600' : 'text-grey-700'
              }`}
            >
              문자 알림 안 받을래요
            </span>
          </button>

          {errorMessage && <p className="typo-comment-1-m text-warning">{errorMessage}</p>}
        </div>
      </main>

      <section className="fixed inset-x-0 bottom-0 bg-grey-100 px-5 pt-2.5 pb-[2.75rem]">
        <div className="mx-auto w-full max-w-[22.625rem]">
          <Button
            label={isSubmitting ? '등록 중...' : '프로필 등록하기'}
            variant={ButtonVariant.Main}
            disabled={!isFormComplete || isSubmitting}
            onClick={handleSubmit}
          />
        </div>
      </section>

      {isCompleteModalOpen && totalUserCount !== null && (
        <DatingRegisterCompleteModal
          totalUserCount={totalUserCount}
          onConfirm={handleCompleteConfirm}
        />
      )}
    </>
  );
}

function DatingRegisterContent() {
  const navigate = useNavigate();
  const { currentStep, goPrevStep } = useDatingRegisterFlow();

  const handleBack = () => {
    if (currentStep === 1) {
      navigate('/');
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
          style={{ width: `${(currentStep / TOTAL_REGISTER_STEPS) * 100}%` }}
        />
      </div>

      {currentStep === 1 && <DatingRegisterMbtiStep />}
      {currentStep === 2 && <DatingRegisterRomanticStyleStep />}
      {currentStep === 3 && <DatingRegisterIdealTypeStep />}
      {currentStep === 4 && <DatingRegisterContactStep />}
      {currentStep === 5 && <DatingRegisterPhotoStep />}
      {currentStep === 6 && <DatingRegisterNotificationPhoneStep />}
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
