import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
    completeProfileImageUpload,
    createProfileImageUploadUrl,
    uploadProfileImageToS3,
} from "../../api/s3";
import NotLoginHeader from "../../components/NotLoginHeader";
import Toast from "../../components/Toast";
import { animalProfileByName } from "../../constants/animalProfile";
import { KAKAO_LOGIN_TOAST_STORAGE_KEY } from "../../constants/storageKeys";
import { useRegisterUserMutation } from "../../queries/users";
import { reportGlobalErrorIfNeeded } from "../../stores/globalErrorStore";
import { track } from "../../utils/mixpanel";
import {
    getPostSignupPath,
    isReceiveIntroducePath,
} from "../../utils/postSignupPath";

import { SignupStepBasic } from "./components/SignupStepBasic";
import { SignupStepAnimal } from "./components/SignupStepAnimal";
import { SignupStepMbti } from "./components/SignupStepMbti";
import { SignupStepPhoto } from "./components/SignupStepPhoto";
import { SignupStepContact } from "./components/SignupStepContact";
import { SignupStepNotification } from "./components/SignupStepNotification";
import { useSignupFlow } from "./useSignupFlow";

/**
 * 퍼널에서 각 단계를 사람이 읽을 수 있게 하기 위한 이름.
 * 숫자만 남기면 나중에 단계를 끼워넣었을 때 지표 해석이 어긋난다.
 */
const signupStepNames: Record<number, string> = {
    1: "basic",
    2: "animal",
    3: "mbti",
    4: "photo",
    5: "contact",
    6: "notification",
};

const getSafeReturnTo = (value: string | null) => {
    if (!value || !value.startsWith("/") || value.startsWith("//")) {
        return null;
    }

    return value;
};

const getReceiveIntroduceReturnTo = (returnTo: string | null) =>
    returnTo && isReceiveIntroducePath(returnTo) ? returnTo : null;

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

    useEffect(() => {
        return () => {
            resetSignupFlow();
        };
    }, [resetSignupFlow]);

    // 어느 단계에서 이탈하는지 보려면 단계 도달을 매번 남겨야 한다.
    useEffect(() => {
        track("signup_step_viewed", {
            step: currentStep,
            step_name: signupStepNames[currentStep] ?? "unknown",
        });
    }, [currentStep]);

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
        track("signup_submitted");

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

            /**
             * 3. Clear draft
             * authMe/userMe 무효화는 useRegisterUserMutation 의 onSuccess 가 이미 끝내고 돌아온다.
             * 여기서 또 기다리면 그 사이 authMe 가 가입 완료로 바뀐 걸 본 CompletedFlowRoute 가
             * 아래 이동보다 먼저 화면을 되돌려버린다.
             */
            resetSignupFlow();

            track("signup_completed", {
                nickname_source: formData.isNicknameRandom ? "random" : "typed",
                contact_type: formData.contactType,
                has_notification_phone: notificationPhone !== null,
                animal_profile: animalProfile,
            });

            // 4. Navigate according to flow and status
            navigate(getPostSignupPath(response.status, returnTo), { replace: true });
        } catch (error) {
            track("signup_failed", {
                status: isAxiosError(error) ? error.response?.status : undefined,
            });

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
