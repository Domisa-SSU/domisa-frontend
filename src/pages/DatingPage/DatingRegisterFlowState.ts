import { createContext } from "react";

export type DatingRegisterContactMethod = "INSTAGRAM" | "KAKAO";

export type DatingRegisterFormData = {
  mbti: string;
  romanticStyle: string;
  idealType: string;
  contactMethod: DatingRegisterContactMethod;
  contactValue: string;
  photoFile: File | null;
  photoPreviewUrl: string;
  notificationPhone: string;
  isSmsOptedOut: boolean;
};

export type DatingRegisterFlowContextValue = {
  formData: DatingRegisterFormData;
  currentStep: number;
  selectMbtiLetter: (index: number, letter: string) => void;
  setRomanticStyle: (nextRomanticStyle: string) => void;
  setIdealType: (nextIdealType: string) => void;
  setContactMethod: (nextContactMethod: DatingRegisterContactMethod) => void;
  setContactValue: (nextContactValue: string) => void;
  setPhotoFile: (nextPhotoFile: File) => void;
  setNotificationPhone: (nextNotificationPhone: string) => void;
  setIsSmsOptedOut: (nextIsSmsOptedOut: boolean) => void;
  goNextStep: () => void;
  goPrevStep: () => void;
  resetRegisterFlow: () => void;
};

export const initialDatingRegisterFormData: DatingRegisterFormData = {
  mbti: "",
  romanticStyle: "",
  idealType: "",
  contactMethod: "INSTAGRAM",
  contactValue: "",
  photoFile: null,
  photoPreviewUrl: "",
  notificationPhone: "",
  isSmsOptedOut: false,
};

export const DatingRegisterFlowContext =
  createContext<DatingRegisterFlowContextValue | null>(null);
