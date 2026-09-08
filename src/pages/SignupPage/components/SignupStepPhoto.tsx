import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type ChangeEvent,
} from "react";
import { PhotoCropModal } from "../../../components/PhotoCropModal";
import heartIcon from "../../../assets/heartIcon.svg";
import smileIcon from "../../DatingPage/assets/smileIcon.svg";
import sumnailIcon from "../../DatingPage/assets/sumnailIcon.png";
import uploadIcon from "../../DatingPage/assets/uploadIcon.svg";
import { useSignupFlow } from "../useSignupFlow";

export function SignupStepPhoto() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { formData, updateFormData, goNextStep } = useSignupFlow();
    const [cropSourceFile, setCropSourceFile] = useState<File | null>(null);
    const [cropSourceUrl, setCropSourceUrl] = useState<string>("");

    const closeCropModal = useCallback(() => {
        if (cropSourceUrl) {
            URL.revokeObjectURL(cropSourceUrl);
        }
        setCropSourceFile(null);
        setCropSourceUrl("");
    }, [cropSourceUrl]);

    useEffect(() => {
        return () => {
            if (cropSourceUrl) {
                URL.revokeObjectURL(cropSourceUrl);
            }
        };
    }, [cropSourceUrl]);

    const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";

        if (!file) {
            return;
        }

        if (cropSourceUrl) {
            URL.revokeObjectURL(cropSourceUrl);
        }

        setCropSourceFile(file);
        setCropSourceUrl(URL.createObjectURL(file));
    };

    const handleCropConfirm = (croppedFile: File) => {
        if (formData.photoPreviewUrl?.startsWith("blob:")) {
            URL.revokeObjectURL(formData.photoPreviewUrl);
        }

        const previewUrl = URL.createObjectURL(croppedFile);
        updateFormData({
            photoFile: croppedFile,
            photoPreviewUrl: previewUrl,
        });

        closeCropModal();
    };

    return (
        <div className="flex flex-col gap-5 pb-[7rem]">
            <div className="flex flex-col gap-3.5">
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

            <div className="flex flex-col items-center gap-3">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative mx-auto flex aspect-[71/109] w-full max-w-[13.3125rem] items-center justify-center overflow-hidden rounded-[0.625rem] bg-grey-300 ${
                        formData.photoPreviewUrl ? "" : "border-[1.8px] border-dashed border-grey-700"
                    }`}
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

                {formData.photoPreviewUrl && (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="typo-comment-2 text-primary-500 underline"
                    >
                        사진 다시 선택하기
                    </button>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                />
            </div>

            <div className="fixed inset-x-0 bottom-0 z-20 bg-grey-100 px-5 pt-2.5 pb-[2.75rem]">
                <div className="mx-auto w-full max-w-[22.625rem]">
                    <button
                        type="button"
                        disabled={!formData.photoFile}
                        onClick={goNextStep}
                        className={`flex h-[50px] w-full items-center justify-center rounded-[14px] text-[16px] font-bold leading-[19px] transition-colors ${
                            formData.photoFile
                                ? "bg-primary-500 text-grey-100 hover:bg-primary-600"
                                : "cursor-not-allowed bg-[#eaeaea] text-grey-100"
                        }`}
                    >
                        다음
                    </button>
                </div>
            </div>

            {cropSourceFile && cropSourceUrl && (
                <PhotoCropModal
                    sourceFile={cropSourceFile}
                    imageUrl={cropSourceUrl}
                    onConfirm={handleCropConfirm}
                    onCancel={closeCropModal}
                />
            )}
        </div>
    );
}
