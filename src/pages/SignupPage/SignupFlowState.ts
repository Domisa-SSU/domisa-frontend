import { createContext } from "react";

export type SignupFormData = {
    nickname: string;
    gender: string;
    birthYear: string;
    referralCode: string;
    contactMethod: string;
    phonePrefix: string;
    phoneMiddle: string;
    phoneLast: string;
    contactValue: string;
};

export const initialSignupFormData: SignupFormData = {
    nickname: "",
    gender: "",
    birthYear: "2003",
    referralCode: "",
    contactMethod: "",
    phonePrefix: "010",
    phoneMiddle: "",
    phoneLast: "",
    contactValue: "",
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
