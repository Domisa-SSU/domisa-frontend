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

type PersistedDraft = Omit<SignupFormData, "photoFile" | "photoPreviewUrl"> & {
    currentStep?: number;
};

const loadDraftFromStorage = (): {
    formData: SignupFormData;
    initialStep: number;
} => {
    if (typeof window === "undefined") {
        return { formData: initialSignupFormData, initialStep: 1 };
    }

    try {
        const raw = localStorage.getItem(SIGNUP_DRAFT_STORAGE_KEY);
        if (!raw) {
            return { formData: initialSignupFormData, initialStep: 1 };
        }

        const parsed = JSON.parse(raw) as PersistedDraft;
        return {
            formData: {
                ...initialSignupFormData,
                nickname: typeof parsed.nickname === "string" ? parsed.nickname : "",
                isNicknameChecked: parsed.isNicknameChecked === true,
                gender: parsed.gender === "남성" || parsed.gender === "여성" ? parsed.gender : "",
                birthYear: typeof parsed.birthYear === "string" ? parsed.birthYear : "",
                selectedAnimal: typeof parsed.selectedAnimal === "string" ? parsed.selectedAnimal : "수달",
                mbti: typeof parsed.mbti === "string" ? parsed.mbti : "",
                contactType: parsed.contactType === "KAKAO" ? "KAKAO" : "INSTAGRAM",
                contact: typeof parsed.contact === "string" ? parsed.contact : "",
                notificationPhone: typeof parsed.notificationPhone === "string" ? parsed.notificationPhone : "",
                isSmsOptedOut: parsed.isSmsOptedOut === true,
                photoFile: null,
                photoPreviewUrl: null,
            },
            initialStep: typeof parsed.currentStep === "number" && parsed.currentStep >= 1 && parsed.currentStep <= 6
                ? parsed.currentStep
                : 1,
        };
    } catch (e) {
        console.warn("Failed to load signup draft from storage", e);
        return { formData: initialSignupFormData, initialStep: 1 };
    }
};

export function SignupFlowProvider({ children }: { children: ReactNode }) {
    const [{ formData: initialData, initialStep }] = useState(loadDraftFromStorage);
    const [formData, setFormData] = useState<SignupFormData>(initialData);
    const [currentStep, setCurrentStep] = useState<number>(initialStep);

    // Save draft to localStorage (excluding photoFile and photoPreviewUrl)
    useEffect(() => {
        try {
            const draftToSave: PersistedDraft = {
                nickname: formData.nickname,
                isNicknameChecked: formData.isNicknameChecked,
                gender: formData.gender,
                birthYear: formData.birthYear,
                selectedAnimal: formData.selectedAnimal,
                mbti: formData.mbti,
                contactType: formData.contactType,
                contact: formData.contact,
                notificationPhone: formData.notificationPhone,
                isSmsOptedOut: formData.isSmsOptedOut,
                currentStep,
            };
            localStorage.setItem(SIGNUP_DRAFT_STORAGE_KEY, JSON.stringify(draftToSave));
        } catch (e) {
            console.warn("Failed to save signup draft to storage", e);
        }
    }, [formData, currentStep]);

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
        if (formData.photoPreviewUrl?.startsWith("blob:")) {
            URL.revokeObjectURL(formData.photoPreviewUrl);
        }
        try {
            localStorage.removeItem(SIGNUP_DRAFT_STORAGE_KEY);
        } catch (e) {
            console.warn("Failed to remove signup draft from storage", e);
        }
        setFormData(initialSignupFormData);
        setCurrentStep(1);
    }, [formData.photoPreviewUrl]);

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
