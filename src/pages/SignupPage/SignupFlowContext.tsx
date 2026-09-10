import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

import { SIGNUP_DRAFT_STORAGE_KEY } from "../../constants/storageKeys";
import {
    initialSignupFormData,
    SignupFlowContext,
    type SignupFormData,
} from "./SignupFlowState";

export function SignupFlowProvider({ children }: { children: ReactNode }) {
    const [formData, setFormData] = useState<SignupFormData>(initialSignupFormData);
    const [currentStep, setCurrentStep] = useState<number>(1);

    // 기존에 localStorage에 저장되었을 수 있는 임시 데이터를 정리합니다.
    useEffect(() => {
        try {
            localStorage.removeItem(SIGNUP_DRAFT_STORAGE_KEY);
        } catch {
            // ignore
        }
    }, []);

    const updateFormData = useCallback((patch: Partial<SignupFormData>) => {
        setFormData((prev) => ({
            ...prev,
            ...patch,
        }));
    }, []);

    const goNextStep = useCallback(() => {
        setCurrentStep((prev) => Math.min(prev + 1, 6));
    }, []);

    const goPrevStep = useCallback(() => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    }, []);

    const resetSignupFlow = useCallback(() => {
        setFormData((prev) => {
            if (prev.photoPreviewUrl?.startsWith("blob:")) {
                URL.revokeObjectURL(prev.photoPreviewUrl);
            }
            return initialSignupFormData;
        });
        setCurrentStep(1);
        try {
            localStorage.removeItem(SIGNUP_DRAFT_STORAGE_KEY);
        } catch {
            // ignore
        }
    }, []);

    // Legacy helpers for backwards compatibility
    const signupFormData = useMemo(
        () => ({
            nickname: formData.nickname,
            gender: formData.gender,
            birthYear: formData.birthYear,
        }),
        [formData.birthYear, formData.gender, formData.nickname]
    );

    const setSignupFormData = useCallback(
        (nextFormData: { nickname: string; gender: string; birthYear: string }) => {
            setFormData((prev) => ({
                ...prev,
                nickname: nextFormData.nickname,
                gender: nextFormData.gender as "남성" | "여성" | "",
                birthYear: nextFormData.birthYear,
            }));
        },
        []
    );

    const selectedAnimal = formData.selectedAnimal;
    const setSelectedAnimal = useCallback((nextAnimal: string) => {
        setFormData((prev) => ({
            ...prev,
            selectedAnimal: nextAnimal,
        }));
    }, []);

    const value = useMemo(
        () => ({
            formData,
            updateFormData,
            currentStep,
            setCurrentStep,
            goNextStep,
            goPrevStep,
            resetSignupFlow,
            signupFormData,
            setSignupFormData,
            selectedAnimal,
            setSelectedAnimal,
        }),
        [
            formData,
            updateFormData,
            currentStep,
            goNextStep,
            goPrevStep,
            resetSignupFlow,
            signupFormData,
            setSignupFormData,
            selectedAnimal,
            setSelectedAnimal,
        ]
    );

    return (
        <SignupFlowContext.Provider value={value}>
            {children}
        </SignupFlowContext.Provider>
    );
}
