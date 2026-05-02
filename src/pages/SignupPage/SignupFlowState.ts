import { createContext } from "react";

export type SignupFormData = {
    nickname: string;
    gender: string;
    birthYear: string;
};

export const initialSignupFormData: SignupFormData = {
    nickname: "",
    gender: "",
    birthYear: "",
};

export type SignupFlowContextValue = {
    signupFormData: SignupFormData;
    setSignupFormData: (nextFormData: SignupFormData) => void;
    selectedAnimal: string;
    setSelectedAnimal: (nextAnimal: string) => void;
    resetSignupFlow: () => void;
};

export const SignupFlowContext =
    createContext<SignupFlowContextValue | null>(null);
