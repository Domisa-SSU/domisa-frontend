import { createContext } from "react";
import type { ContactType } from "../../api/users";

export type SignupFormData = {
    // Step 1: 기본 정보
    nickname: string;
    isNicknameChecked: boolean;
    gender: "남성" | "여성" | "";
    birthYear: string;
    // Step 2: 동물 프로필
    selectedAnimal: string;
    // Step 3: MBTI
    mbti: string;
    // Step 4: 사진
    photoFile: File | null;
    photoPreviewUrl: string | null;
    // Step 5: 연락처
    contactType: ContactType;
    contact: string;
    // Step 6: 알림 번호
    notificationPhone: string;
    isSmsOptedOut: boolean;
};

export const initialSignupFormData: SignupFormData = {
    nickname: "",
    isNicknameChecked: false,
    gender: "",
    birthYear: "",
    selectedAnimal: "수달",
    mbti: "",
    photoFile: null,
    photoPreviewUrl: null,
    contactType: "INSTAGRAM",
    contact: "",
    notificationPhone: "",
    isSmsOptedOut: false,
};

export type SignupFlowContextValue = {
    formData: SignupFormData;
    updateFormData: (patch: Partial<SignupFormData>) => void;
    currentStep: number;
    setCurrentStep: (step: number) => void;
    goNextStep: () => void;
    goPrevStep: () => void;
    resetSignupFlow: () => void;
    // 하위 호환 필드
    signupFormData: { nickname: string; gender: string; birthYear: string };
    setSignupFormData: (nextFormData: { nickname: string; gender: string; birthYear: string }) => void;
    selectedAnimal: string;
    setSelectedAnimal: (nextAnimal: string) => void;
};

export const SignupFlowContext =
    createContext<SignupFlowContextValue | null>(null);
