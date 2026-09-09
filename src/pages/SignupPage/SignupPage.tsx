import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import {
    completeProfileImageUpload,
    createProfileImageUploadUrl,
    uploadProfileImageToS3,
} from "../../api/s3";
import NotLoginHeader from "../../components/NotLoginHeader";
import Toast from "../../components/Toast";
import { animalProfileByName } from "../../constants/animalProfile";
import { KAKAO_LOGIN_TOAST_STORAGE_KEY } from "../../constants/storageKeys";
import { authMeQueryKey } from "../../queries/auth";
import { useRegisterUserMutation, userMeQueryKey } from "../../queries/users";
import { reportGlobalErrorIfNeeded } from "../../stores/globalErrorStore";

import { SignupStepBasic } from "./components/SignupStepBasic";
import { SignupStepAnimal } from "./components/SignupStepAnimal";
import { SignupStepMbti } from "./components/SignupStepMbti";
import { SignupStepPhoto } from "./components/SignupStepPhoto";
import { SignupStepContact } from "./components/SignupStepContact";
import { SignupStepNotification } from "./components/SignupStepNotification";
import { useSignupFlow } from "./useSignupFlow";

const getSafeReturnTo = (value: string | null) => {
    if (!value || !value.startsWith("/") || value.startsWith("//")) {
        return null;
    }

    return value;
};

const getReceiveIntroduceReturnTo = (returnTo: string | null) => {
    if (!returnTo) {
        return null;
    }

    const pathname = new URL(returnTo, window.location.origin).pathname;

    return pathname.startsWith("/introduce/") ? returnTo : null;
};

const getRegisterErrorMessage = (error: unknown) => {
    if (isAxiosError(error)) {
        const message = (error.response?.data as { message?: unknown } | undefined)?.message;

        if (typeof message === "string") {
            return message;
        }
    }

    return "회원가입에 실패했어요. 다시 시도해주세요.";
};

function SignupPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const queryClient = useQueryClient();
    const {
        formData,
        currentStep,
        setCurrentStep,
        goPrevStep,
        resetSignupFlow,
    } = useSignupFlow();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitErrorMessage, setSubmitErrorMessage] = useState("");

    const { mutateAsync: registerUser } = useRegisterUserMutation();

    const [showKakaoLoginToast, setShowKakaoLoginToast] = useState(() => {
        const shouldShowToast =
            sessionStorage.getItem(KAKAO_LOGIN_TOAST_STORAGE_KEY) === "true";

        if (shouldShowToast) {
            sessionStorage.removeItem(KAKAO_LOGIN_TOAST_STORAGE_KEY);
        }

        return shouldShowToast;
    });

    const returnTo = getSafeReturnTo(searchParams.get("returnTo"));
    const receiveIntroduceReturnTo = getReceiveIntroduceReturnTo(returnTo);

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

    const handleHeaderBack = () => {
        if (currentStep > 1) {
            goPrevStep();
            return;
        }

        if (receiveIntroduceReturnTo) {
            navigate(receiveIntroduceReturnTo, { replace: true });
            return;
        }

        navigate(-1);
    };

    const handleCompleteSignup = async () => {
        if (isSubmitting) return;

        // Check required fields
        if (!formData.photoFile) {
            setSubmitErrorMessage("프로필 사진을 등록해주세요.");
            setCurrentStep(4);
            return;
        }

        setIsSubmitting(true);
        setSubmitErrorMessage("");

        try {
            // 1. Upload photo to S3
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

            // 2. Register user
            const animalProfile = animalProfileByName[formData.selectedAnimal] || "OTTER";
            const digitsOnly = formData.notificationPhone.replace(/[^0-9]/g, "");
            const notificationPhone = formData.isSmsOptedOut || digitsOnly.length === 0 ? null : digitsOnly;

            const response = await registerUser({
                nickname: formData.nickname.trim(),
                gender: formData.gender === "남성",
                birthYear: Number(formData.birthYear),
                animalProfile,
                mbti: formData.mbti,
                contactType: formData.contactType,
                contact: formData.contact.trim(),
                notificationPhone,
            });

            // 3. Clear draft and invalidate queries
            resetSignupFlow();
            await queryClient.invalidateQueries({ queryKey: authMeQueryKey });
            await queryClient.invalidateQueries({ queryKey: userMeQueryKey });

            // 4. Navigate according to flow and status
            const isIntroduceFriendFlow =
                searchParams.get("flow") === "introduce-friend";

            if (returnTo) {
                navigate(returnTo, { replace: true });
                return;
            }

            if (isIntroduceFriendFlow) {
                navigate("/introduce-friend/generating", { replace: true });
                return;
            }

            if (!response.status.hasIntroduction) {
                navigate("/dating/require-introduce", { replace: true });
                return;
            }

            navigate("/", { replace: true });
        } catch (error) {
            if (reportGlobalErrorIfNeeded(error)) {
                return;
            }
            console.error(error);
            setSubmitErrorMessage(getRegisterErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-grey-100">
            {showKakaoLoginToast ? <Toast message="카카오 로그인 완료!" /> : null}
            <div className="sticky top-0 z-40 bg-grey-100">
                <NotLoginHeader title="회원가입" onBack={handleHeaderBack} />
            </div>

            <main className="px-5 pt-6 pb-[7.5rem]">
                <div className="mx-auto w-full max-w-[22.6875rem]">
                    {currentStep === 1 && <SignupStepBasic />}
                    {currentStep === 2 && <SignupStepAnimal />}
                    {currentStep === 3 && <SignupStepMbti />}
                    {currentStep === 4 && <SignupStepPhoto />}
                    {currentStep === 5 && <SignupStepContact />}
                    {currentStep === 6 && (
                        <SignupStepNotification
                            isSubmitting={isSubmitting}
                            errorMessage={submitErrorMessage}
                            onSubmit={handleCompleteSignup}
                        />
                    )}
                </div>
            </main>
        </div>
    );
}

export default SignupPage;
