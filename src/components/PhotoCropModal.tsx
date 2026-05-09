import { useState, type SyntheticEvent } from 'react';
import ReactCrop, {
  centerCrop,
  convertToPixelCrop,
  makeAspectCrop,
  type PercentCrop,
  type PixelCrop,
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import Button from './Button/Button';
import { ButtonVariant } from './Button/ButtonEnums';

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
    PHOTO_CROP_OUTPUT_HEIGHT,
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
      0.92,
    );
  });

  return new File([blob], `${outputName}.${outputExtension}`, {
    type: outputType,
    lastModified: Date.now(),
  });
};

type PhotoCropModalProps = {
  sourceFile: File;
  imageUrl: string;
  onConfirm: (croppedFile: File) => void;
  onCancel: () => void;
};

export function PhotoCropModal({ sourceFile, imageUrl, onConfirm, onCancel }: PhotoCropModalProps) {
  const [cropImageElement, setCropImageElement] = useState<HTMLImageElement | null>(null);
  const [crop, setCrop] = useState<PercentCrop>();
  const [cropAreaPixels, setCropAreaPixels] = useState<PixelCrop | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleImageLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;
    setCropImageElement(image);
    const initialCrop = centerCrop(
      makeAspectCrop({ unit: '%', width: 90 }, PHOTO_CROP_ASPECT, image.width, image.height),
      image.width,
      image.height,
    );
    setCrop(initialCrop);
    setCropAreaPixels(convertToPixelCrop(initialCrop, image.width, image.height));
  };

  const handleConfirm = async () => {
    if (!cropImageElement || !cropAreaPixels || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const croppedFile = await getCroppedImageFile({
        imageElement: cropImageElement,
        sourceFile,
        cropAreaPixels,
      });
      onConfirm(croppedFile);
    } catch (error) {
      console.error(error);
      setErrorMessage('사진을 자르지 못했어요. 다시 시도해주세요.');
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center px-5"
    >
      <button
        type="button"
        aria-label="사진 크롭 닫기"
        onClick={isSubmitting ? undefined : onCancel}
        className="absolute inset-0 bg-grey-900/70"
      />
      <div className="relative z-10 flex w-full max-w-[22.6875rem] flex-col gap-5 rounded-[0.875rem] bg-grey-100 px-5 py-5">
        <h2 className="typo-subtitle-header-2 text-grey-900">사진 영역 조정</h2>

        <div className="flex max-h-[58vh] min-h-[12rem] w-full items-center justify-center overflow-auto rounded-[0.625rem] bg-grey-900">
          <ReactCrop
            crop={crop}
            aspect={PHOTO_CROP_ASPECT}
            keepSelection
            ruleOfThirds
            onChange={(_pixelCrop, percentCrop) => setCrop(percentCrop)}
            onComplete={(pixelCrop) => setCropAreaPixels(pixelCrop)}
            className="max-h-[58vh] w-full max-w-full"
          >
            <img
              src={imageUrl}
              alt="크롭할 프로필 사진"
              onLoad={handleImageLoad}
              className="h-auto max-h-[58vh] w-full object-contain"
            />
          </ReactCrop>
        </div>

        <p className="typo-input-text-m text-grey-700">
          박스의 모서리를 움직여 크기를 조절하고,
          <br />
          박스 안을 드래그해 위치를 맞춰주세요.
        </p>

        {errorMessage && <p className="typo-comment-1-m text-warning">{errorMessage}</p>}

        <div className="grid grid-cols-2 gap-2.5">
          <Button label="취소" variant={ButtonVariant.Muted} disabled={isSubmitting} onClick={onCancel} />
          <Button
            label={isSubmitting ? '처리 중...' : '완료'}
            variant={ButtonVariant.Main}
            disabled={isSubmitting}
            onClick={handleConfirm}
          />
        </div>
      </div>
    </div>
  );
}
