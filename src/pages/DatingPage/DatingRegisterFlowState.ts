import { createContext } from "react";

export type DatingRegisterFormData = {
  mbti: string;
  romanticStyle: string;
  idealType: string;
  photoFile: File | null;
  photoPreviewUrl: string;
};

export type DatingRegisterFlowContextValue = {
  formData: DatingRegisterFormData;
  currentStep: number;
  selectMbtiLetter: (index: number, letter: string) => void;
  setRomanticStyle: (nextRomanticStyle: string) => void;
  setIdealType: (nextIdealType: string) => void;
  setPhotoFile: (nextPhotoFile: File) => void;
  goNextStep: () => void;
  goPrevStep: () => void;
  resetRegisterFlow: () => void;
};

export const initialDatingRegisterFormData: DatingRegisterFormData = {
  mbti: "",
  romanticStyle: "",
  idealType: "",
  photoFile: null,
  photoPreviewUrl: "",
};

export const DatingRegisterFlowContext =
  createContext<DatingRegisterFlowContextValue | null>(null);
